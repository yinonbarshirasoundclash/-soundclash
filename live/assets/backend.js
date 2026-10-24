/* =========================================================================
   שכבת הנתונים. שתי גרסאות עם אותו ממשק:
   LocalBackend    — מצב הדגמה, הכל בדפדפן הזה (מסונכרן בין לשוניות)
   FirebaseBackend — מצב חי, Firestore + כניסה אנונימית לקהל
   ========================================================================= */
(function () {
  "use strict";

  const safeStore = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const rid = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n || 10)), b => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");

  function initialState(cfg) {
    return {
      v: 1, phase: "lobby", round: 0, order: {},
      voteSeconds: cfg.VOTE_SECONDS || 20, votingEndsAt: 0, liveBars: cfg.SHOW_LIVE_BARS !== false, voteDuringSongs: true,
      results: {}, raffle: null,
      video: { key: "", cmd: "stop", seq: 0 },
      screen: { overlay: true, qr: false }, promo: null,
      updatedAt: Date.now()
    };
  }

  /* ------------------------------------------------------------------ */
  class Emitter {
    constructor() { this.l = {}; }
    on(t, f) { (this.l[t] = this.l[t] || new Set()).add(f); return () => this.l[t].delete(f); }
    emit(t, ...a) { (this.l[t] || []).forEach(f => { try { f(...a); } catch (e) { console.error(e); } }); }
  }

  /* ================== LOCAL (demo) ================== */
  class LocalBackend extends Emitter {
    constructor(cfg) {
      super();
      this.cfg = cfg; this.mode = "demo";
      this.reactions = [];
      let id = null; try { id = sessionStorage.getItem("sc_uid"); } catch (e) { /* ignore */ }
      if (!id) { id = "u_" + rid(8); try { sessionStorage.setItem("sc_uid", id); } catch (e) { /* ignore */ } }
      this._uid = id;
      this._saveT = 0;
    }
    async init() { return this; }
    /* which show is running (the admin picks it); every open screen follows */
    async getActiveShow() { return safeStore.get("sc_local_active", null); }
    async setActiveShow(id) { safeStore.set("sc_local_active", id); try { new BroadcastChannel("sc_active").postMessage(id); } catch (e) { /* ignore */ } this.emit("active", id); }
    onActiveShow(cb) {
      try { const ch = new BroadcastChannel("sc_active"); ch.onmessage = (e) => cb(e.data); } catch (e) { /* ignore */ }
      return this.on("active", cb);
    }
    bindShow(id) {
      this.cfg.SHOW_ID = id;
      this.key = "sc_local_" + id;
      this.db = safeStore.get(this.key, null) || { state: initialState(this.cfg), votes: {}, players: {}, screen: {} };
      try { this.bc = new BroadcastChannel("sc_" + id); this.bc.onmessage = (e) => this._apply(e.data, false); } catch (e) { this.bc = null; }
    }
    online() { return true; }
    uid() { return this._uid; }
    isLive() { return false; }
    _persist() { clearTimeout(this._saveT); this._saveT = setTimeout(() => safeStore.set(this.key, this.db), 120); }
    _op(op) { this._apply(op, true); if (this.bc) try { this.bc.postMessage(op); } catch (e) { /* ignore */ } }
    _apply(op, local) {
      const d = this.db;
      switch (op.k) {
        case "state": d.state = op.v; this.emit("state", d.state); break;
        case "vote": d.votes[op.v.id] = op.v; this.emit("votes", op.v.r); break;
        case "player": d.players[op.v.uid] = Object.assign(d.players[op.v.uid] || {}, op.v); this.emit("players"); break;
        case "react": this.reactions.push(op.v); if (this.reactions.length > 80) this.reactions.shift(); this.emit("react", op.v); break;
        case "screen": d.screen = op.v; this.emit("screen", d.screen); break;
        case "lyrics": d.lyrics = d.lyrics || {}; if (op.v.text) d.lyrics[op.v.key] = op.v; else delete d.lyrics[op.v.key]; this.emit("lyrics"); break;
        case "facts": d.facts = d.facts || {}; if (op.v.fact || op.v.scene) d.facts[op.v.key] = op.v; else delete d.facts[op.v.key]; this.emit("facts"); break;
        case "reset": this.db = { state: op.v, votes: {}, players: {}, screen: d.screen || {}, lyrics: d.lyrics || {}, facts: d.facts || {} }; this.emit("state", this.db.state); this.emit("votes", -1); this.emit("players"); break;
      }
      if (local && op.k !== "react") this._persist();
    }
    onState(cb) { setTimeout(() => cb(this.db.state), 0); return this.on("state", cb); }
    async setState(patch) {
      const s = Object.assign({}, this.db.state, patch, { updatedAt: Date.now() });
      if (patch.results) s.results = Object.assign({}, this.db.state.results, patch.results);
      this._op({ k: "state", v: s });
    }
    _votesFor(r) { return Object.values(this.db.votes).filter(v => v.r === r); }
    onVotes(r, cb) { setTimeout(() => cb(this._votesFor(r)), 0); return this.on("votes", (rr) => { if (rr === r || rr === -1) cb(this._votesFor(r)); }); }
    async getVotes(r) { return this._votesFor(r); }
    async vote(r, side, meta, asUid) {
      const uid = asUid || this._uid, id = r + "_" + uid, prev = this.db.votes[id], now = Date.now();
      const st = this.db.state, ph = st.phase;
      const open = ph === "voting" || ((ph === "song1" || ph === "song2") && st.voteDuringSongs !== false);
      if (!open || st.round !== r) throw new Error("closed");
      this._op({ k: "vote", v: { id, r, side, uid, ticket: meta.ticket, name: meta.name || "", at: now, firstAt: prev ? prev.firstAt : now } });
    }
    async join(p, asUid) { const uid = asUid || this._uid; this._op({ k: "player", v: Object.assign({}, p, { uid, joinedAt: (this.db.players[uid] || {}).joinedAt || Date.now() }) }); }
    async updatePlayer(p, asUid) { const uid = asUid || this._uid; this._op({ k: "player", v: Object.assign({}, p, { uid }) }); }
    getPlayer(asUid) { return this.db.players[asUid || this._uid] || null; }
    onPlayers(cb) { setTimeout(() => cb(Object.values(this.db.players)), 0); return this.on("players", () => cb(Object.values(this.db.players))); }
    async react(counts, asUid) { this._op({ k: "react", v: { c: counts, uid: asUid || this._uid, at: Date.now() } }); }
    onReactions(cb) { return this.on("react", cb); }
    onScreenMeta(cb) { setTimeout(() => cb(this.db.screen || {}), 0); return this.on("screen", cb); }
    /* lyrics typed in by the admin, one doc per song key (03-tv) */
    async getLyrics(key) { return (this.db.lyrics || {})[key] || null; }
    async setLyrics(key, text) { this._op({ k: "lyrics", v: { key, text, at: Date.now() } }); }
    onLyricsList(cb) { const f = () => cb(Object.assign({}, this.db.lyrics || {})); setTimeout(f, 0); return this.on("lyrics", f); }
    /* the admin's own wording for a song's fact / scene text, one doc per song key */
    async setFact(key, v) { this._op({ k: "facts", v: { key, fact: v.fact || "", scene: v.scene || "", base: v.base || "", at: Date.now() } }); }
    onFactsList(cb) { const f = () => cb(Object.assign({}, this.db.facts || {})); setTimeout(f, 0); return this.on("facts", f); }
    async setScreenMeta(m) { this._op({ k: "screen", v: Object.assign({}, m, { at: Date.now() }) }); }
    async resetShow() { this._op({ k: "reset", v: initialState(this.cfg) }); }
    /* admin */
    adminUser() { return { email: "demo" }; }
    async signIn() { return true; }
    async signOut() { return true; }
    onAuth(cb) { setTimeout(() => cb(this.adminUser()), 0); return () => {}; }
  }

  /* ================== FIREBASE (live) ================== */
  const FB_VER = "10.14.1";
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      const s = document.createElement("script"); s.src = src; s.async = false;
      s.onload = () => res(); s.onerror = () => rej(new Error("load " + src)); document.head.appendChild(s);
    });
  }
  const toMs = (v) => (v && typeof v.toMillis === "function") ? v.toMillis() : (typeof v === "number" ? v : (v ? +new Date(v) : 0));
  function norm(d) {
    const o = Object.assign({}, d);
    ["at", "firstAt", "joinedAt", "updatedAt"].forEach(k => { if (k in o) o[k] = toMs(o[k]); });
    return o;
  }

  class FirebaseBackend extends Emitter {
    constructor(cfg) { super(); this.cfg = cfg; this.mode = "live"; this._first = {}; this.players = new Map(); }
    isLive() { return true; }
    async init() {
      const base = "https://www.gstatic.com/firebasejs/" + FB_VER + "/";
      await loadScript(base + "firebase-app-compat.js");
      await loadScript(base + "firebase-auth-compat.js");
      await loadScript(base + "firebase-firestore-compat.js");
      const fb = window.firebase;
      this.app = fb.apps.length ? fb.app() : fb.initializeApp(this.cfg.FIREBASE);
      this.auth = fb.auth(); this.fs = fb.firestore(); this.FV = fb.firestore.FieldValue;
      await new Promise((res) => { const u = this.auth.onAuthStateChanged(() => { u(); res(); }); });
      if (!this.auth.currentUser) await this.auth.signInAnonymously();
      this.activeRef = this.fs.collection("live").doc("active");
      return this;
    }
    async getActiveShow() { const s = await this.activeRef.get(); return s.exists ? s.data().showId : null; }
    async setActiveShow(id) { await this.activeRef.set({ showId: id, at: this.FV.serverTimestamp() }); }
    onActiveShow(cb) { return this.activeRef.onSnapshot(s => { if (s.exists) cb(s.data().showId); }, () => {}); }
    bindShow(id) {
      this.cfg.SHOW_ID = id;
      this.show = this.fs.collection("shows").doc(id);
      try { this._first = JSON.parse(localStorage.getItem("sc_first_" + id) || "{}"); } catch (e) { this._first = {}; }
    }
    uid() { return this.auth.currentUser ? this.auth.currentUser.uid : ""; }
    online() { return this._online !== false; }
    _setOnline(v) { if (v !== this._online) { this._online = v; this.emit("conn", v); } }
    onState(cb) {
      window.addEventListener("offline", () => this._setOnline(false));
      window.addEventListener("online", () => setTimeout(() => this._setOnline(navigator.onLine), 1500));
      /* when the connection drops, Firestore keeps serving the last known state from cache —
         the screen simply keeps showing the last result instead of an error */
      return this.show.onSnapshot({ includeMetadataChanges: true }, s => {
        this._setOnline(!s.metadata.fromCache && navigator.onLine !== false);
        this._exists = s.exists;
        if (!s.metadata.hasPendingWrites || !this._lastState) { this._lastState = s.exists ? norm(s.data()) : initialState(this.cfg); }
        cb(s.exists ? norm(s.data()) : initialState(this.cfg));
      }, e => this.emit("error", e));
    }
    async setState(patch) {
      /* first write of a new show: lay down the full initial state, so every field exists */
      const base = this._exists === false ? initialState(this.cfg) : {};
      const p = Object.assign(base, patch, { updatedAt: this.FV.serverTimestamp() });
      await this.show.set(p, { merge: true });
    }
    onVotes(r, cb) {
      return this.show.collection("votes").where("r", "==", r).onSnapshot(qs => cb(qs.docs.map(d => norm(d.data()))), e => this.emit("error", e));
    }
    async getVotes(r) {
      const qs = await this.show.collection("votes").where("r", "==", r).get({ source: "server" });
      return qs.docs.map(d => norm(d.data()));
    }
    async vote(r, side, meta) {
      const uid = this.uid(), ref = this.show.collection("votes").doc(r + "_" + uid);
      const doc = { r, side, uid, ticket: meta.ticket || "", name: meta.name || "", at: this.FV.serverTimestamp() };
      if (!this._first[r]) doc.firstAt = this.FV.serverTimestamp();
      await ref.set(doc, { merge: true });
      this._first[r] = 1; try { localStorage.setItem("sc_first_" + this.cfg.SHOW_ID, JSON.stringify(this._first)); } catch (e) { /* ignore */ }
    }
    async join(p) {
      await this.show.collection("players").doc(this.uid()).set(Object.assign({}, p, { uid: this.uid(), joinedAt: this.FV.serverTimestamp() }), { merge: true });
    }
    async updatePlayer(p) { await this.show.collection("players").doc(this.uid()).set(Object.assign({}, p, { uid: this.uid() }), { merge: true }); }
    async fetchPlayer() { const s = await this.show.collection("players").doc(this.uid()).get(); return s.exists ? norm(s.data()) : null; }
    getPlayer() { return null; }
    onPlayers(cb) {
      return this.show.collection("players").onSnapshot(qs => cb(qs.docs.map(d => norm(d.data()))), e => this.emit("error", e));
    }
    async react(counts) { await this.show.collection("reactions").add({ c: counts, uid: this.uid(), at: this.FV.serverTimestamp() }); }
    onReactions(cb) {
      const since = new Date(Date.now() - 2000);
      return this.show.collection("reactions").where("at", ">", since).onSnapshot(qs => {
        qs.docChanges().forEach(ch => { if (ch.type === "added") cb(norm(ch.doc.data())); });
      }, e => this.emit("error", e));
    }
    onScreenMeta(cb) { return this.show.collection("meta").doc("screen").onSnapshot(s => cb(s.exists ? norm(s.data()) : {}), () => {}); }
    async getLyrics(key) { const s = await this.show.collection("lyrics").doc(key).get(); return s.exists ? norm(s.data()) : null; }
    async setLyrics(key, text) {
      const ref = this.show.collection("lyrics").doc(key);
      if (text) await ref.set({ key, text, at: this.FV.serverTimestamp() }); else await ref.delete();
    }
    onLyricsList(cb) {
      return this.show.collection("lyrics").onSnapshot(qs => { const o = {}; qs.docs.forEach(d => { o[d.id] = norm(d.data()); }); cb(o); }, () => {});
    }
    async setFact(key, v) {
      const ref = this.show.collection("facts").doc(key);
      if (v.fact || v.scene) await ref.set({ key, fact: v.fact || "", scene: v.scene || "", base: v.base || "", at: this.FV.serverTimestamp() }); else await ref.delete();
    }
    onFactsList(cb) {
      return this.show.collection("facts").onSnapshot(qs => { const o = {}; qs.docs.forEach(d => { o[d.id] = norm(d.data()); }); cb(o); }, () => {});
    }
    async setScreenMeta(m) { await this.show.collection("meta").doc("screen").set(Object.assign({}, m, { at: this.FV.serverTimestamp() })); }
    async resetShow() {
      for (const col of ["votes", "players", "reactions"]) {
        for (;;) {
          const qs = await this.show.collection(col).limit(400).get();
          if (qs.empty) break;
          const b = this.fs.batch(); qs.docs.forEach(d => b.delete(d.ref)); await b.commit();
        }
      }
      await this.show.set(Object.assign(initialState(this.cfg), { updatedAt: this.FV.serverTimestamp() }));
    }
    adminUser() { const u = this.auth.currentUser; return u && !u.isAnonymous ? { email: u.email } : null; }
    async signIn(email, pw) { await this.auth.signInWithEmailAndPassword(email, pw); return true; }
    async signOut() { await this.auth.signOut(); await this.auth.signInAnonymously(); }
    onAuth(cb) { return this.auth.onAuthStateChanged(() => cb(this.adminUser())); }
  }

  window.SCBackend = {
    create(cfg, forceLocal) { return cfg.FIREBASE && !forceLocal ? new FirebaseBackend(cfg) : new LocalBackend(cfg); },
    initialState, safeStore, rid
  };
})();

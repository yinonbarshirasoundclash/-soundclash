/* =========================================================================
   SOUNDCLASH · סדרות נגד סרטים — האפליקציה
   שלושה מסכים מאותו קוד:  קהל (טלפון) · במה (מקרן) · אדמין (שליטה)
   ========================================================================= */
(function () {
  "use strict";
  const CFG = window.SC_CONFIG;
  /* the active show (chosen by the admin) decides setlist, sides and wording */
  let SHOW, SET, N, SIDE, L;
  function useShow(id) {
    const all = window.SC_SHOWS || {};
    SHOW = all[id] || all[CFG.DEFAULT_SHOW] || all[Object.keys(all)[0]];
    SET = SHOW.setlist; N = SET.length;
    SIDE = { tv: SHOW.sides.tv, film: SHOW.sides.film };
    L = { tv: SIDE.tv.latin, film: SIDE.film.latin };
    CFG.SHOW_ID = SHOW.id;
    document.documentElement.classList.add("show-" + SHOW.theme);
    window.SC_ART_RESOLVE = (key) => { const x = keyInfo(key); const sg = x && songOf(x.r, x.side); return sg && sg.art; };
    return SHOW;
  }
  const { safeStore, rid } = window.SCBackend;

  /* ---------------- helpers ---------------- */
  function h(tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "style" && typeof v === "object") { for (const sk in v) { if (sk.startsWith("--")) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (let i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(x => add(el, x)); return; }
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  const bdi = (t, cls) => h("bdi", { dir: "auto", class: cls || null }, t);
  const pad = (n) => String(n).padStart(2, "0");
  const pct = (a, t) => t ? Math.round(a * 100 / t) : 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const other = (s) => s === "tv" ? "film" : "tv";
  /* reads the lyrics the user pastes from the previous app's app.py (battles + encores) */
  const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]+/g, "");
  function parseOldLyrics(src) {
    const out = [];
    const unq = (v) => v.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\r/g, "").trim();
    const str = (k) => '"' + k + '"\\s*:\\s*(?:"""([\\s\\S]*?)"""|"((?:[^"\\\\]|\\\\.)*)")';
    const val = (blk, k) => { const m = blk.match(new RegExp(str(k))); return m ? unq(m[1] !== undefined ? m[1] : m[2]) : null; };
    const ei = src.indexOf("encores");
    const battles = ei > 0 ? src.slice(0, ei) : src;
    battles.split(/\{\s*"round"/).slice(1).forEach(p => {
      const b = '"round"' + p;
      [["usa_song", "usa_lyrics"], ["uk_song", "uk_lyrics"]].forEach(([sk, lk]) => { const song = val(b, sk), text = val(b, lk); if (song && text) out.push({ song, text }); });
    });
    if (ei >= 0) {
      const enc = src.slice(ei);
      enc.split(/"(?:USA|UK)"\s*:\s*\{/).slice(1).forEach(b => { const song = val(b, "song"), text = val(b, "lyrics"); if (song && text) out.push({ song, text }); });
    }
    return out;
  }
  /* lyrics open on a licensed lyrics site; the app never shows lyrics itself */
  function lyricsUrl(s) {
    if (s.hebrew) return "https://www.google.com/search?q=" + encodeURIComponent((s.medley ? s.medley.join(" ") : s.title) + " " + s.artist + " מילים שירונט");
    return "https://genius.com/search?q=" + encodeURIComponent(s.title.replace(/\(.*?\)/g, " ").replace(/\s+/g, " ").trim() + " " + s.artist);
  }

  /* ---------------- show logic ---------------- */
  const firstSide = (st, r) => (st.order && st.order[r]) || SET[r].first || "tv";
  const sideOrder = (st, r) => firstSide(st, r) === "tv" ? ["tv", "film"] : ["film", "tv"];
  function playingSide(st) {
    if (st.phase === "song1") return sideOrder(st, st.round)[0];
    if (st.phase === "song2") return sideOrder(st, st.round)[1];
    return null;
  }
  /* "03-usa", "03-tv" … and "enc-uk" for encores */
  const videoKey = (r, side) => (r === "enc" ? "enc" : pad(r + 1)) + "-" + SIDE[side].slug;
  /* FACTS: the admin's edits to a song's fact / scene text (stored per song key); the setlist file holds the originals */
  let FACTS = {};
  const baseSong = (r, side) => r === "enc" ? (SHOW.encores || {})[side] : SET[r][side];
  const songOf = (r, side) => {
    const s = baseSong(r, side), o = s && FACTS[videoKey(r, side)];
    if (!o) return s;
    const m = Object.assign({}, s);
    if (o.fact) m.fact = o.fact;
    if (o.scene) m.scene = o.scene;
    return m;
  };
  function keyInfo(key) {
    const m = /^(\d\d|enc)-(\w+)$/.exec(key || ""); if (!m) return null;
    const side = SIDE.tv.slug === m[2] ? "tv" : SIDE.film.slug === m[2] ? "film" : null; if (!side) return null;
    return { r: m[1] === "enc" ? "enc" : +m[1] - 1, side };
  }
  const roundLabel = (r) => r === "enc" ? "הדרן" : "דו־קרב " + pad(r + 1);
  const meta = (s) => s.source ? [bdi(s.artist), " · ", s.source] : [bdi(s.artist)];
  function tally(votes) {
    const t = { tv: 0, film: 0, total: 0 };
    votes.forEach(v => { if (v.side === "tv" || v.side === "film") { t[v.side]++; t.total++; } });
    return t;
  }
  function scoreboard(st) {
    const s = { tv: 0, film: 0, tvVotes: 0, filmVotes: 0, played: 0 };
    const res = st.results || {};
    for (let r = 0; r < N; r++) {
      const x = res[r]; if (!x) continue;
      s.played++; s.tvVotes += x.tv || 0; s.filmVotes += x.film || 0;
      if (x.winner === "tv") s.tv++; else if (x.winner === "film") s.film++;
    }
    return s;
  }
  function champion(st) {
    const s = scoreboard(st);
    if (s.tv !== s.film) return s.tv > s.film ? "tv" : "film";
    if (s.tvVotes !== s.filmVotes) return s.tvVotes > s.filmVotes ? "tv" : "film";
    return "tie";
  }
  const PHASES = ["lobby", "intro", "song1", "song2", "voting", "reveal", "final", "raffle", "encore"];
  function phaseTitle(st) {
    const r = st.round, d = SET[r];
    switch (st.phase) {
      case "lobby": return { eyebrow: "לפני המופע", title: "הזירה פתוחה", sub: "הקהל סורק את הקוד ונכנס" };
      case "intro": return { eyebrow: "דו־קרב " + pad(r + 1) + " / " + N, title: d.theme, sub: "הצגת הנושא והצדדים" };
      case "song1": case "song2": {
        const sd = playingSide(st), sg = songOf(r, sd);
        return { eyebrow: (st.phase === "song1" ? "שיר ראשון" : "שיר שני") + " · " + SIDE[sd].team, title: sg.title, sub: sg.artist + (sg.source ? " · " + sg.source : "") };
      }
      case "voting": return { eyebrow: "דו־קרב " + pad(r + 1), title: "ספירה לאחור להצבעה", sub: d.theme };
      case "reveal": return { eyebrow: "דו־קרב " + pad(r + 1), title: "התוצאה", sub: d.theme };
      case "final": return { eyebrow: "סוף הקרב", title: "האלופים של הערב", sub: "" };
      case "raffle": return { eyebrow: "פרס", title: "ההגרלה הגדולה", sub: "" };
      case "encore": return { eyebrow: "", title: "הדרן", sub: "" };
    }
    return { eyebrow: "", title: "", sub: "" };
  }

  /* ---------------- confetti ---------------- */
  function confetti(canvas, colors, power) {
    if (!canvas || reduceMotion()) return;
    const ctx = canvas.getContext("2d"), W = canvas.width = canvas.clientWidth * (devicePixelRatio || 1), H = canvas.height = canvas.clientHeight * (devicePixelRatio || 1);
    const n = Math.round(160 * (power || 1)), ps = [];
    for (let i = 0; i < n; i++) ps.push({
      x: W * (0.15 + Math.random() * 0.7), y: H * 0.55 + Math.random() * H * 0.1,
      vx: (Math.random() - 0.5) * W * 0.012, vy: -(H * (0.012 + Math.random() * 0.018)),
      r: (6 + Math.random() * 10) * (devicePixelRatio || 1) * (W > 1500 ? 1.6 : 1), a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.3,
      c: colors[i % colors.length], life: 0
    });
    let raf;
    (function step() {
      ctx.clearRect(0, 0, W, H); let alive = 0;
      ps.forEach(p => {
        p.life++; p.vy += H * 0.00045; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        if (p.y < H + 40) alive++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - p.life / 220); ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
      });
      if (alive) raf = requestAnimationFrame(step); else ctx.clearRect(0, 0, W, H);
    })();
    return () => cancelAnimationFrame(raf);
  }
  const SIDE_COLORS = { tv: ["#5d8fd6", "#9cc0f2", "#2f5a99", "#f4efe6"], film: ["#e8a33d", "#f6cf86", "#b8792a", "#f4efe6"], tie: ["#e8a33d", "#5d8fd6", "#f4efe6"] };

  /* ---------------- film-leader countdown ---------------- */
  function leader(cls) {
    const num = h("span", { class: "leader-num" }, "");
    const el = h("div", { class: "leader " + (cls || "") },
      h("div", { class: "leader-sweep" }), h("div", { class: "leader-ring" }), h("div", { class: "leader-cross" }), num);
    el.set = (secs, frac) => { num.textContent = secs; el.style.setProperty("--p", clamp(frac, 0, 1)); el.classList.toggle("is-low", secs <= 5); };
    return el;
  }

  /* =========================================================================
     AUDIENCE (phone)
     ========================================================================= */
  class AudienceView {
    constructor(root, be, opts) {
      this.root = root; this.be = be; this.opts = opts || {};
      this.pkey = "sc_me_" + CFG.SHOW_ID + (this.opts.demo ? "_demo" : "");
      this.me = safeStore.get(this.pkey, null);
      this.st = null; this.myVotes = (this.me && this.me.votes) || {};
      this.sheet = null; this.pending = {}; this.lastFlush = 0; this._celebrated = {};
      root.classList.add("aud");
      root.setAttribute("dir", "rtl");
      this.top = h("header", { class: "aud-top" });
      this.main = h("main", { class: "aud-main", id: "aud-main" });
      this.reactBar = h("nav", { class: "aud-react", "aria-label": "תגובות" });
      this.fx = h("div", { class: "aud-fx", "aria-hidden": "true" });
      this.canvas = h("canvas", { class: "aud-confetti", "aria-hidden": "true" });
      this.sheetEl = h("div", { class: "aud-sheet", hidden: true });
      root.append(this.top, this.main, this.reactBar, this.fx, this.canvas, this.sheetEl);
      this.buildReactBar();
      be.onState(st => { this.st = st; this.render(); });
      this.tick = setInterval(() => this.tickClock(), 250);
      if (!this.me && be.fetchPlayer) be.fetchPlayer().then(p => { if (p && !this.me) { this.me = { ticket: p.ticket, name: p.name || "", prediction: p.prediction || null, votes: {} }; this.save(); this.render(); } }).catch(() => {});
    }
    save() { if (this.me) { this.me.votes = this.myVotes; safeStore.set(this.pkey, this.me); } }
    renderTop() {
      this.top.replaceChildren(
        h("div", { class: "brand" }, h("span", { class: "brand-word" }, "SOUND", h("b", null, "CLASH")), h("span", { class: "brand-sub" }, SHOW.title)),
        h("div", { class: "aud-top-act" },
          h("button", { class: "contact-chip", type: "button", onclick: () => this.openSheet("contact") }, h("span", { "aria-hidden": "true" }, "📞"), "צרו קשר"),
          this.me ? h("button", { class: "me-chip", type: "button", onclick: () => this.openSheet("me"), "aria-label": "הערב שלי" }, "הערב שלי") : null)
      );
    }
    render() {
      const st = this.st; if (!st) return;
      this.renderTop();
      const ph = st.phase;
      this.root.dataset.phase = ph;
      const showReact = this.me && (ph === "lobby" || ph === "intro" || ph === "song1" || ph === "song2" || ph === "encore");
      this.reactBar.hidden = !showReact;
      this.root.classList.toggle("has-react", !!showReact);
      let view;
      if (!this.me) view = this.vJoin();
      else if (ph === "lobby") view = this.vLobby();
      else if (ph === "intro" || ph === "song1" || ph === "song2") view = this.vDuel();
      else if (ph === "voting") view = this.vVoting();
      else if (ph === "reveal") view = this.vReveal();
      else if (ph === "final") view = this.vFinal();
      else if (ph === "raffle") view = this.vRaffle();
      else view = this.vEncore();
      const promoOn = this.promoActive();
      if (promoOn) view = h("div", { class: "promo-wrap" }, this.promoCard(), view);
      const key = (promoOn ? "promo" + st.promo.seq : "") + (this.me ? "in" : "out") + ph + st.round + (ph === "lobby" ? (this.me && this.me.prediction) : "") + (ph === "raffle" ? JSON.stringify(st.raffle) : "") + (["voting", "song1", "song2"].includes(ph) ? (this.myVotes[st.round] || "") + (st.voteDuringSongs !== false) : "") + (ph === "reveal" ? JSON.stringify((st.results || {})[st.round] || {}) : "") + (ph === "encore" ? st.encoreSide || "" : "");
      if (key !== this._key) {
        this._key = key;
        this.main.replaceChildren(view);
        this.main.scrollTop = 0;
        this.tickClock();
        if (ph === "reveal") this.celebrateReveal();
        if (ph === "raffle" && st.raffle && st.raffle.uid === this.be.uid()) confetti(this.canvas, SIDE_COLORS.tie, 1.4);
      }
    }
    promoActive() {
      const p = this.st && this.st.promo;
      if (!p || !p.at) return false;
      const left = p.at + 25000 - Date.now();
      if (left <= 0) return false;
      clearTimeout(this._promoT); this._promoT = setTimeout(() => { this._key = null; this.render(); }, left + 50);
      return true;
    }
    promoCard() {
      return h("div", { class: "card promo" },
        h("p", { class: "promo-k" }, "הלהקה מבקשת"),
        h("h2", { class: "aud-h2" }, "עקבו אחרינו עכשיו"),
        this.followCard(true));
    }
    followCard(bare) {
      const C = CFG.CONTACT;
      const row = h("div", { class: "follow-row" },
        [["Instagram", "📸", C.instagram], ["Facebook", "👍", C.facebook], ["YouTube", "▶", C.youtube]].map(([n, ic, u]) =>
          h("a", { class: "follow-btn follow-" + n.toLowerCase(), href: u, target: "_blank", rel: "noopener" }, h("span", { class: "follow-ico", "aria-hidden": "true" }, ic), h("span", { class: "follow-n" }, n))));
      if (bare) return row;
      return h("div", { class: "follow" },
        h("div", { class: "follow-head" }, h("span", { class: "follow-k" }, "עקבו אחרי Soundclash"), h("span", { class: "follow-h" }, "@soundclash_rock_battle")),
        row);
    }
    /* -- join -- */
    vJoin() {
      const input = h("input", { id: "aud-name", class: "field", type: "text", maxlength: "18", autocomplete: "given-name", placeholder: "למשל: דנה מהשורה השלישית", enterkeyhint: "go" });
      const go = async (e) => {
        e.preventDefault();
        const ticket = String(1000 + Math.floor(Math.random() * 9000));
        this.me = { ticket, name: input.value.trim().slice(0, 18), prediction: null, votes: {} };
        this.save(); this.render();
        try { await this.be.join({ ticket, name: this.me.name, prediction: null }); } catch (err) { console.warn(err); }
        try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (err) { /* ignore */ }
      };
      return h("section", { class: "aud-join" },
        h("div", { class: "screens-mark", "aria-hidden": "true" }, h("span", { class: "sm-tv" }, L.tv), h("span", { class: "sm-vs" }, "VS"), h("span", { class: "sm-film" }, L.film)),
        h("h1", { class: "aud-h1" }, SHOW.joinTitle[0], h("br"), SHOW.joinTitle[1]),
        h("p", { class: "aud-lead" }, SHOW.joinLead),
        h("form", { class: "aud-join-form", onsubmit: go },
          h("label", { for: "aud-name", class: "field-label" }, "איך לקרוא לך? (לא חובה)"),
          input,
          h("button", { class: "btn-primary", type: "submit" }, "הכנס לזירה")
        ),
        h("p", { class: "aud-fine" }, "בלי הרשמה ובלי הורדה. כל מי שנכנס מקבל כרטיס להגרלה בסוף הערב."),
        this.followCard()
      );
    }
    ticketStub() {
      return h("div", { class: "stub" },
        h("div", { class: "stub-l" }, h("span", { class: "stub-k" }, "ADMIT ONE"), h("span", { class: "stub-n" }, "#" + this.me.ticket)),
        h("div", { class: "stub-r" }, h("span", { class: "stub-k" }, "שם"), h("span", { class: "stub-v" }, this.me.name || "אורח/ת"),
          h("span", { class: "stub-k" }, "הגרלה"), h("span", { class: "stub-v" }, "בסוף המופע")));
    }
    /* -- lobby -- */
    vLobby() {
      const p = this.me.prediction;
      const pick = async (side) => { this.me.prediction = side; this.save(); this.render(); try { await this.be.updatePlayer({ prediction: side }); } catch (e) { /* ignore */ } if (navigator.vibrate) navigator.vibrate(12); };
      return h("section", { class: "aud-lobby" },
        h("p", { class: "eyebrow" }, "הכרטיס שלך"),
        this.ticketStub(),
        h("div", { class: "card predict" + (p ? " is-done" : "") },
          h("h2", { class: "aud-h2" }, p ? "הניחוש שלך נקלט" : "מי ינצח הערב?"),
          h("p", { class: "muted" }, p ? "נגלה בסוף אם צדקת. אפשר עדיין לשנות עד שהקרב מתחיל." : "ניחוש אחד לכל הערב. בסוף נגלה מי צדק."),
          h("div", { class: "predict-row" },
            ["tv", "film"].map(s => h("button", { type: "button", class: "pick pick-" + s + (p === s ? " is-on" : ""), "aria-pressed": p === s ? "true" : "false", onclick: () => pick(s) },
              h("span", { class: "pick-latin" }, SIDE[s].latin), h("span", { class: "pick-he" }, SIDE[s].team))))
        ),
        h("ol", { class: "how" },
          h("li", null, h("span", null, h("b", null, "שיר מול שיר."), " " + SHOW.howPair)),
          h("li", null, h("span", null, h("b", null, "מצביעים."), " אחרי השיר השני נפתחת ההצבעה לכמה שניות.")),
          h("li", null, h("span", null, h("b", null, "המסך מכריע."), " התוצאה עולה מיד, ובסוף הערב יש אלוף והגרלה.")),
          h("li", null, h("span", null, h("b", null, "שולחים ריאקשנים."), " לוחצים על 🔥 ❤️ 😮 בתחתית המסך, והם עפים על המסך הגדול באולם."))),
        this.followCard()
      );
    }
    /* -- duel (intro + songs) -- */
    duelHead(st) {
      const d = SET[st.round];
      return h("div", { class: "duel-head" },
        h("span", { class: "duel-num" }, "דו־קרב ", h("b", null, pad(st.round + 1)), " / " + N),
        h("h2", { class: "duel-theme" }, d.theme));
    }
    songTile(r, side, state, opts) {
      const s = songOf(r, side);
      return h("article", { class: "tile tile-" + side + " is-" + state },
        window.SCArt.img(videoKey(r, side), "tile-art"),
        h("div", { class: "tile-flag" }, h("span", { class: "tile-latin" }, SIDE[side].latin), h("span", null, SIDE[side].short),
          state === "playing" ? h("span", { class: "eq", "aria-label": "מתנגן עכשיו" }, h("i"), h("i"), h("i"), h("i")) : null,
          state === "playing" ? h("span", { class: "tile-state" }, "על הבמה עכשיו") : state === "done" ? h("span", { class: "tile-state" }, "ניגנו") : (opts && opts.next ? h("span", { class: "tile-state" }, "הבא") : null)),
        h("h3", { class: "tile-title" + (s.hebrew ? " is-he" : "") }, bdi(s.title)),
        h("p", { class: "tile-meta" }, meta(s)),
        h("button", { class: "tile-fact", type: "button", onclick: () => this.openSheet("fact", { r, side }), "aria-label": "טריוויה על " + s.title }, "💡 ידעתם?")
      );
    }
    voteOpen() {
      const st = this.st; if (!st) return false;
      return st.phase === "voting" || ((st.phase === "song1" || st.phase === "song2") && st.voteDuringSongs !== false);
    }
    async castVote(r, side) {
      if (this.closed || !this.voteOpen()) return;
      this.myVotes[r] = side; this.save();
      if (navigator.vibrate) navigator.vibrate(18);
      this._key = null; this.render();
      try { await this.be.vote(r, side, { ticket: this.me.ticket, name: this.me.name }); }
      catch (e) { if (this.voteNote) this.voteNote.textContent = "ההצבעה כבר נסגרה."; }
    }
    songLinks(r, side) {
      const s = songOf(r, side);
      return h("div", { class: "song-links" },
        h("button", { class: "tile-fact", type: "button", onclick: () => this.openSheet("fact", { r, side }) }, SHOW.factLabel),
        h("button", { class: "tile-fact", type: "button", onclick: () => this.openSheet("lyrics", { r, side }) }, "📝 מילים"));
    }
    /* song tiles that are also vote buttons */
    voteList(r, states) {
      const st = this.st, ord = sideOrder(st, r), mine = this.myVotes[r], open = this.voteOpen();
      return h("div", { class: "vote-btns" }, ord.map((s, i) => {
        const sg = songOf(r, s), state = states ? states[i] : "";
        const pill = state === "playing" ? h("span", { class: "vbtn-live" }, h("span", { class: "eq", "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("i")), "על הבמה עכשיו")
          : state === "done" ? h("span", { class: "vbtn-live is-done" }, "ניגנו") : state === "next" ? h("span", { class: "vbtn-live is-done" }, "הבא") : null;
        const btn = h(open ? "button" : "div", { type: open ? "button" : null, class: "vbtn vbtn-" + s + (mine === s ? " is-on" : "") + (mine && mine !== s ? " is-off" : "") + (open ? "" : " is-static") + (state === "playing" ? " is-playing" : ""),
          "aria-pressed": open ? (mine === s ? "true" : "false") : null, onclick: open ? () => this.castVote(r, s) : null },
          window.SCArt.img(videoKey(r, s), "vbtn-art"),
          h("span", { class: "vbtn-side" }, SIDE[s].latin, h("small", null, SIDE[s].team), pill),
          h("span", { class: "vbtn-title" + (sg.hebrew ? " is-he" : "") }, bdi(sg.title)),
          h("span", { class: "vbtn-meta" }, meta(sg)),
          open ? h("span", { class: "vbtn-check", "aria-hidden": "true" }, mine === s ? "✓ ההצבעה שלך" : "הצבעה") : null);
        return h("div", { class: "vote-item" }, btn, this.songLinks(r, s));
      }));
    }
    vDuel() {
      const st = this.st, r = st.round, ph = st.phase, open = this.voteOpen(), mine = this.myVotes[r];
      this.closed = null; this.root.classList.remove("vote-closed");
      const states = ph === "intro" ? ["next", ""] : ph === "song1" ? ["playing", ""] : ["done", "playing"];
      this.voteNote = h("p", { class: "aud-note vote-note" },
        open ? (mine ? "ההצבעה נקלטה. אפשר לשנות עד סוף הדו־קרב." : "אפשר להצביע כבר עכשיו, ולשנות עד סוף הדו־קרב.")
          : (ph === "song2" ? "ההצבעה נפתחת מיד כשהשיר נגמר. תהיו מוכנים." : "ההצבעה נפתחת אחרי שני השירים."));
      return h("section", { class: "aud-duel" },
        h("div", { class: "vote-top" },
          h("div", null, open ? h("p", { class: "onair" }, h("i"), "ההצבעה פתוחה") : null, this.duelHead(st))),
        this.voteList(r, states),
        this.voteNote,
        this.scoreStrip(),
        this.followCard()
      );
    }
    /* -- final countdown -- */
    vVoting() {
      const st = this.st, r = st.round, mine = this.myVotes[r];
      this.closed = null; this.root.classList.remove("vote-closed");
      this.clock = leader("leader-sm");
      this.voteNote = this.closedNote = h("p", { class: "aud-note vote-note" }, mine ? "ההצבעה נקלטה. אפשר לשנות עד שהזמן נגמר." : "בוחרים את השיר שניצח. אפשר לשנות עד שהזמן נגמר.");
      return h("section", { class: "aud-vote" },
        h("div", { class: "vote-top" },
          h("div", null, h("p", { class: "onair" }, h("i"), "שניות אחרונות להצבעה"), h("h2", { class: "duel-theme" }, SET[r].theme)),
          this.clock),
        this.voteList(r, ["done", "done"]),
        this.closedNote
      );
    }
    tickClock() {
      const st = this.st; if (!st || st.phase !== "voting" || !this.clock) return;
      const left = Math.max(0, st.votingEndsAt - Date.now()), total = (st.voteSeconds || 30) * 1000;
      this.clock.set(Math.ceil(left / 1000), left / total);
      const closed = left <= 0;
      if (closed !== this.closed) {
        this.closed = closed;
        this.root.classList.toggle("vote-closed", closed);
        if (closed && this.closedNote) this.closedNote.textContent = "הזמן נגמר. סופרים קולות…";
      }
    }
    /* -- reveal -- */
    celebrateReveal() {
      const st = this.st, res = (st.results || {})[st.round]; if (!res) return;
      const k = "r" + st.round; if (this._celebrated[k]) return; this._celebrated[k] = 1;
      const mine = this.myVotes[st.round];
      if (mine && mine === res.winner) confetti(this.canvas, SIDE_COLORS[res.winner], 0.7);
      const me = this.be.uid();
      if ((res.fastest && res.fastest.uid === me) || (res.lucky && res.lucky.uid === me)) { confetti(this.canvas, SIDE_COLORS.tie, 1.2); if (navigator.vibrate) navigator.vibrate([40, 60, 40]); }
    }
    award(kind, a) {
      if (!a) return null;
      const me = a.uid === this.be.uid();
      return h("div", { class: "award" + (me ? " is-me" : "") },
        h("span", { class: "award-ico", "aria-hidden": "true" }, kind === "fast" ? "⚡" : "👑"),
        h("span", { class: "award-k" }, kind === "fast" ? "המצביע המהיר" : "כתר המזל"),
        h("span", { class: "award-v" }, me ? "זה את/ה! " : "", "#" + a.ticket, a.name ? " · " + a.name : ""),
        me ? h("span", { class: "award-cta" }, "גשו לעמדת הלהקה בסוף המופע") : null);
    }
    vReveal() {
      const st = this.st, r = st.round, res = (st.results || {})[r];
      if (!res) return h("section", { class: "aud-wait" }, h("div", { class: "spinner", "aria-hidden": "true" }), h("p", null, "סופרים קולות…"));
      const mine = this.myVotes[r], w = res.winner, tv = pct(res.tv, res.total), film = res.total ? 100 - tv : 0;
      let verdict = "לא הצבעת בסיבוב הזה.";
      if (mine) verdict = w === "tie" ? "תיקו! הקול שלך היה בדיוק במרכז." : mine === w ? "הצבעת עם הרוב ✓" : "הלכת נגד הזרם. גם זה סגנון.";
      const next = r + 1 < N ? SET[r + 1] : null;
      return h("section", { class: "aud-reveal" },
        this.duelHead(st),
        h("div", { class: "winner winner-" + w },
          h("span", { class: "winner-k" }, w === "tie" ? "תוצאה" : "ניצח בדו־קרב"),
          h("span", { class: "winner-v" }, w === "tie" ? "תיקו" : SIDE[w].team),
          w !== "tie" ? h("span", { class: "winner-song" }, bdi(songOf(r, w).title)) : null),
        h("div", { class: "split", role: "img", "aria-label": SIDE.tv.he + " " + tv + " אחוז, " + SIDE.film.he + " " + film + " אחוז" },
          h("div", { class: "split-tv", style: { flexGrow: Math.max(tv, 4) } }, h("b", null, tv + "%"), h("span", null, L.tv)),
          h("div", { class: "split-film", style: { flexGrow: Math.max(film, 4) } }, h("b", null, film + "%"), h("span", null, L.film))),
        h("p", { class: "verdict" + (mine && mine === w ? " is-good" : "") }, verdict),
        h("div", { class: "awards" }, this.award("fast", res.fastest), this.award("luck", res.lucky)),
        this.scoreStrip(),
        next ? h("p", { class: "aud-note" }, "הבא בתור: ", h("b", null, next.theme)) : h("p", { class: "aud-note" }, "זה היה הדו־קרב האחרון. עוד רגע האלופים."),
        this.followCard()
      );
    }
    scoreStrip() {
      const st = this.st, s = scoreboard(st), res = st.results || {};
      return h("div", { class: "score" },
        h("div", { class: "score-row" },
          h("span", { class: "score-side tv" }, L.tv + " ", h("b", null, s.tv)),
          h("span", { class: "score-dots" }, SET.map((_, i) => h("i", { class: "dot " + (res[i] ? "w-" + res[i].winner : (i === st.round && st.phase !== "lobby" ? "is-now" : "")) }))),
          h("span", { class: "score-side film" }, h("b", null, s.film), " " + L.film)));
    }
    tasteMeter() {
      const st = this.st, res = st.results || {}; let voted = 0, withCrowd = 0;
      for (let r = 0; r < N; r++) if (res[r] && this.myVotes[r]) { voted++; if (this.myVotes[r] === res[r].winner) withCrowd++; }
      return { voted, withCrowd, p: voted ? Math.round(withCrowd * 100 / voted) : 0 };
    }
    contactBlock() {
      const C = CFG.CONTACT;
      return h("div", { class: "card cta" },
        h("h3", { class: "aud-h3" }, "רוצים את הקרב הזה באירוע שלכם?"),
        h("p", { class: "muted" }, "ערב חברה, יום כיף, פסטיבל. Soundclash מגיעים עם הלהקה והאפליקציה."),
        h("div", { class: "cta-row" },
          h("a", { class: "btn-primary", href: C.whatsapp, target: "_blank", rel: "noopener" }, "💬 וואטסאפ"),
          h("a", { class: "btn-ghost", href: C.site, target: "_blank", rel: "noopener" }, "לאתר")),
        h("div", { class: "cta-phones" },
          h("a", { class: "phone-line", href: "tel:" + C.phoneYinon.replace(/-/g, "") }, h("span", null, "ינון"), h("b", { class: "sel" }, C.phoneYinon)),
          h("a", { class: "phone-line", href: "tel:" + C.phoneNaama.replace(/-/g, "") }, h("span", null, "נעמה"), h("b", { class: "sel" }, C.phoneNaama))),
        h("p", { class: "follow-k" }, "ועכשיו גם לעקוב:"),
        this.followCard(true));
    }
    vFinal() {
      const st = this.st, c = champion(st), s = scoreboard(st), p = this.me.prediction, tm = this.tasteMeter();
      return h("section", { class: "aud-final" },
        h("p", { class: "eyebrow" }, "סוף הקרב"),
        h("div", { class: "champ champ-" + c },
          h("span", { class: "champ-k" }, c === "tie" ? "תיקו מושלם" : "האלופים של הערב"),
          h("span", { class: "champ-v" }, c === "tie" ? "שני המסכים" : SIDE[c].team),
          h("span", { class: "champ-score" }, L.tv + " ", h("b", null, s.tv), " : ", h("b", null, s.film), " " + L.film)),
        p ? h("p", { class: "verdict" + (p === c ? " is-good" : "") }, p === c ? "ניחשת נכון מההתחלה. כל הכבוד!" : "ניחשת " + SIDE[p].team + ". הקהל חשב אחרת.") : null,
        h("div", { class: "card meter" },
          h("h3", { class: "aud-h3" }, "מד הטעם שלך"),
          tm.voted ? h("p", null, "הצבעת עם הרוב ב-", h("b", null, tm.withCrowd), " מתוך ", h("b", null, tm.voted), " דו־קרבות") : h("p", null, "לא הצבעת הערב."),
          h("div", { class: "meter-bar" }, h("i", { style: { width: tm.p + "%" } })),
          h("p", { class: "muted" }, tm.p >= 70 ? "יש לך אוזן של קהל. מסכים איתך כמעט תמיד." : tm.p >= 40 ? "טעם עצמאי עם נגיעות מיינסטרים." : tm.voted ? "מורד אמיתי. הולך עם הלב." : "")),
        h("p", { class: "aud-note" }, "עוד רגע ההגרלה. הכרטיס שלך: ", h("b", null, "#" + this.me.ticket)),
        this.contactBlock());
    }
    vRaffle() {
      const st = this.st, rf = st.raffle;
      if (!rf) return h("section", { class: "aud-wait" }, h("div", { class: "spinner", "aria-hidden": "true" }), h("p", { class: "aud-h2" }, "מגרילים…"), h("p", { class: "muted" }, "הכרטיס שלך #" + this.me.ticket));
      const me = rf.uid === this.be.uid();
      return h("section", { class: "aud-raffle" + (me ? " is-me" : "") },
        h("p", { class: "eyebrow" }, "ההגרלה הגדולה"),
        h("div", { class: "stub stub-big" + (me ? " is-win" : "") },
          h("div", { class: "stub-l" }, h("span", { class: "stub-k" }, "WINNER"), h("span", { class: "stub-n" }, "#" + rf.ticket)),
          h("div", { class: "stub-r" }, h("span", { class: "stub-v" }, rf.name || "אורח/ת"))),
        h("h2", { class: "aud-h1" }, me ? "זכית!" : "לא הפעם"),
        h("p", { class: "aud-lead" }, me ? "תראו את המסך הזה ללהקה ותקבלו את הפרס." : "הכרטיס שלך #" + this.me.ticket + ". תודה ששיחקת איתנו."),
        this.contactBlock());
    }
    vEncore() {
      const es = SHOW.encores && this.st.encoreSide;
      if (es) return h("section", { class: "aud-final" },
        h("h1", { class: "aud-h1 encore" }, "הדרן!"),
        h("div", { class: "vote-item" }, h("div", { class: "vbtn vbtn-" + es + " is-static is-playing" }, window.SCArt.img(videoKey("enc", es), "vbtn-art"),
          h("span", { class: "vbtn-side" }, SIDE[es].latin, h("small", null, SIDE[es].team), h("span", { class: "vbtn-live" }, h("span", { class: "eq", "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("i")), "על הבמה עכשיו")),
          h("span", { class: "vbtn-title" }, bdi(songOf("enc", es).title)), h("span", { class: "vbtn-meta" }, meta(songOf("enc", es)))), this.songLinks("enc", es)),
        this.contactBlock());
      return h("section", { class: "aud-final" },
        h("h1", { class: "aud-h1 encore" }, "הדרן!"),
        h("p", { class: "aud-lead" }, "תודה ששיחקתם. שלחו תגובות ללהקה מהכפתורים למטה."),
        this.contactBlock());
    }
    /* -- reactions -- */
    buildReactBar() {
      const EMO = [["fire", "🔥"], ["love", "❤️"], ["wow", "😮"], ["clap", "👏"], ["pop", "🍿"]];
      this.rxLabel = h("span", { class: "rx-label" }, "⬆ לחצו, וזה יעוף על המסך הגדול");
      this.reactBar.append(this.rxLabel);
      if (!safeStore.get("sc_rx_seen", false)) this.reactBar.classList.add("is-new");
      EMO.forEach(([k, e]) => this.reactBar.append(h("button", { type: "button", class: "rx", "aria-label": "תגובה " + e, onclick: (ev) => this.react(k, e, ev) }, e)));
    }
    react(k, e, ev) {
      this.pending[k] = (this.pending[k] || 0) + 1;
      if (this.reactBar.classList.contains("is-new")) { this.reactBar.classList.remove("is-new"); safeStore.set("sc_rx_seen", true); }
      this.rxLabel.textContent = "נשלח למסך ✓"; this.rxLabel.classList.add("is-sent");
      clearTimeout(this._rxT); this._rxT = setTimeout(() => { this.rxLabel.textContent = "⬆ לחצו, וזה יעוף על המסך הגדול"; this.rxLabel.classList.remove("is-sent"); }, 1300);
      if (navigator.vibrate) navigator.vibrate(8);
      const b = ev.currentTarget.getBoundingClientRect(), rr = this.root.getBoundingClientRect();
      const f = h("span", { class: "float", style: { left: (b.left - rr.left + b.width / 2) + "px", top: (b.top - rr.top) + "px" } }, e);
      this.fx.append(f); setTimeout(() => f.remove(), 1400);
      clearTimeout(this._flushT);
      const wait = Math.max(0, 4000 - (Date.now() - this.lastFlush));
      this._flushT = setTimeout(() => this.flush(), Math.max(600, wait));
    }
    flush() {
      const c = this.pending; if (!Object.keys(c).length) return;
      this.pending = {}; this.lastFlush = Date.now();
      Object.keys(c).forEach(k => { c[k] = Math.min(c[k], 12); });
      this.be.react(c).catch(() => {});
    }
    /* -- sheets -- */
    openSheet(kind, data) {
      const close = () => { this.sheetEl.hidden = true; this.sheetEl.replaceChildren(); };
      let body;
      if (kind === "fact") {
        const s = songOf(data.r, data.side);
        body = [h("p", { class: "eyebrow" }, SIDE[data.side].team + " · " + roundLabel(data.r)),
          h("h2", { class: "aud-h2" + (s.hebrew ? "" : " latin-title") }, bdi(s.title)),
          h("p", { class: "muted" }, meta(s), s.sourceEn && !s.hebrew ? " (" + s.sourceEn + ")" : "", s.year ? " · " + s.year : ""),
          s.medley ? h("p", null, "במחרוזת: ", s.medley.join(" ← ")) : null,
          s.scene ? h("div", { class: "scene" }, h("span", { class: "scene-k" }, SIDE[data.side].sceneLabel), h("p", null, s.scene)) : null,
          h("p", { class: "fact" }, "💡 ", s.fact),
          h("button", { class: "btn-ghost lyrics-btn", type: "button", onclick: () => this.openSheet("lyrics", data) }, "📝 למילים של השיר")];
      } else if (kind === "lyrics") {
        const s = songOf(data.r, data.side), box = h("div", { class: "lyrics", dir: s.hebrew ? "rtl" : "ltr" }, h("div", { class: "spinner", "aria-hidden": "true" }));
        body = [h("p", { class: "eyebrow" }, SIDE[data.side].team + " · " + roundLabel(data.r)),
          h("h2", { class: "aud-h2" + (s.hebrew ? "" : " latin-title") }, bdi(s.title)),
          h("p", { class: "muted" }, meta(s)), box];
        this.be.getLyrics(videoKey(data.r, data.side)).then(l => {
          if (l && l.text) box.replaceChildren(l.text);
          else box.replaceChildren(h("p", { class: "lyrics-empty" }, "המילים לשיר הזה יעלו בקרוב."));
        }).catch(() => box.replaceChildren(h("p", { class: "lyrics-empty" }, "אין חיבור כרגע. נסו שוב בעוד רגע.")));
      } else if (kind === "contact") {
        body = [h("p", { class: "eyebrow" }, "Soundclash"), h("h2", { class: "aud-h2" }, "דברו איתנו"), this.contactBlock()];
      } else {
        const tm = this.tasteMeter(), res = (this.st && this.st.results) || {};
        body = [h("p", { class: "eyebrow" }, "הערב שלי"), this.ticketStub(),
          h("p", null, "הניחוש שלך לאלוף: ", h("b", null, this.me.prediction ? SIDE[this.me.prediction].team : "עוד לא בחרת")),
          h("ul", { class: "myvotes" }, SET.map((d, r) => {
            const v = this.myVotes[r], x = res[r];
            return h("li", { class: x ? "" : "is-future" }, h("span", { class: "mv-n" }, pad(r + 1)), h("span", { class: "mv-t" }, d.theme),
              h("span", { class: "mv-v" + (v ? " s-" + v : "") }, v ? SIDE[v].latin : "–"),
              h("span", { class: "mv-r" }, x ? (v && v === x.winner ? "✓" : x.winner === "tie" ? "=" : v ? "✗" : "") : ""));
          })),
          tm.voted ? h("p", { class: "muted" }, "עם הרוב: " + tm.withCrowd + " מתוך " + tm.voted) : null,
          this.contactBlock()];
      }
      this.sheetEl.replaceChildren(
        h("div", { class: "sheet-scrim", onclick: close }),
        h("div", { class: "sheet-card", role: "dialog", "aria-modal": "true" },
          h("button", { class: "sheet-x", type: "button", onclick: close, "aria-label": "סגירה" }, "×"), body));
      this.sheetEl.hidden = false;
      const x = this.sheetEl.querySelector(".sheet-x"); if (x) x.focus();
    }
  }

  /* =========================================================================
     STAGE SCREEN (projector) — 1920×1080 stage scaled to fit
     ========================================================================= */
  class ScreenView {
    constructor(root, be, opts) {
      this.root = root; this.be = be; this.opts = opts || {};
      this.mini = !!this.opts.mini;
      root.classList.add("scr-viewport"); if (this.mini) root.classList.add("is-mini");
      root.setAttribute("dir", "rtl");
      this.stage = h("div", { class: "scr-stage" });
      this.bg = h("canvas", { class: "scr-bg", "aria-hidden": "true" });
      this.video = this.mini ? null : h("video", { class: "scr-video", muted: true, playsinline: true, loop: true, preload: "auto" });
      this.videoStub = this.mini ? h("div", { class: "scr-video-stub", hidden: true }) : null;
      this.layer = h("div", { class: "scr-layer" });
      this.rx = h("div", { class: "scr-rx", "aria-hidden": "true" });
      this.canvas = h("canvas", { class: "scr-confetti", "aria-hidden": "true" });
      this.stage.append(this.bg, this.video || this.videoStub, this.layer, this.rx, this.canvas);
      if (this.mini) this.stage.append(h("div", { class: "scr-safe", "aria-hidden": "true" }, h("span", null, "מתחת לקו: עלול להיות מוסתר ע״י הלהקה")));
      root.append(this.stage);
      if (this.video) { this.video.muted = true; this.video.defaultMuted = true; }
      this.votes = []; this.players = []; this.videoMap = {}; this.lastSeq = -1;
      new ResizeObserver(() => this.fit()).observe(root); this.fit();
      be.onState(st => { const prev = this.st; this.st = st; this.onState(prev); });
      be.onPlayers(ps => { this.players = ps; this.updateLive(); });
      be.onReactions(r => this.burst(r));
      this.tick = setInterval(() => this.tickClock(), 100);
      if (!this.mini) { this.buildControls(); this.startBg(); }
    }
    fit() {
      const w = this.root.clientWidth, hgt = this.root.clientHeight; if (!w || !hgt) return;
      const s = Math.min(w / 1920, hgt / 1080);
      this.stage.style.transform = "translate(-50%,-50%) scale(" + s + ")";
    }
    audienceUrl() {
      if (CFG.AUDIENCE_URL) return CFG.AUDIENCE_URL;
      try { return new URL(window.SC_BASE || "./", location.href).href.split("#")[0]; } catch (e) { return "https://soundclash.co.il"; }
    }
    qr(cls) {
      const url = this.audienceUrl();
      let svg = ""; try { svg = window.SCQR.toSVG(url, { ecl: "M", dark: "#0b0a09", light: "#f4efe6", label: "QR לכניסה לאפליקציה" }); } catch (e) { svg = ""; }
      return h("div", { class: "scr-qr " + (cls || "") }, h("div", { class: "scr-qr-code", html: svg }),
        h("div", { class: "scr-qr-txt" }, h("span", { class: "scr-qr-k" }, "סורקים ונכנסים לזירה"), h("span", { class: "scr-qr-url" }, url.replace(/^https?:\/\//, "").replace(/\/$/, ""))));
    }
    onState(prev) {
      const st = this.st;
      const sig = st.phase + "|" + st.round + "|" + JSON.stringify((st.results || {})[st.round] || null) + "|" + JSON.stringify(st.raffle) + "|" + (st.screen && st.screen.overlay) + "|" + (st.screen && st.screen.qr) + "|" + st.liveBars + "|" + JSON.stringify(st.order || {}) + "|" + st.voteDuringSongs + "|" + (st.encoreSide || "") + "|" + this.hasVideo() + "|" + (st.promo && st.promo.at && st.promo.at + 25000 > Date.now() ? st.promo.seq : 0);
      if (!prev || prev.round !== st.round || this.vRound !== st.round) {
        if (this.unVotes) this.unVotes();
        this.vRound = st.round; this.votes = [];
        this.unVotes = this.be.onVotes(st.round, v => { this.votes = v; this.updateLive(); });
      }
      this.handleVideo(st);
      if (sig !== this.sig) { this.sig = sig; this.render(prev); }
      this.updateLive();
    }
    hasVideo() {
      if (!this.mini) return !!this._videoOn;
      const v = this.st && this.st.video; return !!(v && v.cmd !== "stop" && v.key);
    }
    /* -- video (controlled from admin) -- */
    resolveVideo(key) {
      if (this.videoMap[key]) return this.videoMap[key];
      if (CFG.VIDEO_BASE_URL) return CFG.VIDEO_BASE_URL.replace(/\/$/, "") + "/" + key + "." + (CFG.VIDEO_EXT || "mp4");
      return null;
    }
    handleVideo(st) {
      const v = st.video || {};
      if (v.seq === this.lastSeq) return; this.lastSeq = v.seq;
      if (this.mini) {
        this.videoStub.hidden = v.cmd === "stop" || !v.key;
        this.videoStub.textContent = v.key ? "🎞 " + v.key + (v.cmd === "pause" ? " · עצור" : "") : "";
        this.stage.classList.toggle("has-video", !this.videoStub.hidden);
        return;
      }
      const vid = this.video;
      if (v.cmd === "stop" || !v.key) { vid.pause(); this.stage.classList.remove("has-video"); this._videoOn = false; this.playingKey = ""; this.reportMeta(); return; }
      const src = this.resolveVideo(v.key);
      if (!src) { this.stage.classList.remove("has-video"); this._videoOn = false; this.playingKey = ""; this.reportMeta("missing:" + v.key); return; }
      if (this.playingKey !== v.key) { vid.src = src; this.playingKey = v.key; }
      if (v.cmd === "restart") vid.currentTime = 0;
      if (v.cmd === "pause") vid.pause();
      else vid.play().catch(() => { this.reportMeta("blocked"); });
      this.stage.classList.add("has-video"); this._videoOn = true;
      this.reportMeta();
    }
    reportMeta(status) {
      if (this.mini) return;
      clearTimeout(this._metaT);
      this._metaT = setTimeout(() => {
        const keys = Object.keys(this.videoMap);
        this.be.setScreenMeta({ videos: keys, base: !!CFG.VIDEO_BASE_URL, playing: this.playingKey || "", status: status || "ok" }).catch(() => {});
      }, 300);
    }
    buildControls() {
      const input = h("input", { type: "file", id: "scr-folder", accept: "video/*,image/*", multiple: true, webkitdirectory: true, hidden: true });
      const count = h("span", { class: "scr-ctl-count" }, "אין סרטונים טעונים");
      input.addEventListener("change", () => {
        Object.values(this.videoMap).forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* ignore */ } });
        this.videoMap = {};
        let imgs = 0;
        Array.from(input.files).forEach(f => {
          const key = f.name.replace(/\.[^.]+$/, "").toLowerCase();
          if (/^image\//.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name)) { window.SCArt.overrides[key] = URL.createObjectURL(f); imgs++; return; }
          if (!/^video\//.test(f.type) && !/\.(mp4|webm|mov|m4v)$/i.test(f.name)) return;
          this.videoMap[key] = URL.createObjectURL(f);
        });
        const n = Object.keys(this.videoMap).length;
        count.textContent = (n || imgs) ? n + " סרטונים · " + imgs + " תמונות" : "לא נמצאו סרטונים או תמונות בתיקייה";
        this.sig = null;
        this.lastSeq = -1; if (this.st) { this.handleVideo(this.st); this.sig = null; this.onState(this.st); } this.reportMeta();
      });
      const full = () => { const el = document.documentElement; if (!document.fullscreenElement) (el.requestFullscreen ? el.requestFullscreen() : Promise.reject()).catch(() => {}); else document.exitFullscreen().catch(() => {}); };
      this.ctl = h("div", { class: "scr-ctl" },
        h("label", { class: "scr-ctl-btn", for: "scr-folder" }, "📁 טעינת תיקיית סרטונים"), input, count,
        h("button", { class: "scr-ctl-btn", type: "button", onclick: full }, "⛶ מסך מלא"),
        h("span", { class: "scr-ctl-hint" }, "שמות הקבצים לפי הקוד שבאדמין: ", h("bdi", { dir: "ltr" }, "03-tv.mp4"), " לסרטון, ", h("bdi", { dir: "ltr" }, "03-tv.jpg"), " לתמונה"));
      this.root.append(this.ctl);
      let t; const show = () => { this.ctl.classList.add("is-on"); this.root.classList.add("show-cursor"); clearTimeout(t); t = setTimeout(() => { this.ctl.classList.remove("is-on"); this.root.classList.remove("show-cursor"); }, 3500); };
      this.root.addEventListener("mousemove", show); this.root.addEventListener("click", show); show();
      setTimeout(() => this.reportMeta(), 800);
    }
    /* -- ambient background: projector beam vs CRT static -- */
    startBg() {
      const c = this.bg, ctx = c.getContext("2d"); c.width = 480; c.height = 270;
      const noise = ctx.createImageData(240, 270); let last = 0;
      const dust = Array.from({ length: 70 }, () => ({ x: Math.random() * 240, y: Math.random() * 270, v: 0.1 + Math.random() * 0.3, r: Math.random() * 1.2 + 0.3 }));
      const loop = (t) => {
        this._bgRaf = requestAnimationFrame(loop);
        if (t - last < 66) return; last = t;
        const ph = this.st && this.st.phase;
        const ambient = !this.stage.classList.contains("has-video") && (ph === "lobby" || ph === "final" || ph === "raffle" || ph === "encore" || ph === "intro");
        c.style.opacity = ambient ? 1 : 0.35;
        if (reduceMotion() && this._bgDrawn) return; this._bgDrawn = true;
        if (SHOW.theme === "nineties") { this.bg90(ctx, t, dust); return; }
        // right half (RTL: TV side) — blue CRT static
        const d = noise.data;
        for (let i = 0; i < d.length; i += 4) { const g = Math.random() * 60; d[i] = g * 0.35; d[i + 1] = g * 0.55; d[i + 2] = g; d[i + 3] = 255; }
        ctx.putImageData(noise, 240, 0);
        for (let y = 0; y < 270; y += 3) { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(240, y, 240, 1); }
        // left half — projector beam with drifting dust
        const g = ctx.createRadialGradient(240, -20, 10, 120, 160, 300);
        g.addColorStop(0, "rgba(255,214,150,.55)"); g.addColorStop(0.45, "rgba(232,163,61,.16)"); g.addColorStop(1, "rgba(10,9,8,1)");
        ctx.fillStyle = "#0a0908"; ctx.fillRect(0, 0, 240, 270);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(240, 0); ctx.lineTo(0, 40); ctx.lineTo(0, 270); ctx.lineTo(240, 270); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(255,226,180,.5)";
        dust.forEach(p => { p.y -= p.v; p.x += Math.sin((t / 900) + p.y) * 0.15; if (p.y < 0) { p.y = 270; p.x = Math.random() * 240; } ctx.fillRect(p.x, p.y, p.r, p.r); });
        const fl = 0.9 + Math.random() * 0.1; ctx.fillStyle = "rgba(0,0,0," + (1 - fl) + ")"; ctx.fillRect(0, 0, 240, 270);
      };
      this._bgRaf = requestAnimationFrame(loop);
    }
    /* 90s stage: two moving spotlights (red right / blue left) through haze, gold dust */
    bg90(ctx, t, dust) {
      ctx.fillStyle = "#07060a"; ctx.fillRect(0, 0, 480, 270);
      const beam = (x0, ang, col) => {
        const len = 340, w = 0.2, x1 = x0 + Math.cos(ang - w) * len, y1 = Math.sin(ang - w) * len, x2 = x0 + Math.cos(ang + w) * len, y2 = Math.sin(ang + w) * len;
        const g = ctx.createLinearGradient(x0, 0, (x1 + x2) / 2, (y1 + y2) / 2); g.addColorStop(0, col.replace("A", ".55")); g.addColorStop(1, col.replace("A", "0"));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, -6); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill();
      };
      const s = t / 2600;
      ctx.globalCompositeOperation = "lighter";
      beam(400, Math.PI / 2 + 0.45 * Math.sin(s), "rgba(229,72,77,A)");
      beam(330, Math.PI / 2 + 0.35 * Math.sin(s * 1.3 + 2), "rgba(229,72,77,A)");
      beam(80, Math.PI / 2 + 0.45 * Math.sin(s + 3.1), "rgba(79,134,232,A)");
      beam(150, Math.PI / 2 + 0.35 * Math.sin(s * 1.2 + 1), "rgba(79,134,232,A)");
      ctx.globalCompositeOperation = "source-over";
      const fog = ctx.createLinearGradient(0, 170, 0, 270); fog.addColorStop(0, "rgba(255,255,255,0)"); fog.addColorStop(1, "rgba(255,240,220,.08)");
      ctx.fillStyle = fog; ctx.fillRect(0, 170, 480, 100);
      ctx.fillStyle = "rgba(255,227,140,.55)";
      dust.forEach(p => { p.y -= p.v; p.x += Math.sin((t / 900) + p.y) * 0.15; if (p.y < 0) { p.y = 270; p.x = Math.random() * 240; } ctx.fillRect(p.x * 2, p.y, p.r, p.r); });
    }
    /* -- reactions -- */
    burst(r) {
      const EMO = { fire: "🔥", love: "❤️", wow: "😮", clap: "👏", pop: "🍿", rock: "🤘" };
      const c = r.c || {}; let n = 0;
      Object.keys(c).forEach(k => {
        const count = Math.min(c[k], this.mini ? 2 : 5);
        for (let i = 0; i < count; i++) {
          if (this.rx.childElementCount > 70) return;
          const side = Math.random();
          const e = h("span", { class: "rx-f", style: { right: (4 + side * 92) + "%", animationDelay: (n++ * 90) + "ms", fontSize: (44 + Math.random() * 40) + "px", "--dx": ((Math.random() - 0.5) * 160) + "px" } }, EMO[k] || "✨");
          this.rx.append(e); setTimeout(() => e.remove(), 3600 + n * 90);
        }
      });
    }
    /* -- render by phase -- */
    render(prev) {
      const st = this.st, ph = st.phase;
      this.stage.dataset.phase = ph;
      let v;
      switch (ph) {
        case "lobby": v = this.sLobby(); break;
        case "intro": v = this.sIntro(); break;
        case "song1": case "song2": v = this.sSong(); break;
        case "voting": v = this.sVoting(); break;
        case "reveal": v = this.sReveal(); break;
        case "final": v = this.sFinal(); break;
        case "raffle": v = this.sRaffle(); break;
        default: v = this.sEncore();
      }
      this.layer.replaceChildren(v);
      if (st.screen && st.screen.qr && ph !== "lobby") this.layer.append(this.qr("scr-qr-corner"));
      const pr = st.promo, prLeft = pr && pr.at ? pr.at + 25000 - Date.now() : 0;
      if (prLeft > 0) {
        this.layer.append(this.promoOverlay());
        clearTimeout(this._promoT); this._promoT = setTimeout(() => { this.sig = null; this.onState(this.st); }, prLeft + 50);
      }
      if (ph === "reveal" && (st.results || {})[st.round] && (!prev || prev.phase !== "reveal" || prev.round !== st.round)) {
        const w = st.results[st.round].winner; setTimeout(() => confetti(this.canvas, SIDE_COLORS[w], this.mini ? 0.4 : 1.4), 1500);
      }
      if (ph === "final" && (!prev || prev.phase !== "final")) setTimeout(() => confetti(this.canvas, SIDE_COLORS[champion(st)], this.mini ? 0.5 : 2.2), 900);
      if (ph === "raffle" && st.raffle && (!prev || JSON.stringify(prev.raffle) !== JSON.stringify(st.raffle))) this.spinRaffle();
    }
    topBar(label) {
      const s = scoreboard(this.st), res = this.st.results || {};
      return h("div", { class: "scr-top" },
        h("div", { class: "scr-brand" }, "SOUND", h("b", null, "CLASH"), h("span", null, SHOW.title)),
        label ? h("div", { class: "scr-top-label" }, label) : h("div"),
        h("div", { class: "scr-score" },
          h("span", { class: "tv" }, L.tv + " ", h("b", null, s.tv)),
          h("span", { class: "scr-dots" }, SET.map((_, i) => h("i", { class: res[i] ? "w-" + res[i].winner : (i === this.st.round && this.st.phase !== "lobby" && this.st.phase !== "final" ? "is-now" : "") }))),
          h("span", { class: "film" }, h("b", null, s.film), " " + L.film)));
    }
    card(r, side, cls) {
      const s = songOf(r, side);
      return h("div", { class: "scard scard-" + side + " " + (cls || "") },
        h("div", { class: "scard-frame" },
          window.SCArt.img(videoKey(r, side), "scard-art"),
          h("div", { class: "scard-badge" }, h("span", null, SIDE[side].latin), h("small", null, SIDE[side].badge + " " + pad(r + 1))),
          h("div", { class: "scard-source" }, s.source),
          h("div", { class: "scard-title" + (s.hebrew ? " is-he" : "") }, bdi(s.title)),
          h("div", { class: "scard-artist" }, bdi(s.artist), s.year ? h("span", { class: "scard-year" }, s.year) : null)));
    }
    sLobby() {
      this.$pred = h("div", { class: "scr-pred" });
      this.fillPred();
      return h("div", { class: "s-lobby" },
        h("div", { class: "s-lobby-top" },
          h("div", { class: "s-lobby-title" },
            h("div", { class: "s-lobby-word" }, h("span", { class: "w-tv" }, "SOUND"), h("span", { class: "w-film" }, "CLASH")),
            h("div", { class: "s-lobby-he" }, SHOW.vs[0] + " ", h("em", null, "נגד"), " " + SHOW.vs[1]),
            h("div", { class: "s-lobby-sub" }, SHOW.lobbySub),
            h("div", { class: "s-lobby-rx" }, "שלחו ", h("span", { class: "s-lobby-rx-e" }, "🔥 ❤️ 😮"), " מהטלפון, ותראו אותם עפים כאן")),
          h("div", { class: "s-lobby-join" },
            this.qr("scr-qr-big"),
            h("div", { class: "s-joined" }, h("span", { class: "s-onair s-joining" }, h("i"), "נכנסים לזירה עכשיו"), this.voteFlow("vflow-join")))),
        h("div", { class: "s-lobby-bottom" },
          h("div", { class: "s-pred-wrap" }, h("span", { class: "s-pred-k" }, "מי ינצח הערב? הניחושים של הקהל"), this.$pred),
          this.socialStrip()));
    }
    socialStrip(cls) {
      return h("div", { class: "s-social " + (cls || "") },
        h("span", { class: "s-social-k" }, "עקבו אחרינו"),
        h("span", { class: "s-social-i" }, h("i", null, "📸"), "Instagram ", h("b", null, "@soundclash_rock_battle")),
        h("span", { class: "s-social-i" }, h("i", null, "👍"), "Facebook ", h("b", null, "Soundclash")),
        h("span", { class: "s-social-i" }, h("i", null, "▶"), "YouTube ", h("b", null, "@SoundclashRockBattle")));
    }
    promoOverlay() {
      const C = CFG.CONTACT;
      let svg = ""; try { svg = window.SCQR.toSVG(C.instagram, { ecl: "M", dark: "#0b0a09", light: "#f4efe6", label: "QR לאינסטגרם" }); } catch (e) { svg = ""; }
      return h("div", { class: "s-promo" },
        h("div", { class: "s-promo-card" },
          h("div", { class: "s-promo-txt" },
            h("div", { class: "s-promo-k" }, "רגע לפני שממשיכים"),
            h("div", { class: "s-promo-t" }, "עקבו אחרינו"),
            h("div", { class: "s-promo-list" },
              h("span", null, h("i", null, "📸"), h("bdi", { dir: "ltr" }, "@soundclash_rock_battle")),
              h("span", null, h("i", null, "👍"), "Soundclash בפייסבוק"),
              h("span", null, h("i", null, "▶"), h("bdi", { dir: "ltr" }, "@SoundclashRockBattle")))),
          h("div", { class: "s-promo-qr" }, h("div", { class: "scr-qr-code", html: svg }), h("span", null, "סורקים לאינסטגרם"))));
    }
    fillPred() {
      if (!this.$pred) return;
      const preds = this.players.filter(p => p.prediction), n = preds.length, tv = preds.filter(p => p.prediction === "tv").length;
      const a = n ? pct(tv, n) : 50;
      this.$pred.replaceChildren(
        h("div", { class: "scr-pred-bar" }, h("i", { class: "tv", style: { width: a + "%" } }), h("i", { class: "film", style: { width: (100 - a) + "%" } })),
        h("div", { class: "scr-pred-lab" }, h("span", { class: "tv" }, SIDE.tv.he + " " + (n ? a + "%" : "")), h("span", { class: "film" }, (n ? (100 - a) + "% " : "") + SIDE.film.he)));
    }
    sIntro() {
      const st = this.st, r = st.round, ord = sideOrder(st, r);
      return h("div", { class: "s-intro" },
        this.topBar(null),
        h("div", { class: "s-intro-head" },
          h("div", { class: "s-eyebrow" }, "דו־קרב ", h("b", null, pad(r + 1)), " מתוך " + N),
          h("div", { class: "s-theme" }, SET[r].theme)),
        h("div", { class: "s-pair" },
          this.card(r, ord[0], "is-in-1"),
          h("div", { class: "s-vs" }, h("span", null, "VS")),
          this.card(r, ord[1], "is-in-2")),
        h("div", { class: "s-foot" }, "מתחילים עם ", h("b", null, SIDE[ord[0]].team)));
    }
    sSong() {
      const st = this.st, r = st.round, side = playingSide(st), s = songOf(r, side), ord = sideOrder(st, r);
      const overlay = !st.screen || st.screen.overlay !== false;
      const sc = scoreboard(st);
      const lower = h("div", { class: "s-lower s-lower-" + side },
        h("div", { class: "s-lower-badge" }, h("span", null, SIDE[side].latin), h("small", null, "מתנגן עכשיו")),
        h("div", { class: "s-lower-main" },
          h("div", { class: "s-lower-title" + (s.hebrew ? " is-he" : "") }, bdi(s.title)),
          h("div", { class: "s-lower-meta" }, meta(s))),
        h("div", { class: "s-lower-theme" }, h("small", null, "דו־קרב " + pad(r + 1)), SET[r].theme),
        st.voteDuringSongs !== false ? h("div", { class: "s-lower-votes" }, h("span", { class: "s-onair" }, h("i"), "מצביעים עכשיו"), this.voteFlow("vflow-sm")) : null,
        h("div", { class: "s-lower-score" }, h("span", { class: "tv" }, L.tv + " ", h("b", null, sc.tv)), h("span", { class: "film" }, h("b", null, sc.film), " " + L.film)));
      if (this.hasVideo()) return h("div", { class: "s-song has-video" + (overlay ? "" : " no-overlay") }, overlay ? lower : null);
      const nextSide = st.phase === "song1" ? ord[1] : null;
      return h("div", { class: "s-song s-song-" + side },
        this.topBar("דו־קרב " + pad(r + 1) + " · " + SET[r].theme),
        h("div", { class: "s-hero s-hero-" + side },
          h("div", { class: "s-hero-media", "aria-hidden": "true" }, window.SCArt.img(videoKey(r, side), "hero-art")),
          h("div", { class: "s-hero-text" },
            h("div", { class: "s-hero-kick" }, h("span", { class: "eqbig" }, h("i"), h("i"), h("i"), h("i"), h("i")), "מתנגן עכשיו · ", SIDE[side].team),
            h("div", { class: "s-hero-title" + (s.hebrew ? " is-he" : "") }, bdi(s.title)),
            h("div", { class: "s-hero-meta" }, bdi(s.artist), s.source ? [" · ", h("b", null, s.source)] : null),
            st.voteDuringSongs !== false ? h("div", { class: "s-song-votes" }, h("span", { class: "s-onair" }, h("i"), "ההצבעה פתוחה בטלפון"), this.voteFlow("vflow-lg")) : null)),
        nextSide ? h("div", { class: "s-next" }, h("small", null, "ואחריו, " + SIDE[nextSide].team + ":"), " ", bdi(songOf(r, nextSide).title)) :
          h("div", { class: "s-next" }, h("small", null, "אחרי השיר הזה"), " נפתחת ההצבעה"));
    }
    /* "votes coming in": no numbers and no sides, just light flowing into a meter */
    voteFlow(cls) {
      const fill = h("i", { class: "vflow-fill" }), sparks = h("div", { class: "vflow-sparks", "aria-hidden": "true" });
      this.$flow = { fill, sparks, shown: -1 };
      const el = h("div", { class: "vflow " + (cls || ""), role: "img", "aria-label": "הצבעות נכנסות" }, fill, sparks);
      requestAnimationFrame(() => this.updateLive());
      return el;
    }
    flowTick(n, kFixed) {
      const f = this.$flow; if (!f || !f.fill.isConnected) return;
      const k = kFixed || Math.max(8, this.players.length * 0.35), p = 100 * (1 - Math.exp(-n / k));
      f.fill.style.width = (n ? Math.max(6, p) : 0) + "%";
      if (f.shown < 0) { f.shown = n; return; }
      const add = Math.min(n - f.shown, this.mini ? 3 : 8); f.shown = n;
      const cols = ["var(--tv-hi)", "var(--film-hi)", "var(--paper)"];
      for (let i = 0; i < add; i++) {
        if (f.sparks.childElementCount > 40) break;
        const sp = h("i", { class: "vspark", style: { insetInlineStart: (Math.random() * 100) + "%", background: cols[Math.floor(Math.random() * 3)], animationDelay: (i * 70) + "ms" } });
        f.sparks.append(sp); setTimeout(() => sp.remove(), 1500 + i * 70);
      }
    }
    sVoting() {
      const st = this.st, r = st.round, ord = sideOrder(st, r);
      this.$clock = leader("leader-lg");
      this.$total = h("b", null, "0");
      this.$bars = {};
      const col = (side) => {
        const s = songOf(r, side), pctEl = h("div", { class: "s-vcol-pct" }, st.liveBars ? "0%" : "?"), fill = h("i", { class: "s-vcol-fill" });
        this.$bars[side] = { pctEl, fill };
        return h("div", { class: "s-vcol s-vcol-" + side },
          window.SCArt.img(videoKey(r, side), "vcol-art"),
          h("div", { class: "s-vcol-side" }, SIDE[side].latin, h("small", null, SIDE[side].team)),
          h("div", { class: "s-vcol-title" + (s.hebrew ? " is-he" : "") }, bdi(s.title)),
          h("div", { class: "s-vcol-src" }, s.source),
          h("div", { class: "s-vcol-meter" }, fill), pctEl);
      };
      return h("div", { class: "s-voting" },
        this.topBar("דו־קרב " + pad(r + 1) + " · " + SET[r].theme),
        h("div", { class: "s-vote-grid" },
          col(ord[0]),
          h("div", { class: "s-vote-center" }, h("div", { class: "s-onair" }, h("i"), st.voteDuringSongs !== false ? "שניות אחרונות" : "ההצבעה פתוחה"), this.$clock),
          col(ord[1])),
        h("div", { class: "s-vote-qr" }, this.qr("scr-qr-mid")));
    }
    sReveal() {
      const st = this.st, r = st.round, res = (st.results || {})[r], ord = sideOrder(st, r);
      if (!res) return h("div", { class: "s-count" }, this.topBar(null), h("div", { class: "s-count-t" }, "סופרים קולות"), h("div", { class: "spinner big", "aria-hidden": "true" }));
      const w = res.winner;
      const bar = (side) => {
        const p = side === "tv" ? pct(res.tv, res.total) : (res.total ? 100 - pct(res.tv, res.total) : 0);
        return h("div", { class: "s-rcol s-rcol-" + side + (w === side ? " is-win" : w === "tie" ? "" : " is-lose") },
          h("div", { class: "s-rcol-bar" }, window.SCArt.img(videoKey(r, side), "rcol-art"), h("i", { style: { "--h": Math.max(p, 3) + "%" } })),
          h("div", { class: "s-rcol-pct" }, h("span", { class: "count", "data-to": p }, "0"), "%"),
          h("div", { class: "s-rcol-side" }, SIDE[side].team),
          h("div", { class: "s-rcol-title" + (songOf(r, side).hebrew ? " is-he" : "") }, bdi(songOf(r, side).title)),
          null);
      };
      const aw = (k, a) => a ? h("div", { class: "s-award" }, h("span", { class: "s-award-ico" }, k === "fast" ? "⚡" : "👑"),
        h("div", null, h("small", null, k === "fast" ? "המצביע המהיר" : "כתר המזל"), h("b", null, "#" + a.ticket), a.name ? h("span", null, a.name) : null)) : null;
      const el = h("div", { class: "s-reveal s-reveal-" + w },
        this.topBar("דו־קרב " + pad(r + 1) + " · " + SET[r].theme),
        h("div", { class: "s-reveal-grid" },
          bar(ord[0]),
          h("div", { class: "s-reveal-center" },
            h("div", { class: "s-reveal-k" }, w === "tie" ? "תיקו!" : "המנצח בדו־קרב"),
            h("div", { class: "s-reveal-w" }, w === "tie" ? "אין מנצח" : SIDE[w].team),
            w !== "tie" ? h("div", { class: "s-reveal-song" + (songOf(r, w).hebrew ? " is-he" : "") }, bdi(songOf(r, w).title)) : null),
          bar(ord[1])),
        h("div", { class: "s-awards" }, aw("fast", res.fastest), aw("luck", res.lucky)));
      requestAnimationFrame(() => {
        el.querySelectorAll(".count").forEach(c => {
          const to = +c.dataset.to, t0 = performance.now(), dur = reduceMotion() ? 1 : 1400;
          (function step(t) { const k = clamp((t - t0) / dur, 0, 1); c.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
        });
      });
      return el;
    }
    sFinal() {
      const st = this.st, c = champion(st), s = scoreboard(st), res = st.results || {};
      return h("div", { class: "s-final s-final-" + c },
        h("div", { class: "s-final-k" }, c === "tie" ? "תיקו מושלם" : "האלופים של הערב"),
        h("div", { class: "s-final-w" }, c === "tie" ? "שני המסכים" : SIDE[c].team),
        h("div", { class: "s-final-score" }, h("span", { class: "tv" }, L.tv + " ", h("b", null, s.tv)), h("span", { class: "sep" }, ":"), h("span", { class: "film" }, h("b", null, s.film), " " + L.film)),
        h("div", { class: "s-final-grid" }, SET.map((d, i) => {
          const x = res[i];
          return h("div", { class: "s-fg " + (x ? "w-" + x.winner : "") },
            h("span", { class: "s-fg-n" }, pad(i + 1)), h("span", { class: "s-fg-t" }, d.theme),
            h("span", { class: "s-fg-w" }, x ? (x.winner === "tie" ? "תיקו" : bdi(songOf(i, x.winner).title)) : "–"));
        })),
        h("div", { class: "s-final-foot" }, "תודה שהצבעתם!"));
    }
    sRaffle() {
      this.$slot = h("div", { class: "s-slot" }, "####");
      this.$rname = h("div", { class: "s-raffle-name" }, "");
      return h("div", { class: "s-raffle" },
        h("div", { class: "s-raffle-k" }, "ההגרלה הגדולה"),
        h("div", { class: "s-raffle-stub" }, h("span", { class: "s-raffle-admit" }, "ADMIT ONE"), this.$slot),
        this.$rname,
        h("div", { class: "s-raffle-foot" }, "כל מי שנכנס לאפליקציה הערב בהגרלה"));
    }
    spinRaffle() {
      const rf = this.st.raffle; if (!rf || !this.$slot) return;
      const tickets = this.players.map(p => p.ticket).filter(Boolean); if (!tickets.length) tickets.push("1234");
      const t0 = performance.now(), dur = reduceMotion() ? 10 : 4200; let last = 0;
      const slot = this.$slot, nm = this.$rname; nm.textContent = ""; slot.classList.remove("is-win");
      const step = (t) => {
        const k = (t - t0) / dur;
        if (k >= 1) { slot.textContent = "#" + rf.ticket; slot.classList.add("is-win"); nm.textContent = rf.name || ""; confetti(this.canvas, SIDE_COLORS.tie, this.mini ? 0.5 : 2); return; }
        const gap = 40 + k * k * 380;
        if (t - last > gap) { last = t; slot.textContent = "#" + tickets[Math.floor(Math.random() * tickets.length)]; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    sEncore() {
      const C = CFG.CONTACT, es = SHOW.encores && this.st.encoreSide;
      if (es) {
        const sg = songOf("enc", es);
        if (this.hasVideo()) return h("div", { class: "s-song has-video" }, h("div", { class: "s-lower s-lower-" + es },
          h("div", { class: "s-lower-badge" }, h("span", null, SIDE[es].latin), h("small", null, "הדרן")),
          h("div", { class: "s-lower-main" }, h("div", { class: "s-lower-title" }, bdi(sg.title)), h("div", { class: "s-lower-meta" }, meta(sg)))));
        return h("div", { class: "s-song s-song-" + es },
          this.topBar("הדרן"),
          h("div", { class: "s-hero s-hero-" + es },
            h("div", { class: "s-hero-media", "aria-hidden": "true" }, window.SCArt.img(videoKey("enc", es), "hero-art")),
            h("div", { class: "s-hero-text" },
              h("div", { class: "s-hero-kick" }, h("span", { class: "eqbig" }, h("i"), h("i"), h("i"), h("i"), h("i")), "הדרן! · ", SIDE[es].team),
              h("div", { class: "s-hero-title" }, bdi(sg.title)),
              h("div", { class: "s-hero-meta" }, bdi(sg.artist)))),
          h("div", { class: "s-next" }, "רוצים את Soundclash באירוע שלכם? ", h("b", null, C.phoneYinon)));
      }
      return h("div", { class: "s-encore" },
        h("div", { class: "s-encore-t" }, "הדרן!"),
        h("div", { class: "s-encore-sub" }, "רוצים את Soundclash באירוע שלכם?"),
        h("div", { class: "s-encore-phone" }, C.phoneYinon),
        h("div", { class: "s-encore-site" }, C.site.replace(/^https?:\/\//, "")),
        this.socialStrip("s-social-big"));
    }
    /* -- live numbers -- */
    updateLive() {
      const st = this.st; if (!st) return;
      if (st.phase === "lobby") { this.flowTick(this.players.length, 30); this.fillPred(); }
      if (st.phase === "song1" || st.phase === "song2") {
        const n = tally(this.votes.filter(v => v.r === st.round)).total;
        this.flowTick(n);
      }
      if (st.phase === "voting" && this.$bars) {
        const t = tally(this.votes.filter(v => v.r === st.round));
        ["tv", "film"].forEach(s => {
          const b = this.$bars[s]; if (!b) return;
          const p = pct(t[s], t.total);
          if (st.liveBars) { b.pctEl.textContent = (t.total ? p : 0) + "%"; b.fill.style.width = (t.total ? Math.max(p, 2) : 2) + "%"; }
          else { b.pctEl.textContent = "?"; b.fill.style.width = "0%"; }
        });
      }
    }
    tickClock() {
      const st = this.st; if (!st || st.phase !== "voting" || !this.$clock) return;
      const left = Math.max(0, st.votingEndsAt - Date.now()), total = (st.voteSeconds || 30) * 1000;
      this.$clock.set(Math.ceil(left / 1000), left / total);
    }
  }

  /* =========================================================================
     ADMIN — the show's control desk
     ========================================================================= */
  class AdminView {
    constructor(root, be, opts) {
      this.root = root; this.be = be; this.opts = opts || {};
      root.classList.add("adm"); root.setAttribute("dir", "rtl");
      this.votes = []; this.players = []; this.screenMeta = {}; this.crowd = this.opts.crowd || null;
      this.unlocked = !be.isLive() && !CFG.DEMO_ADMIN_PIN;
      this.admin = be.isLive() ? be.adminUser() : { email: "demo" };
      if (be.isLive()) be.onAuth(u => { this.admin = u; this.build(); });
      this.build();
      be.onState(st => { const prev = this.st; this.st = st; this.onState(prev); });
      be.onPlayers(ps => { this.players = ps; this.updateCounts(); });
      be.onScreenMeta(m => { this.screenMeta = m || {}; this.renderVideos(); });
      this.tick = setInterval(() => this.tickClock(), 200);
      document.addEventListener("keydown", (e) => this.onKey(e));
    }
    build() {
      const live = this.be.isLive();
      if ((live && !this.admin) || (!live && !this.unlocked)) { this.root.replaceChildren(this.loginView()); this.built = false; return; }
      if (this.built) return; this.built = true;
      this.$mode = h("span", { class: "pill " + (live ? "pill-live" : "pill-demo") }, live ? "חי · Firebase" : "מצב הדגמה");
      this.$players = h("b", null, "0");
      this.$conn = h("span", { class: "pill pill-ok" }, "מחובר");
      const setConn = (on) => { this.$conn.className = "pill " + (on ? "pill-ok" : "pill-off"); this.$conn.textContent = on ? "מחובר" : "אין חיבור · הפקודות יישלחו כשיחזור"; };
      setConn(this.be.online()); this.be.on("conn", setConn);
      this.$promo = h("button", { class: "btn-ghost btn-promo", type: "button", onclick: () => this.promo() }, "📣 \"עקבו אחרינו\" על המסך ובטלפונים");
      this.$run = h("ol", { class: "run" });
      this.$now = h("div", { class: "now" });
      this.$next = h("button", { class: "btn-next", type: "button", onclick: () => this.next() }, "…");
      this.$back = h("button", { class: "btn-ghost", type: "button", onclick: () => this.back(), title: "קיצור: B" }, "→ צעד אחורה");
      this.$ctx = h("div", { class: "ctx" });
      this.$tally = h("div", { class: "tally" });
      this.$videos = h("div", { class: "vids" });
      this.$vnow = h("div", { class: "vnow" });
      this.$crowd = h("div", { class: "crowd" });
      this.$settings = h("div", { class: "settings" });
      this.previewHost = h("div", { class: "preview-host" });
      this.root.replaceChildren(
        h("header", { class: "adm-top" },
          h("div", { class: "brand" }, h("span", { class: "brand-word" }, "SOUND", h("b", null, "CLASH")), h("span", { class: "brand-sub" }, "שולחן הבמאי")),
          this.showPicker(), this.$mode, this.$conn,
          h("span", { class: "adm-count" }, this.$players, " בזירה"),
          live ? h("button", { class: "btn-link", type: "button", onclick: () => this.be.signOut() }, "יציאה") : null),
        h("div", { class: "adm-grid" },
          h("section", { class: "adm-col adm-run", "aria-label": "סדר המופע" }, h("h2", { class: "adm-h" }, "סדר המופע"), this.$run),
          h("section", { class: "adm-col adm-main", "aria-label": "שליטה" },
            this.$now,
            h("div", { class: "go-row" }, this.$next, this.$back),
            h("p", { class: "kbd-hint" }, "רווח = הצעד הבא · V = נגן/עצור סרטון · B = אחורה"),
            this.$ctx, this.$tally, this.$promo, this.$settings),
          h("section", { class: "adm-col adm-side", "aria-label": "מסך ווידאו" },
            h("div", { class: "adm-h-row" }, h("h2", { class: "adm-h" }, "מה רואים על המסך"),
              h("label", { class: "chk chk-sm" }, h("input", { id: "adm-safe", type: "checkbox", onchange: (e) => this.previewHost.classList.toggle("show-safe", e.target.checked) }), "קו האזור הבטוח")),
            this.previewHost,
            h("h2", { class: "adm-h" }, "סרטוני AI"),
            this.$vnow, this.$videos,
            h("h2", { class: "adm-h" }, "מילים לשירים"), this.$lyrics = h("div", { class: "lyr" }),
            h("h2", { class: "adm-h" }, "עובדות על השירים"), this.$facts = h("div", { class: "lyr" }),
            this.crowd ? h("h2", { class: "adm-h" }, "חזרה עם קהל וירטואלי") : null, this.crowd ? this.$crowd : null)));
      this.preview = new ScreenView(this.previewHost, this.be, { mini: true });
      this.lyricsMap = {}; this.be.onLyricsList(m => { this.lyricsMap = m || {}; this.renderLyrics(); });
      this.factsMap = {}; this.be.onFactsList(m => { this.factsMap = m || {}; this.renderFacts(); });
      if (this.st) this.onState(null);
    }
    loginView() {
      const live = this.be.isLive();
      const email = h("input", { id: "adm-email", class: "field", type: "email", autocomplete: "username", placeholder: "אימייל" });
      const pw = h("input", { id: "adm-pw", class: "field", type: "password", autocomplete: live ? "current-password" : "off", placeholder: live ? "סיסמה" : "קוד" });
      const err = h("p", { class: "err", role: "alert" });
      const submit = async (e) => {
        e.preventDefault(); err.textContent = "";
        if (!live) { if (pw.value === CFG.DEMO_ADMIN_PIN) { this.unlocked = true; this.build(); } else err.textContent = "הקוד לא נכון."; return; }
        try { await this.be.signIn(email.value.trim(), pw.value); } catch (ex) { err.textContent = "הכניסה נכשלה. בדקו את האימייל והסיסמה של משתמש האדמין ב-Firebase."; }
      };
      return h("form", { class: "login", onsubmit: submit },
        h("div", { class: "brand" }, h("span", { class: "brand-word" }, "SOUND", h("b", null, "CLASH")), h("span", { class: "brand-sub" }, "שולחן הבמאי")),
        h("h1", { class: "adm-h1" }, "כניסה לאדמין"),
        live ? [h("label", { for: "adm-email", class: "field-label" }, "אימייל"), email] : null,
        h("label", { for: "adm-pw", class: "field-label" }, live ? "סיסמה" : "קוד כניסה"), pw,
        h("button", { class: "btn-primary", type: "submit" }, "כניסה"), err);
    }
    onState(prev) {
      if (!this.built) return;
      const st = this.st;
      if (!prev || prev.round !== st.round || this.vRound !== st.round) {
        if (this.unVotes) this.unVotes(); this.vRound = st.round; this.votes = [];
        this.unVotes = this.be.onVotes(st.round, v => { this.votes = v; this.renderTally(); });
      }
      const pr = st.promo, prOn = pr && pr.at && pr.at + 25000 > Date.now();
      this.$promo.textContent = prOn ? "■ הסתרת \"עקבו אחרינו\"" : "📣 \"עקבו אחרינו\" על המסך ובטלפונים";
      this.$promo.classList.toggle("is-on", !!prOn);
      clearTimeout(this._prT); if (prOn) this._prT = setTimeout(() => this.onState(this.st), pr.at + 25100 - Date.now());
      if (!this._lyrDone) { this._lyrDone = true; this.renderLyrics(); this.renderFacts(); }
      this.renderRun(); this.renderNow(); this.renderCtx(); this.renderTally(); this.renderVideos(); this.renderSettings(); this.renderCrowd();
      if (this.crowd) this.crowd.onState(st);
    }
    updateCounts() { if (this.$players) this.$players.textContent = this.players.length; this.renderCrowd(); }
    /* -- state machine -- */
    nextAction() {
      const st = this.st, r = st.round;
      switch (st.phase) {
        case "lobby": return { label: "פתיחת דו־קרב 1 · " + SET[0].theme, run: () => this.goIntro(0) };
        case "intro": { const sd = sideOrder(st, r)[0]; return { label: "▶ מתחילים את השיר הראשון: ", song: songOf(r, sd).title, run: () => this.goSong("song1") }; }
        case "song1": { const sd = sideOrder(st, r)[1]; return { label: "השיר הראשון נגמר ← ▶ השיר השני: ", song: songOf(r, sd).title, run: () => this.goSong("song2") }; }
        case "song2": return { label: "השיר השני נגמר ← 🗳 ספירה לאחור להצבעה (" + (st.voteSeconds || 20) + " שניות)", run: () => this.openVoting() };
        case "voting": return { label: "⏹ סגירת ההצבעה וחשיפת התוצאה", run: () => this.closeVoting() };
        case "reveal": return r + 1 < N ? { label: "לדו־קרב " + (r + 2) + " · " + SET[r + 1].theme, run: () => this.goIntro(r + 1) } : { label: "🏆 הכרזת האלופים", run: () => this.set({ phase: "final", video: this.vid("", "stop") }) };
        case "final": return { label: "🎟 ההגרלה הגדולה", run: () => this.set({ phase: "raffle", raffle: null }) };
        case "raffle": return st.raffle ? { label: "הדרן", run: () => this.set({ phase: "encore", encoreSide: null }) } : { label: "🎟 הגרלת זוכה", run: () => this.drawRaffle() };
        default: return { label: "המופע הסתיים", run: null };
      }
    }
    back() {
      const st = this.st, r = st.round;
      const map = { intro: r > 0 ? { phase: "reveal", round: r - 1 } : { phase: "lobby" }, song1: { phase: "intro" }, song2: { phase: "song1" }, voting: { phase: "song2" }, reveal: { phase: "song2" }, final: { phase: "reveal", round: N - 1 }, raffle: { phase: "final" }, encore: { phase: "raffle" } };
      const m = map[st.phase]; if (!m) return;
      const patch = Object.assign({}, m);
      if (patch.phase === "song1" || patch.phase === "song2") {
        const sd = sideOrder(st, patch.round == null ? r : patch.round)[patch.phase === "song1" ? 0 : 1];
        patch.video = this.vid(videoKey(patch.round == null ? r : patch.round, sd), "play");
      } else patch.video = this.vid("", "stop");
      this.set(patch);
    }
    vid(key, cmd) { const seq = ((this.st.video && this.st.video.seq) || 0) + 1; return { key, cmd, seq }; }
    set(p) { return this.be.setState(p).catch(e => this.toast("השמירה נכשלה: " + (e.message || e))); }
    goIntro(r) { return this.set({ phase: "intro", round: r, votingEndsAt: 0, video: this.vid("", "stop") }); }
    goSong(ph) {
      const st = this.st, sd = sideOrder(st, st.round)[ph === "song1" ? 0 : 1];
      return this.set({ phase: ph, video: this.vid(videoKey(st.round, sd), "play") });
    }
    openVoting() {
      /* the song-2 video keeps running under the voting graphics, so there is no black gap */
      const secs = this.st.voteSeconds || 20;
      return this.set({ phase: "voting", votingEndsAt: Date.now() + secs * 1000 });
    }
    async closeVoting(redrawLucky) {
      if (this._closing) return; this._closing = true;
      try {
        const r = this.st.round;
        let all;
        try { all = await this.be.getVotes(r); } catch (e) { all = this.votes.filter(v => v.r === r); this.toast("אין חיבור לשרת. התוצאה חושבה מהקולות שכבר הגיעו."); }
        const votes = all.filter(v => v.side === "tv" || v.side === "film");
        const t = tally(votes);
        const winner = t.tv === t.film ? "tie" : t.tv > t.film ? "tv" : "film";
        const pick = (v) => v ? { uid: v.uid, ticket: v.ticket || "", name: v.name || "" } : null;
        const sorted = votes.slice().sort((a, b) => (a.firstAt || a.at || 0) - (b.firstAt || b.at || 0));
        const prevRes = (this.st.results || {})[r];
        const fastest = redrawLucky && prevRes ? prevRes.fastest : pick(sorted[0]);
        const pool = votes.filter(v => !fastest || v.uid !== fastest.uid);
        const lucky = pick(pool[Math.floor(Math.random() * pool.length)]);
        await this.set({ phase: "reveal", votingEndsAt: 0, video: redrawLucky ? this.st.video : this.vid("", "stop"), results: { [r]: { tv: t.tv, film: t.film, total: t.total, winner, fastest, lucky } } });
      } finally { this._closing = false; }
    }
    promo() {
      const p = this.st.promo || {}, on = p.at && p.at + 25000 > Date.now();
      this.set({ promo: on ? { seq: (p.seq || 0) + 1, at: 0 } : { seq: (p.seq || 0) + 1, at: Date.now() } });
    }
    drawRaffle() {
      const ps = this.players.filter(p => p.ticket);
      if (!ps.length) { this.toast("אין עדיין כרטיסים בזירה."); return; }
      const w = ps[Math.floor(Math.random() * ps.length)];
      this.set({ raffle: { uid: w.uid, ticket: w.ticket, name: w.name || "", at: Date.now() } });
    }
    next() { const a = this.nextAction(); if (a && a.run) a.run(); }
    onKey(e) {
      if (!this.built || !this.st) return;
      const tag = (e.target && e.target.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.code === "Space" || e.key === "ArrowLeft") { if (tag === "BUTTON" && e.code === "Space") return; e.preventDefault(); this.next(); }
      else if (e.key === "b" || e.key === "B" || e.key === "נ") this.back();
      else if (e.key === "v" || e.key === "V" || e.key === "ה") this.videoCmd(this.st.video && this.st.video.cmd === "play" ? "pause" : "play");
    }
    toast(msg) {
      const t = h("div", { class: "toast", role: "status" }, msg); this.root.append(t); setTimeout(() => t.remove(), 4000);
    }
    /* -- renderers -- */
    renderRun() {
      const st = this.st, res = st.results || {}, cur = st.round;
      const row = (label, active, done, onJump, extra) => h("li", { class: "run-row" + (active ? " is-now" : "") + (done ? " is-done" : "") },
        label, extra || null, onJump ? h("button", { class: "run-jump", type: "button", onclick: onJump, "aria-label": "קפיצה" }, "קפיצה") : null);
      const items = [row(h("span", { class: "run-t" }, h("span", { class: "run-n" }, "00"), "לובי וכניסת קהל"), st.phase === "lobby", st.phase !== "lobby", st.phase !== "lobby" ? () => this.set({ phase: "lobby", video: this.vid("", "stop") }) : null)];
      SET.forEach((d, i) => {
        const x = res[i], ord = sideOrder(st, i);
        const active = i === cur && ["intro", "song1", "song2", "voting", "reveal"].includes(st.phase);
        items.push(row(
          h("span", { class: "run-t" }, h("span", { class: "run-n" }, pad(i + 1)), h("span", { class: "run-theme" }, d.theme),
            h("span", { class: "run-songs" }, ord.map((s, j) => h("span", { class: "run-song s-" + s }, h("b", null, (j + 1) + " · " + SIDE[s].latin), " ", bdi(songOf(i, s).title)))),
            h("span", { class: "run-singer" }, d.singer)),
          active, !!x, active ? null : () => this.goIntro(i),
          x ? h("span", { class: "run-res w-" + x.winner }, x.winner === "tie" ? "תיקו" : SIDE[x.winner].latin, " ", pct(x.tv, x.total) + ":" + (x.total ? 100 - pct(x.tv, x.total) : 0)) : null));
      });
      items.push(row(h("span", { class: "run-t" }, h("span", { class: "run-n" }, "🏆"), "אלופים · הגרלה · הדרן"), ["final", "raffle", "encore"].includes(st.phase), false, null));
      this.$run.replaceChildren(...items);
    }
    renderNow() {
      const st = this.st, t = phaseTitle(st), a = this.nextAction();
      this.$now.replaceChildren(
        h("p", { class: "now-eyebrow" }, h("span", { class: "now-dot ph-" + st.phase }), t.eyebrow),
        h("h1", { class: "now-title" }, bdi(t.title)),
        t.sub ? h("p", { class: "now-sub" }, bdi(t.sub)) : null,
        this.stepStrip());
      this.$next.replaceChildren(a.label, a.song ? bdi(a.song) : ""); this.$next.disabled = !a.run;
      this.$back.disabled = st.phase === "lobby";
    }
    stepStrip() {
      const st = this.st, r = st.round;
      if (!["intro", "song1", "song2", "voting", "reveal"].includes(st.phase)) return null;
      const ord = sideOrder(st, r), order = ["intro", "song1", "song2", "voting", "reveal"], cur = order.indexOf(st.phase);
      const steps = [
        { ph: "intro", label: "הצגת הדו־קרב", go: () => this.goIntro(r) },
        { ph: "song1", label: "שיר 1 · " + SIDE[ord[0]].latin, sub: songOf(r, ord[0]).title, go: () => this.goSong("song1") },
        { ph: "song2", label: "שיר 2 · " + SIDE[ord[1]].latin, sub: songOf(r, ord[1]).title, go: () => this.goSong("song2") },
        { ph: "voting", label: "ספירה לאחור", sub: (st.voteSeconds || 20) + " שניות", go: () => this.openVoting() },
        { ph: "reveal", label: "תוצאה", go: () => this.closeVoting() }
      ];
      return h("ol", { class: "steps", "aria-label": "שלבי הדו־קרב" }, steps.map((x, i) =>
        h("li", null, h("button", { type: "button", class: "step" + (i === cur ? " is-now" : i < cur ? " is-done" : ""), "aria-current": i === cur ? "step" : null, onclick: x.go },
          h("span", { class: "step-n" }, i < cur ? "✓" : String(i + 1)), h("span", { class: "step-l" }, x.label), x.sub ? h("span", { class: "step-s" }, bdi(x.sub)) : null))));
    }
    showPicker() {
      const all = Object.values(window.SC_SHOWS || {});
      if (all.length < 2) return null;
      return h("label", { class: "show-pick" }, h("span", null, "מופע:"),
        h("select", { id: "adm-show", class: "field field-sm", title: "החלפת מופע אפשרית בלובי (אחרי איפוס)", disabled: !!(this.st && this.st.phase !== "lobby"), onchange: (e) => this.switchShow(e.target.value) },
          all.map(x => h("option", { value: x.id, selected: x.id === SHOW.id }, x.title))));
    }
    async switchShow(id) {
      if (id === SHOW.id) return;
      if (this.st && this.st.phase !== "lobby") { this.toast("אפשר להחליף מופע רק בלובי. אפסו קודם את המופע הנוכחי."); return; }
      this.toast("עוברים למופע… כל הטלפונים והמסך יתעדכנו");
      try { await this.be.setActiveShow(id); } catch (e) { this.toast("ההחלפה נכשלה: " + (e.message || e)); return; }
      setTimeout(() => location.reload(), 600);
    }
    renderCtx() {
      const st = this.st, r = st.round, kids = [];
      if (st.phase === "voting") {
        this.$clock = leader("leader-md");
        kids.push(h("div", { class: "ctx-vote" }, this.$clock,
          h("div", { class: "ctx-btns" },
            h("button", { class: "btn-ghost", type: "button", onclick: () => this.set({ votingEndsAt: Math.max(Date.now(), st.votingEndsAt) + 10000 }) }, "+10 שניות"),
            h("button", { class: "btn-ghost", type: "button", onclick: () => this.closeVoting() }, "סגירה עכשיו"),
            h("label", { class: "chk" }, h("input", { id: "adm-autoclose", type: "checkbox", checked: this.autoClose !== false, onchange: (e) => { this.autoClose = e.target.checked; } }), "סגירה אוטומטית כשהזמן נגמר"))));
      } else this.$clock = null;
      const shows = Object.values(window.SC_SHOWS || {});
      if (st.phase === "lobby" && shows.length > 1) kids.push(h("div", { class: "ctx-shows" },
        h("p", null, "איזה מופע הערב? ", h("small", null, "הקהל והמסך נכנסים אוטומטית למופע שבחרת")),
        h("div", { class: "ctx-btns" }, shows.map(x => h("button", { type: "button", class: "show-choice" + (x.id === SHOW.id ? " is-on" : ""), "aria-pressed": String(x.id === SHOW.id),
          onclick: () => this.switchShow(x.id) }, h("b", null, x.title), h("small", null, x.id === SHOW.id ? "✓ פעיל עכשיו" : x.setlist.length + " דו־קרבות"))))));
      if (st.phase === "reveal" && (st.results || {})[r]) {
        const x = st.results[r];
        kids.push(h("div", { class: "ctx-awards" },
          h("p", null, "⚡ המצביע המהיר: ", h("b", null, x.fastest ? "#" + x.fastest.ticket + (x.fastest.name ? " " + x.fastest.name : "") : "–")),
          h("p", null, "👑 כתר המזל: ", h("b", null, x.lucky ? "#" + x.lucky.ticket + (x.lucky.name ? " " + x.lucky.name : "") : "–")),
          h("button", { class: "btn-ghost", type: "button", onclick: () => this.closeVoting(true) }, "הגרלת כתר מזל מחדש")));
      }
      if (st.phase === "encore" && SHOW.encores) kids.push(h("div", { class: "ctx-awards" },
        h("p", null, "איזה הדרן מנגנים?"),
        h("div", { class: "ctx-btns" }, ["tv", "film"].map(sd => h("button", { type: "button", class: st.encoreSide === sd ? "btn-primary" : "btn-ghost",
          onclick: () => this.set({ encoreSide: sd, video: this.vid(videoKey("enc", sd), "play") }) }, "🎤 " + SIDE[sd].latin + ": ", bdi(songOf("enc", sd).title))))));
      if (st.phase === "raffle" && st.raffle) kids.push(h("div", { class: "ctx-awards" }, h("p", null, "🎟 זוכה: ", h("b", null, "#" + st.raffle.ticket + (st.raffle.name ? " " + st.raffle.name : ""))),
        h("button", { class: "btn-ghost", type: "button", onclick: () => this.drawRaffle() }, "הגרלה מחדש")));
      if (["intro", "song1", "song2"].includes(st.phase)) {
        const ord = sideOrder(st, r);
        kids.push(h("div", { class: "ctx-order" }, h("span", null, "סדר בדו־קרב הזה: ", h("b", null, SIDE[ord[0]].team), " ואז ", h("b", null, SIDE[ord[1]].team)),
          st.phase === "intro" ? h("button", { class: "btn-ghost", type: "button", onclick: () => { const o = Object.assign({}, st.order || {}); o[r] = other(firstSide(st, r)); this.set({ order: o }); } }, "החלפת סדר") : null));
      }
      this.$ctx.replaceChildren(...kids);
    }
    renderTally() {
      if (!this.$tally || !this.st) return;
      const st = this.st, r = st.round;
      const songsOpen = (st.phase === "song1" || st.phase === "song2") && st.voteDuringSongs !== false;
      if (!["voting", "reveal"].includes(st.phase) && !songsOpen) { this.$tally.hidden = true; return; }
      this.$tally.hidden = false;
      const t = st.phase === "reveal" && (st.results || {})[r] ? st.results[r] : tally(this.votes.filter(v => v.r === r));
      const tv = pct(t.tv, t.total);
      this.$tally.replaceChildren(
        h("div", { class: "tally-head" }, h("span", null, st.phase === "reveal" ? "תוצאה סופית" : "ספירה חיה (רק את/ה רואה את האחוזים כאן)"), h("b", null, t.total + " קולות")),
        h("div", { class: "tally-bar" }, h("i", { class: "tv", style: { width: (t.total ? tv : 50) + "%" } }), h("i", { class: "film", style: { width: (t.total ? 100 - tv : 50) + "%" } })),
        h("div", { class: "tally-lab" }, h("span", { class: "tv" }, h("bdi", { dir: "ltr" }, L.tv + " " + (t.total ? tv : 0) + "% · " + t.tv)), h("span", { class: "film" }, h("bdi", { dir: "ltr" }, L.film + " " + (t.total ? 100 - tv : 0) + "% · " + t.film))));
    }
    renderSettings() {
      const st = this.st;
      const secs = h("select", { id: "adm-secs", class: "field field-sm", onchange: (e) => this.set({ voteSeconds: +e.target.value }) },
        [10, 15, 20, 25, 30, 45].map(s => h("option", { value: s, selected: (st.voteSeconds || 20) === s }, s + " שניות")));
      this.$settings.replaceChildren(
        h("h2", { class: "adm-h" }, "הגדרות"),
        h("div", { class: "set-row" }, h("label", { for: "adm-secs" }, "זמן הצבעה"), secs),
        h("div", { class: "set-row" }, h("label", { class: "chk" }, h("input", { id: "adm-during", type: "checkbox", checked: st.voteDuringSongs !== false, onchange: (e) => this.set({ voteDuringSongs: e.target.checked }) }), "ההצבעה פתוחה כבר מתחילת השיר הראשון")),
        h("div", { class: "set-row" }, h("label", { class: "chk" }, h("input", { id: "adm-live", type: "checkbox", checked: st.liveBars !== false, onchange: (e) => this.set({ liveBars: e.target.checked }) }), "להציג אחוזים חיים על המסך בזמן ההצבעה")),
        h("div", { class: "set-row" }, h("label", { class: "chk" }, h("input", { id: "adm-qr", type: "checkbox", checked: !!(st.screen && st.screen.qr), onchange: (e) => this.set({ screen: Object.assign({}, st.screen, { qr: e.target.checked }) }) }), "QR קבוע בפינת המסך (למאחרים)")),
        this.dangerZone());
    }
    dangerZone() {
      const wrap = h("div", { class: "danger" });
      const ask = () => wrap.replaceChildren(h("span", null, "לאפס את כל ההצבעות, הכרטיסים והתוצאות?"),
        h("button", { class: "btn-danger", type: "button", onclick: async () => { await this.be.resetShow(); if (this.crowd) this.crowd.reset(); this.toast("המופע אופס."); } }, "כן, לאפס"),
        h("button", { class: "btn-ghost", type: "button", onclick: () => wrap.replaceChildren(btn) }, "ביטול"));
      const btn = h("button", { class: "btn-ghost btn-warn", type: "button", onclick: ask }, "איפוס מופע");
      wrap.append(btn); return wrap;
    }
    videoCmd(cmd, key) {
      const v = this.st.video || {}, k = key != null ? key : (v.key || (playingSide(this.st) ? videoKey(this.st.round, playingSide(this.st)) : ""));
      if (!k && cmd !== "stop") { this.toast("בחרו סרטון מהרשימה."); return; }
      this.set({ video: this.vid(k, cmd) });
    }
    renderVideos() {
      if (!this.$videos || !this.st) return;
      const st = this.st, v = st.video || {}, meta = this.screenMeta || {}, have = new Set(meta.videos || []);
      const avail = (k) => have.has(k) || !!meta.base;
      const overlayOn = !st.screen || st.screen.overlay !== false;
      this.$vnow.replaceChildren(
        h("div", { class: "vnow-row" },
          h("span", { class: "vnow-k" }, v.key && v.cmd !== "stop" ? "🎞 " + v.key + (v.cmd === "pause" ? " · עצור" : " · מתנגן") : "אין סרטון על המסך"),
          meta.status && /^missing/.test(meta.status) ? h("span", { class: "warn" }, "הקובץ לא נמצא במחשב המסך") : null,
          meta.status === "blocked" ? h("span", { class: "warn" }, "הדפדפן במסך חסם ניגון. לחצו פעם אחת על המסך.") : null),
        h("div", { class: "vnow-btns" },
          h("button", { class: "btn-ghost", type: "button", onclick: () => this.videoCmd("play") }, "▶ נגן"),
          h("button", { class: "btn-ghost", type: "button", onclick: () => this.videoCmd("pause") }, "❚❚ עצור"),
          h("button", { class: "btn-ghost", type: "button", onclick: () => this.videoCmd("restart") }, "↺ מההתחלה"),
          h("button", { class: "btn-ghost", type: "button", onclick: () => this.videoCmd("stop") }, "■ הסתר"),
          h("label", { class: "chk" }, h("input", { id: "adm-overlay", type: "checkbox", checked: overlayOn, onchange: (e) => this.set({ screen: Object.assign({}, st.screen, { overlay: e.target.checked }) }) }), "שם השיר מעל הסרטון")),
        h("p", { class: "vnow-meta" }, meta.at ? (have.size ? have.size + " סרטונים טעונים במחשב המסך" : meta.base ? "הסרטונים נטענים מכתובת" : "במחשב המסך עוד לא נטענה תיקיית סרטונים") : "מסך הבמה עוד לא מחובר"));
      const keys = [{ k: "lobby", t: "לופ לובי" }];
      SET.forEach((d, i) => sideOrder(st, i).forEach(s => keys.push({ k: videoKey(i, s), t: songOf(i, s).title, s })));
      if (SHOW.encores) ["tv", "film"].forEach(sd => keys.push({ k: videoKey("enc", sd), t: "הדרן · " + songOf("enc", sd).title, s: sd }));
      keys.push({ k: "final", t: "לופ סיום" });
      this.$videos.replaceChildren(...keys.map(x => h("button", {
        type: "button", class: "vid" + (v.key === x.k && v.cmd !== "stop" ? " is-on" : "") + (avail(x.k) ? " is-ok" : ""), onclick: () => this.videoCmd("play", x.k), title: avail(x.k) ? "זמין" : "חסר קובץ"
      }, h("span", { class: "vid-k" + (x.s ? " s-" + x.s : "") }, x.k), h("span", { class: "vid-t" }, bdi(x.t)))));
    }
    renderLyrics() {
      if (!this.$lyrics || !this.st) return;
      const st = this.st, map = this.lyricsMap || {};
      const keys = []; SET.forEach((d, i) => sideOrder(st, i).forEach(s => keys.push({ k: videoKey(i, s), s, song: songOf(i, s), i })));
      if (SHOW.encores) ["tv", "film"].forEach(sd => keys.push({ k: videoKey("enc", sd), s: sd, song: songOf("enc", sd), i: "enc" }));
      if (!this.lyrKey) this.lyrKey = keys[0].k;
      const cur = keys.find(x => x.k === this.lyrKey) || keys[0];
      const sel = h("select", { id: "adm-lyr-song", class: "field field-sm", onchange: (e) => { this.lyrKey = e.target.value; this.renderLyrics(); } },
        keys.map(x => h("option", { value: x.k, selected: x.k === cur.k }, (map[x.k] ? "✓ " : "· ") + (x.i === "enc" ? "הדרן" : pad(x.i + 1)) + " " + SIDE[x.s].short + " · \u2068" + x.song.title + "\u2069")));
      const ta = h("textarea", { id: "adm-lyr-text", class: "field lyr-text", rows: "10", dir: cur.song.hebrew ? "rtl" : "ltr", placeholder: "מדביקים כאן את מילות השיר. שורה ריקה = רווח בין בתים." });
      ta.value = (map[cur.k] && map[cur.k].text) || "";
      const msg = h("span", { class: "lyr-msg", role: "status" }, this.lyrMsg || ""); this.lyrMsg = "";
      const save = async () => {
        const text = ta.value.replace(/\r/g, "").trim().slice(0, 20000);
        const m = text ? "נשמר ✓ הקהל רואה את המילים מעכשיו." : "המילים נמחקו.";
        try { this.lyrMsg = m; await this.be.setLyrics(cur.k, text); msg.textContent = m; }
        catch (e) { msg.textContent = "השמירה נכשלה: " + (e.message || e); }
      };
      const done = keys.filter(x => map[x.k]).length;
      const impTa = h("textarea", { id: "adm-lyr-import", class: "field lyr-text", rows: "5", dir: "ltr", placeholder: "מדביקים כאן את כל התוכן של app.py" });
      const impMsg = h("span", { class: "lyr-msg", role: "status" });
      const runImport = async () => {
        const found = parseOldLyrics(impTa.value);
        const plan = [];
        found.forEach(f => { const x = keys.find(k => k.song && norm(k.song.title) === norm(f.song)); if (x) plan.push({ k: x.k, text: f.text }); });
        if (!plan.length) { impMsg.textContent = "לא נמצאו מילים שמתאימות לשירים של המופע הזה."; return; }
        impMsg.textContent = "שומר " + plan.length + " שירים…";
        try { for (const p of plan) await this.be.setLyrics(p.k, p.text.slice(0, 20000)); this.lyrMsg = "יובאו מילים ל-" + plan.length + " שירים ✓"; impMsg.textContent = this.lyrMsg; impTa.value = ""; }
        catch (e) { impMsg.textContent = "הייבוא נכשל: " + (e.message || e); }
      };
      const imp = h("details", { class: "lyr-imp" }, h("summary", null, "ייבוא מילים מהאפליקציה הקודמת"),
        h("p", { class: "muted" }, "פותחים בגיטהאב את הקובץ app.py של האפליקציה הקודמת, מעתיקים את כל התוכן ומדביקים כאן. האפליקציה מוצאת את המילים של כל שיר לפי שם השיר ושומרת אותן אצלו."),
        impTa, h("div", { class: "set-row" }, h("button", { class: "btn-ghost", type: "button", onclick: runImport }, "ייבוא"), impMsg));
      this.$lyrics.replaceChildren(
        h("p", { class: "muted" }, "המילים מוצגות לקהל בתוך האפליקציה, בכפתור \"📝 מילים\" של כל שיר. יש מילים ל-" + done + " מתוך " + keys.length + " שירים."),
        h("div", { class: "set-row" }, h("label", { for: "adm-lyr-song" }, "שיר"), sel), ta,
        h("div", { class: "set-row" }, h("button", { class: "btn-primary", type: "button", onclick: save }, "שמירת המילים"), msg), imp);
    }
    /* facts: the current text is already in the box, the admin just fixes what's needed */
    songKeys() {
      const st = this.st, keys = [];
      SET.forEach((d, i) => sideOrder(st, i).forEach(s => keys.push({ k: videoKey(i, s), s, i })));
      if (SHOW.encores) ["tv", "film"].forEach(sd => keys.push({ k: videoKey("enc", sd), s: sd, i: "enc" }));
      return keys;
    }
    renderFacts() {
      if (!this.$facts || !this.st) return;
      if (this.$facts.contains(document.activeElement) && document.activeElement.tagName === "TEXTAREA") return; // don't wipe what is being typed
      const map = this.factsMap || {}, keys = this.songKeys();
      if (!this.factKey || !keys.find(x => x.k === this.factKey)) this.factKey = keys[0].k;
      const cur = keys.find(x => x.k === this.factKey), r = cur.i, orig = baseSong(r, cur.s), now = songOf(r, cur.s), o = map[cur.k];
      const sel = h("select", { id: "adm-fact-song", class: "field field-sm", onchange: (e) => { this.factKey = e.target.value; this.renderFacts(); } },
        keys.map(x => h("option", { value: x.k, selected: x.k === cur.k }, (map[x.k] ? "✎ " : "· ") + (x.i === "enc" ? "הדרן" : pad(x.i + 1)) + " " + SIDE[x.s].short + " · \u2068" + baseSong(x.i, x.s).title + "\u2069")));
      const hasScene = !!(orig.scene || (o && o.scene)) || SHOW.id === "tv-vs-film";
      const sceneTa = hasScene ? h("textarea", { id: "adm-fact-scene", class: "field lyr-text", rows: "3", dir: "rtl" }) : null;
      if (sceneTa) sceneTa.value = now.scene || "";
      const factTa = h("textarea", { id: "adm-fact-text", class: "field lyr-text", rows: "5", dir: "rtl" });
      factTa.value = now.fact || "";
      const fm = this.factMsg && this.factMsg.k === cur.k && Date.now() - this.factMsg.at < 8000 ? this.factMsg.t : "";
      const msg = h("span", { class: "lyr-msg", role: "status" }, fm);
      const say = (t) => { this.factMsg = { t, k: cur.k, at: Date.now() }; };
      const clean = (v) => (v || "").replace(/\r/g, "").trim().slice(0, 1500);
      const save = async () => {
        const fact = clean(factTa.value), scene = sceneTa ? clean(sceneTa.value) : "";
        // store only what differs from the original, so a later fix in the setlist file still shows through
        const v = { fact: fact && fact !== (orig.fact || "") ? fact : "", scene: scene && scene !== (orig.scene || "") ? scene : "" };
        try { say(v.fact || v.scene ? "נשמר ✓ הקהל רואה את הנוסח החדש." : "אין שינוי מהנוסח המקורי."); factTa.blur(); if (sceneTa) sceneTa.blur(); await this.be.setFact(cur.k, v); this.renderFacts(); }
        catch (e) { msg.textContent = "השמירה נכשלה: " + (e.message || e); }
      };
      const restore = async () => {
        try { say("חזרנו לנוסח המקורי."); await this.be.setFact(cur.k, {}); this.renderFacts(); }
        catch (e) { msg.textContent = "הפעולה נכשלה: " + (e.message || e); }
      };
      const edited = keys.filter(x => map[x.k]).length;
      this.$facts.replaceChildren(
        h("p", { class: "muted" }, "הטקסט שהקהל רואה בכפתור \"💡 " + (SHOW.id === "tv-vs-film" ? "על השיר והסצנה" : "על השיר") + "\". הנוסח הנוכחי כבר בתיבה, מתקנים ושומרים." + (edited ? (edited === 1 ? " נערך שיר אחד (מסומן ב-✎)." : " נערכו " + edited + " שירים (מסומנים ב-✎).") : "")),
        h("div", { class: "set-row" }, h("label", { for: "adm-fact-song" }, "שיר"), sel),
        sceneTa ? h("label", { class: "fact-lbl", for: "adm-fact-scene" }, SIDE[cur.s].sceneLabel || "הסצנה") : null, sceneTa,
        h("label", { class: "fact-lbl", for: "adm-fact-text" }, "💡 העובדה"), factTa,
        h("div", { class: "set-row" }, h("button", { class: "btn-primary", type: "button", onclick: save }, "שמירת העובדה"),
          o ? h("button", { class: "btn-ghost", type: "button", onclick: restore }, "חזרה לנוסח המקורי") : null, msg));
    }
    renderCrowd() {
      if (!this.crowd || !this.$crowd) return;
      const c = this.crowd;
      this.$crowd.replaceChildren(
        h("p", { class: "muted" }, "קהל מדומה שנכנס, מנחש, מצביע ושולח תגובות. נועד לחזרות ולהדגמה בלבד."),
        h("div", { class: "set-row" },
          h("button", { class: c.running ? "btn-ghost" : "btn-primary", type: "button", onclick: () => { c.running ? c.stop() : c.start(); this.renderCrowd(); } }, c.running ? "עצירת הקהל" : "הפעלת קהל וירטואלי"),
          h("span", null, c.count() + " צופים וירטואליים")));
    }
    tickClock() {
      const st = this.st; if (!st || st.phase !== "voting") return;
      const left = st.votingEndsAt - Date.now(), total = (st.voteSeconds || 30) * 1000;
      if (this.$clock) this.$clock.set(Math.ceil(Math.max(0, left) / 1000), Math.max(0, left) / total);
      if (left < -600 && this.autoClose !== false && !this._closing) this.closeVoting();
    }
  }

  /* =========================================================================
     VIRTUAL CROWD — rehearsal bots (demo mode only)
     ========================================================================= */
  const NAMES = ["נועה", "איתי", "מאיה", "יואב", "שירה", "עומרי", "תמר", "רועי", "ליאור", "דנה", "אורי", "הילה", "גיל", "מיכל", "אסף", "רוני", "עדי", "נדב", "יעל", "אלון", "שני", "בן", "קרן", "עידו", "ליה", "תום", "אביגיל", "דור", "ענבל", "אמיר", "", "", "", ""];
  class VirtualCrowd {
    constructor(be) { this.be = be; this.bots = []; this.running = false; this.timers = []; this.lastPhaseKey = ""; }
    count() { return this.bots.length; }
    reset() { this.stop(); this.bots = []; }
    start(n) {
      this.running = true; n = n || 180;
      const add = () => {
        if (!this.running || this.bots.length >= n) return;
        const b = { uid: "bot_" + rid(6), ticket: String(1000 + Math.floor(Math.random() * 9000)), name: NAMES[Math.floor(Math.random() * NAMES.length)], taste: Math.random() * 0.5 - 0.25 };
        this.bots.push(b);
        this.be.join({ ticket: b.ticket, name: b.name, prediction: Math.random() < 0.7 ? (Math.random() < 0.42 + b.taste ? "tv" : "film") : null }, b.uid);
        this.timers.push(setTimeout(add, 30 + Math.random() * 120));
      };
      add();
      this.rxTimer = setInterval(() => this.reactTick(), 900);
      if (this.st) this.onState(this.st, true);
    }
    stop() { this.running = false; this.timers.forEach(clearTimeout); this.timers = []; clearInterval(this.rxTimer); }
    onState(st, force) {
      this.st = st; if (!this.running) return;
      const key = st.phase + st.round;
      if (key === this.lastPhaseKey && !force) return; this.lastPhaseKey = key;
      if ((st.phase === "song1" || st.phase === "song2") && st.voteDuringSongs !== false) {
        const r = st.round, bias = 0.5 + Math.sin((r + 1) * 2.17) * 0.18;
        this.bots.forEach(b => {
          if (b.voted === r + "" || Math.random() < (st.phase === "song1" ? 0.75 : 0.5)) return;
          b.voted = r + "";
          const side = Math.random() < bias + b.taste ? "tv" : "film";
          this.timers.push(setTimeout(() => { const ok = this.st.round === r && ["song1", "song2", "voting"].includes(this.st.phase); if (ok) this.be.vote(r, side, b, b.uid).catch(() => {}); }, 500 + Math.random() * 15000));
        });
      }
      if (st.phase === "voting") {
        const r = st.round, bias = 0.5 + Math.sin((r + 1) * 2.17) * 0.18, span = Math.max(3, (st.votingEndsAt - Date.now()) / 1000 - 2);
        this.bots.forEach(b => {
          if (Math.random() < 0.08) return;
          const side = Math.random() < bias + b.taste ? "tv" : "film";
          const delay = (0.4 + Math.pow(Math.random(), 1.8) * span) * 1000;
          this.timers.push(setTimeout(() => { if (this.st.phase === "voting" && this.st.round === r) this.be.vote(r, side, b, b.uid).catch(() => {}); }, delay));
          if (Math.random() < 0.1) this.timers.push(setTimeout(() => { if (this.st.phase === "voting" && this.st.round === r) this.be.vote(r, other(side), b, b.uid).catch(() => {}); }, delay + 2500));
        });
      }
    }
    reactTick() {
      const st = this.st; if (!st || !this.running || !["lobby", "intro", "song1", "song2", "encore"].includes(st.phase) || !this.bots.length) return;
      const k = Math.floor(Math.random() * 4);
      for (let i = 0; i < k; i++) {
        const b = this.bots[Math.floor(Math.random() * this.bots.length)];
        const opts = ["fire", "love", "wow", "clap", "pop"], c = {}; c[opts[Math.floor(Math.random() * opts.length)]] = 1 + Math.floor(Math.random() * 3);
        this.be.react(c, b.uid);
      }
    }
  }

  /* =========================================================================
     DEMO — all three screens side by side on one page
     ========================================================================= */
  function DemoView(root, be) {
    root.classList.add("demo"); root.setAttribute("dir", "rtl");
    const crowd = new VirtualCrowd(be);
    const phone = h("div", { class: "phone" }), screenBox = h("div", { class: "demo-screen" }), adminBox = h("div", { class: "demo-admin" });
    root.append(
      h("header", { class: "demo-head" },
        h("div", null, h("p", { class: "demo-eyebrow" }, "Soundclash · " + SHOW.title), h("h1", { class: "demo-title" }, "חדר הבקרה של המופע"),
          h("p", { class: "demo-lead" }, "שלושת המסכים רצים כאן יחד במצב הדגמה. לוחצים על הכפתור הגדול באדמין, והטלפון והמסך זזים איתו. הפעילו קהל וירטואלי כדי לראות הצבעות אמיתיות זורמות.")),
        h("p", { class: "demo-tip" }, "טיפ: באדמין, מתחת למסך, יש כפתור ", h("b", null, "הפעלת קהל וירטואלי"), ".")),
      h("div", { class: "demo-grid" },
        h("figure", { class: "demo-fig demo-fig-screen" }, h("figcaption", null, "מסך הבמה · המקרן"), screenBox),
        h("figure", { class: "demo-fig demo-fig-phone" }, h("figcaption", null, "הטלפון של הקהל"), phone),
        h("figure", { class: "demo-fig demo-fig-admin" }, h("figcaption", null, "אדמין · שולחן הבמאי"), adminBox)));
    new ScreenView(screenBox, be, {});
    new AudienceView(phone, be, { demo: true });
    new AdminView(adminBox, be, { crowd });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    const root = document.getElementById("app");
    const qs = new URLSearchParams(location.search);
    const VIEWS = ["audience", "screen", "admin", "demo"], hv = location.hash.replace("#", "");
    const view = (VIEWS.includes(hv) ? hv : null) || window.SC_VIEW || qs.get("view") || "audience";
    document.documentElement.dataset.view = view;
    /* the demo page (all three screens together) always runs locally, never against the live show */
    const be = window.SCBackend.create(CFG, view === "demo" || new URLSearchParams(location.search).has("demo"));
    try { await be.init(); }
    catch (e) {
      root.replaceChildren(h("div", { class: "fatal" }, h("h1", null, "אין חיבור לשרת ההצבעות"), h("p", null, "בדקו את החיבור לאינטרנט ורעננו את הדף."), h("p", { class: "muted" }, String(e.message || e))));
      return;
    }
    let active = null;
    try { active = await be.getActiveShow(); } catch (e) { active = null; }
    useShow(active || CFG.DEFAULT_SHOW);
    be.bindShow(SHOW.id);
    /* when the admin switches show, every phone and screen reloads into it */
    be.onActiveShow(id => { if (id && id !== SHOW.id && (window.SC_SHOWS || {})[id]) location.reload(); });
    be.on("error", (e) => console.warn("backend", e));
    if (be.onFactsList) be.onFactsList(m => { FACTS = m || {}; });
    root.replaceChildren();
    if (view === "screen") new ScreenView(root, be, {});
    else if (view === "admin") { const crowd = be.isLive() ? null : new VirtualCrowd(be); new AdminView(root, be, { crowd }); }
    else if (view === "demo") DemoView(root, be);
    else new AudienceView(root, be, {});
  }
  window.SC = { boot, AudienceView, ScreenView, AdminView, VirtualCrowd, _test: { tally, scoreboard, champion, sideOrder, videoKey } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

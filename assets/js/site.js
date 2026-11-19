/* =========================================================================
   SOUNDCLASH — סקריפט משותף
   כלל הזהב: האתר עובד במלואו גם בלי הקובץ הזה. כל מה שכאן הוא תוספת.
   היוצא מן הכלל היחיד: רשימת ההופעות, שנטענת מ-shows.json (יש נפילה
   מסודרת להודעה קריאה אם הקובץ לא נטען).
   ========================================================================= */

/* ---- הגדרות מרכזיות. זה המקום היחיד שצריך לערוך. ---- */
window.SC_CONFIG = {
  /* מזהה Formspree לטופס יצירת הקשר.
     איך משיגים: נרשמים חינם ב-https://formspree.io עם Stageart.pnima@gmail.com,
     יוצרים טופס חדש, ומעתיקים לכאן את המזהה מתוך הכתובת שהם נותנים
     (למשל https://formspree.io/f/xayzbqwe  →  המזהה הוא xayzbqwe).
     כל עוד השדה ריק, הטופס נופל אוטומטית לשליחה דרך וואטסאפ. */
  formspreeId: "",

  whatsapp: "972546738192",
  phone:    "0546738192"
};

(function () {
  "use strict";

  /* ---------- 1. חשיפה בגלילה ---------- */
  try {
    document.documentElement.classList.add("js-on");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } catch (err) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 2. תפריט נייד ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links  = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.setAttribute("data-open", String(!open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        links.setAttribute("data-open", "false");
      }
    });
  }

  /* ---------- 3. לייטבוקס לגלריה ---------- */
  var galleryImgs = Array.prototype.slice.call(document.querySelectorAll(".gallery img"));
  var lb = document.querySelector(".lightbox");
  if (lb && galleryImgs.length) {
    var lbImg = lb.querySelector("img");
    var idx = 0;
    function show(i) {
      idx = (i + galleryImgs.length) % galleryImgs.length;
      lbImg.src = galleryImgs[idx].getAttribute("data-full") || galleryImgs[idx].currentSrc || galleryImgs[idx].src;
      lbImg.alt = galleryImgs[idx].alt;
      lb.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
    }
    function hide() { lb.setAttribute("data-open", "false"); document.body.style.overflow = ""; }
    galleryImgs.forEach(function (img, i) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () { show(i); });
    });
    lb.querySelector(".close").addEventListener("click", hide);
    lb.querySelector(".prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) {
      if (lb.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(idx + 1);   /* RTL: שמאל = הבא */
      if (e.key === "ArrowRight") show(idx - 1);
    });
  }

  /* ---------- 4. הופעות מתוך shows.json ----------
     אותה תבנית בדיוק כמו show_rows() ב-build.py (לוח בסגנון nbshira.com). */
  var MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  var DAYS = ["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","שבת"];
  var PHOTOS_A = ["09307","09347","09303","09350"];   /* כמו ב-build.py */
  var PHOTOS_B = ["09274","09260","09283","09250"];
  var MARK_MIC = '<path d="M50 12a14 14 0 0114 14v22a14 14 0 01-28 0V26a14 14 0 0114-14zM28 46a22 22 0 0044 0M50 68v16M38 86h24"/>';
  var MARK_VOTE = '<rect x="30" y="8" width="40" height="84" rx="8"/><path d="M40 70V58M50 70V40M60 70V50"/>';
  var WA_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2z"/></svg>';

  function parseShows(list) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var seen = {};
    list.forEach(function (s) {            /* שם קובץ היומן: כמו ב-build.py */
      var n = (seen[s.date] || 0) + 1; seen[s.date] = n;
      s._cal = "cal/" + s.date + (n === 1 ? "" : "-" + n) + ".ics";
    });
    return list
      .map(function (s) { var d = new Date(s.date + "T00:00:00"); return isNaN(d) ? null : Object.assign({}, s, { _d: d }); })
      .filter(function (s) { return s && s._d >= today; })
      .sort(function (a, b) { return (a._d - b._d) || String(a.time || "").localeCompare(String(b.time || "")); });
  }
  function fmtShort(s) { return String(s.format || "Soundclash").replace("Soundclash", "").trim() || "Soundclash"; }
  function waReserve(s) {
    var t = "היי, אשמח לשריין מקום להופעה של Soundclash ב" + s.venue + (s.city ? ", " + s.city : "") +
            " ב-" + s._d.getDate() + "." + (s._d.getMonth() + 1) + ".";
    return "https://wa.me/" + window.SC_CONFIG.whatsapp + "?text=" + encodeURIComponent(t);
  }
  function wazeLink(s) {
    return "https://waze.com/ul?q=" + encodeURIComponent((s.address || (s.venue + " " + (s.city || ""))).trim()) + "&navigate=yes";
  }
  function flagFor(s) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var days = Math.round((s._d - today) / 864e5);
    if (days === 0) return "הערב";
    if (days === 1) return "מחר";
    if (days <= 14) return "בעוד " + days + " ימים";
    return "";
  }
  function showRow(s, i) {
    var side = i % 2 === 0 ? "a" : "b";
    var flag = flagFor(s);
    var info = [s.note, s.address].filter(Boolean).map(esc).join(" · ");
    var main = s.tickets
      ? '<a class="btn btn-solid" href="' + esc(s.tickets) + '" target="_blank" rel="noopener">כרטיסים</a>'
      : '<a class="btn btn-wa" href="' + esc(waReserve(s)) + '" target="_blank" rel="noopener">' + WA_ICON + ' שריון מקום בוואטסאפ</a>';
    return '<article class="sx-row">' +
      '<div class="sx-date side-' + side + '">' +
        '<svg class="sx-mark" aria-hidden="true" viewBox="0 0 100 100">' + (side === "a" ? MARK_MIC : MARK_VOTE) + '</svg>' +
        '<div><div class="d1">' + DAYS[s._d.getDay()] + (s.time ? ' · <bdi dir="ltr">' + esc(s.time) + '</bdi>' : "") + '</div>' +
          '<div class="d2"><bdi dir="ltr">' + s._d.getDate() + "." + (s._d.getMonth() + 1) + "." + s._d.getFullYear() + '</bdi>' +
          (flag ? '<span class="flag">' + flag + '</span>' : "") + '</div></div>' +
        '<div><div class="k">' + esc(fmtShort(s)) + '</div><div class="pl">' + esc(s.city || "") + '</div></div>' +
      '</div>' +
      '<div class="sx-photo"><img src="assets/img/tmuna/' + (side === "a" ? PHOTOS_A : PHOTOS_B)[Math.floor(i / 2) % 4] + '-800.webp" alt="" loading="lazy" width="800" height="533"></div>' +
      '<div class="sx-title"><b>' + esc(s.venue) + '</b>' + (info ? '<span>' + info + '</span>' : "") +
        '<div class="sx-acts">' + main +
          '<a class="btn btn-ghost" href="' + s._cal + '">ליומן</a>' +
          '<a class="btn btn-ghost" href="' + esc(wazeLink(s)) + '" target="_blank" rel="noopener">Waze</a>' +
        '</div></div>' +
    '</article>';
  }

  function loadShows() {
    var lists    = Array.prototype.slice.call(document.querySelectorAll("[data-shows-list]"));
    var ribbonEl = document.querySelector("[data-next-show]");
    if (!lists.length && !ribbonEl) return;

    fetch("shows.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var shows = parseShows(data.shows || []);

        /* רצועת ההופעה הקרובה */
        if (ribbonEl) {
          if (shows.length) {
            var n = shows[0];
            ribbonEl.innerHTML =
              '<div class="wrap">' +
                '<span class="dot"></span>' +
                '<span>ההופעה הקרובה: <b>' + esc(n.venue) + '</b>' + (n.city ? ", " + esc(n.city) : "") +
                ' · <b>' + n._d.getDate() + " ב" + MONTHS[n._d.getMonth()] + '</b>' +
                (n.time ? ", " + esc(n.time) : "") + (n.format ? " · " + esc(n.format) : "") + '</span>' +
                (n.tickets ? '<a href="' + esc(n.tickets) + '" target="_blank" rel="noopener">לרכישת כרטיסים ←</a>'
                           : '<a href="' + esc(waReserve(n)) + '" target="_blank" rel="noopener">לשריון מקום ←</a>') +
              '</div>';
            ribbonEl.hidden = false;
          } else {
            ribbonEl.hidden = true;
          }
        }

        /* לוח ההופעות (בעמוד ההופעות, ושלוש הקרובות בדף הבית) */
        lists.forEach(function (listEl) {
          var limit = parseInt(listEl.getAttribute("data-limit"), 10) || 0;
          var section = listEl.closest("[data-shows-section]");
          if (!shows.length) {
            if (section) { section.hidden = true; return; }
            listEl.innerHTML = '<div class="empty-state">אין כרגע תאריכים פתוחים לקהל הרחב.<br>' +
              'להזמנת המופע לאירוע: <a href="contact.html" style="color:var(--accent);text-decoration:underline">דף יצירת הקשר</a>.</div>';
            return;
          }
          listEl.innerHTML = (limit ? shows.slice(0, limit) : shows).map(showRow).join("");
        });
      })
      .catch(function () {
        lists.forEach(function (listEl) {
          if (listEl.querySelector(".sx-row")) return;   /* הגרסה הסטטית נשארת */
          listEl.innerHTML = '<div class="empty-state">לא הצלחנו לטעון את רשימת ההופעות כרגע.<br>' +
            'אפשר לברר תאריכים בטלפון <a href="tel:' + window.SC_CONFIG.phone + '" style="color:var(--accent)">' +
            window.SC_CONFIG.phone + '</a>.</div>';
        });
        if (ribbonEl) ribbonEl.hidden = true;
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  loadShows();

  /* ---------- 4ב. "במות שבהן הופענו" בדף אירועי חברה ----------
     הרשימה הקבועה כתובה ב-build.py. כאן מתווספת אליה כל הופעה מ-shows.json
     שהתאריך שלה כבר עבר, אם המקום עוד לא ברשימה. אין צורך לעדכן ידנית. */
  function loadPastVenues() {
    var ul = document.querySelector("[data-past-venues]");
    if (!ul) return;
    var norm = function (t) { return String(t || "").replace(/["'׳״]/g, "").replace(/\s+/g, " ").trim(); };
    var seen = {};
    ul.querySelectorAll("li b").forEach(function (b) { seen[norm(b.textContent)] = true; });
    fetch("shows.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var today = new Date(); today.setHours(0, 0, 0, 0);
        (data.shows || [])
          .map(function (s) { var d = new Date(s.date + "T00:00:00"); return isNaN(d) ? null : Object.assign({}, s, { _d: d }); })
          .filter(function (s) { return s && s.venue && s._d < today; })
          .sort(function (a, b) { return a._d - b._d; })
          .forEach(function (s) {
            var key = norm(s.venue);
            if (seen[key]) return;
            seen[key] = true;
            var li = document.createElement("li");
            li.innerHTML = "<b>" + esc(s.venue) + "</b><span>" + esc(s.city || "") + "</span>";
            ul.appendChild(li);
          });
      })
      .catch(function () { /* הרשימה הקבועה נשארת כמו שהיא */ });
  }
  loadPastVenues();

  /* ---------- 5. טופס יצירת קשר ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var msg = form.querySelector(".form-msg");
    var waBtn = document.querySelector("[data-wa-from-form]");

    /* בונה הודעת וואטסאפ מתוך מה שכבר מולא בטופס */
    function buildWaText() {
      var d = new FormData(form);
      var lines = ["היי, אשמח לפרטים על מופע Soundclash."];
      if (d.get("name"))    lines.push("שם: " + d.get("name"));
      if (d.get("org"))     lines.push("גוף/מקום: " + d.get("org"));
      if (d.get("type"))    lines.push("סוג האירוע: " + d.get("type"));
      if (d.get("format"))  lines.push("הפורמט שמעניין: " + d.get("format"));
      if (d.get("date"))    lines.push("תאריך משוער: " + d.get("date"));
      if (d.get("message")) lines.push("הערות: " + d.get("message"));
      return lines.join("\n");
    }
    if (waBtn) {
      function syncWa() {
        waBtn.href = "https://wa.me/" + window.SC_CONFIG.whatsapp + "?text=" + encodeURIComponent(buildWaText());
      }
      syncWa();
      form.addEventListener("input", syncWa);
      form.addEventListener("change", syncWa);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = (window.SC_CONFIG.formspreeId || "").trim();

      /* אין מזהה Formspree — נופלים לוואטסאפ, שתמיד עובד */
      if (!id) {
        window.open("https://wa.me/" + window.SC_CONFIG.whatsapp + "?text=" + encodeURIComponent(buildWaText()), "_blank", "noopener");
        msg.setAttribute("data-state", "ok");
        msg.textContent = "נפתח לך וואטסאפ עם כל הפרטים — רק ללחוץ שליחה.";
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true; btn.textContent = "שולח…";

      fetch("https://formspree.io/f/" + id, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          msg.setAttribute("data-state", "ok");
          msg.textContent = "הפנייה נשלחה. נחזור אליך בהקדם — ואם זה דחוף, אפשר גם בטלפון " + window.SC_CONFIG.phone + ".";
        })
        .catch(function () {
          msg.setAttribute("data-state", "err");
          msg.innerHTML = 'השליחה נכשלה. אפשר לשלוח את אותם פרטים ישירות ב<a href="https://wa.me/' +
            window.SC_CONFIG.whatsapp + "?text=" + encodeURIComponent(buildWaText()) +
            '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">וואטסאפ</a>.';
        })
        .finally(function () { btn.disabled = false; btn.textContent = original; });
    });
  }
})();

/* הדגמת האפליקציה: מתנגנת בלי קול, וכפתור מפעיל סאונד */
document.querySelectorAll(".demo-video").forEach(function (fig) {
  var v = fig.querySelector("video"), b = fig.querySelector(".demo-sound");
  if (!v || !b) return;
  b.addEventListener("click", function () {
    var on = v.muted;
    v.muted = !on;
    if (on) { try { v.currentTime = 0; } catch (e) {} var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.setAttribute("aria-label", on ? "השתקה" : "הפעלת סאונד");
  });
});

/* הדגמה במסך מלא: עם סאונד, מההתחלה */
document.querySelectorAll(".demo-video").forEach(function (fig) {
  var v = fig.querySelector("video"), b = fig.querySelector(".demo-full"), snd = fig.querySelector(".demo-sound");
  if (!v || !b) return;
  b.addEventListener("click", function () {
    v.muted = false;
    if (snd) { snd.setAttribute("aria-pressed", "true"); snd.setAttribute("aria-label", "השתקה"); }
    try { v.currentTime = 0; } catch (e) {}
    var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    if (v.requestFullscreen) v.requestFullscreen().catch(function () {});
    else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();   /* אייפון */
    v.controls = true;
  });
  function onExit() { if (!document.fullscreenElement && !document.webkitFullscreenElement) v.controls = false; }
  document.addEventListener("fullscreenchange", onExit);
  document.addEventListener("webkitfullscreenchange", onExit);
  v.addEventListener("webkitendfullscreen", function () { v.controls = false; });
});

/* סרטונים שמתנגנים רק כשהם על המסך */
(function () {
  var vids = document.querySelectorAll("video[data-autoplay-visible]");
  if (!vids.length) return;
  if (!("IntersectionObserver" in window)) { vids.forEach(function (v) { v.preload = "auto"; v.play().catch(function () {}); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    });
  }, { threshold: 0.35 });
  vids.forEach(function (v) { io.observe(v); });
})();

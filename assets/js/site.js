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
      lbImg.src = galleryImgs[idx].src;
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

  /* ---------- 4. הופעות מתוך shows.json ---------- */
  var MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

  function parseShows(list) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return list
      .map(function (s) { var d = new Date(s.date + "T00:00:00"); return isNaN(d) ? null : Object.assign({}, s, { _d: d }); })
      .filter(function (s) { return s && s._d >= today; })
      .sort(function (a, b) { return a._d - b._d; });
  }

  function loadShows() {
    var listEl   = document.querySelector("[data-shows-list]");
    var ribbonEl = document.querySelector("[data-next-show]");
    if (!listEl && !ribbonEl) return;

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
                (n.time ? ", " + esc(n.time) : "") + '</span>' +
                (n.tickets ? '<a href="' + esc(n.tickets) + '" target="_blank" rel="noopener">לרכישת כרטיסים ←</a>' : "") +
              '</div>';
            ribbonEl.hidden = false;
          } else {
            ribbonEl.hidden = true;
          }
        }

        /* רשימת ההופעות המלאה */
        if (listEl) {
          if (!shows.length) {
            listEl.innerHTML = '<div class="empty-state">אין כרגע תאריכים פתוחים לקהל הרחב.<br>' +
              'להזמנת המופע לאירוע — <a href="contact.html" style="color:var(--accent);text-decoration:underline">דף יצירת הקשר</a>.</div>';
            return;
          }
          listEl.innerHTML = shows.map(function (s) {
            return '<article class="show-item">' +
              '<div class="show-date"><div class="d latin">' + s._d.getDate() + '</div>' +
                '<div class="m">' + MONTHS[s._d.getMonth()] + " " + s._d.getFullYear() + '</div></div>' +
              '<div class="show-main"><h3>' + esc(s.venue) + (s.city ? " · " + esc(s.city) : "") + '</h3>' +
                '<p>' + esc(s.format || "Soundclash") + (s.time ? " · " + esc(s.time) : "") +
                (s.note ? " · " + esc(s.note) : "") + '</p></div>' +
              (s.tickets
                ? '<a class="btn btn-solid" href="' + esc(s.tickets) + '" target="_blank" rel="noopener">כרטיסים</a>'
                : '<span class="chip">פרטים בטלפון</span>') +
            '</article>';
          }).join("");
        }
      })
      .catch(function () {
        if (listEl) {
          listEl.innerHTML = '<div class="empty-state">לא הצלחנו לטעון את רשימת ההופעות כרגע.<br>' +
            'אפשר לברר תאריכים בטלפון <a href="tel:' + window.SC_CONFIG.phone + '" style="color:var(--accent)">' +
            window.SC_CONFIG.phone + '</a>.</div>';
        }
        if (ribbonEl) ribbonEl.hidden = true;
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  loadShows();

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

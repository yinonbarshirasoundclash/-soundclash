# -*- coding: utf-8 -*-
"""
בונה את אתר Soundclash מקובץ אחד.
כל התוכן, הקישורים ופרטי הקשר יושבים כאן. משנים כאן — מריצים `python3 build.py` —
וכל הדפים מתעדכנים יחד. אין תלות בשום ספרייה חיצונית.
"""
import os, html, datetime

OUT = os.path.dirname(os.path.abspath(__file__))

# ============================================================================
#  1. פרטי קשר ורשתות — הבלוק היחיד שצריך לעדכן כשמשהו משתנה
# ============================================================================
SITE_URL   = "https://soundclash.co.il"      # יתעדכן לדומיין שייבחר בפועל
BRAND      = "SOUNDCLASH"
EMAIL      = "Stageart.pnima@gmail.com"
PHONE_MAIN = "054-6738192"
PHONE_TEL  = "0546738192"
WA_NUMBER  = "972546738192"
WA_TEXT    = "היי, אשמח לפרטים על מופע Soundclash לאירוע שלנו."

CONTACTS = [
    ("ינון בר שירה", "054-6738192", "0546738192"),
    ("נעמה בר שירה", "054-6589303", "0546589303"),
]

# ריק = הכפתור פשוט לא מוצג. למלא ברגע שיש כתובות אמיתיות.
SOCIAL = {
    "youtube":   "https://www.youtube.com/@SoundclashRockBattle",
    "facebook":  "https://www.facebook.com/profile.php?id=61589041324979",
    "instagram": "https://www.instagram.com/soundclash_rock_battle/",
}

# ============================================================================
#  2. תמונות — מתארחות כרגע ב-CDN של וויקס.
#     ראו "לניתוק מלא מוויקס" במדריך ההעלאה.
# ============================================================================
W = "https://static.wixstatic.com/media/"
IMAGES = [
    (W + "6340ee_d115b17d2a7547de89268dbb48c48452~mv2.jpg", "הלהקה על הבמה במהלך המופע", False),
    (W + "6340ee_bb6e95f2c5ea4c468617c7f99f1cc2c1~mv2.jpg", "הלהקה מניפה אגרוף לעבר הקהל", False),
    (W + "6340ee_f10df7753d7f4714a93b0b92467d3533~mv2.jpg", "הסולן שר עם יד על הלב", False),
    (W + "6340ee_234c648614d14907b08c0aa503435bae~mv2.jpg", "הבסיסט מנגן על הבמה", False),
    (W + "6340ee_6b83c4a9c13043b5a809fe554f973962~mv2.jpg", "גיטריסט אקוסטי במהלך ההופעה", False),
    (W + "6340ee_97af6be2ba504392b8665f861ad18877~mv2.jpg", "גיטריסט מחייך אל הקהל", False),
    (W + "6340ee_27674a9d0cd14a9c98fbbca10437b6f4~mv2.jpg", "הסולן בהופעה חיה", True),
    (W + "6340ee_c6693df8aee1431f9ecff5688b69be67~mv2.jpg", "פורטרט הסולנית", True),
    (W + "6340ee_6f1e7a0dc85545bfa46d9a7959113d4b~mv2.jpg", "הסולן והגיטריסטית יחד על הבמה", True),
]
HERO_IMG = IMAGES[0][0]

VIDEOS = [
    ("6XJsn9DJnxg", "הקהל בטירוף"),
    ("vkYElSJr6PI", "אז מה זה Soundclash?"),
    ("tjGkZa0l0NU", "ככה מצביעים באפליקציה"),
    ("AxSH8I3mNvE", "אז איך זה הולך עם ההצבעות?"),
]
TRAILER = "6XJsn9DJnxg"

# ============================================================================
#  3. הפורמטים (״הזירות״)
# ============================================================================
def ltr(t):
    """עוטף מילה לטינית כדי שתישאר בכיוון שלה בתוך משפט עברי."""
    return '<span class="ltr">%s</span>' % t

FORMATS = [
    dict(slug="90s", file="90s.html", theme="theme-90", css="f-90",
         era="90's", name="Soundclash ניינטיז",
         nav='ניינטיז ' + ltr("90's"), nav_plain="ניינטיז 90's",
         name_html=ltr("Soundclash") + " ניינטיז",
         tag="בהופעות עכשיו", live=True,
         short="הזירה שרצה היום. ארה״ב מול בריטניה, על עשור שלם של רוק."),
    dict(slug="80s", file="80s.html", theme="theme-80", css="f-80",
         era="80's", name="Soundclash אייטיז",
         nav='אייטיז ' + ltr("80's"), nav_plain="אייטיז 80's",
         name_html=ltr("Soundclash") + " אייטיז",
         tag="להזמנה", live=False,
         short="ניאון מול סטדיון. הסינת׳ הבריטי מול הרוק הגדול של אמריקה."),
    dict(slug="y2k", file="y2k.html", theme="theme-y2k", css="f-y2k",
         era="Y2K", name="Soundclash Y2K",
         nav=ltr("Soundclash Y2K"), nav_plain="Y2K",
         name_html=ltr("Soundclash Y2K"),
         tag="להזמנה", live=False,
         short="שנות האלפיים. הגל הבריטי החדש מול הרוק והפופ האמריקאי."),
    dict(slug="screen", file="tv-vs-film.html", theme="theme-screen", css="f-screen",
         era="TV/FILM", name="Soundclash סדרות נגד סרטים",
         nav="סדרות נגד סרטים", nav_plain="סדרות נגד סרטים",
         name_html=ltr("Soundclash") + " סדרות נגד סרטים",
         tag="להזמנה", live=False,
         short="ציר אחר לגמרי: פזמוני הסדרות שכולם יודעים בעל פה, מול פסקולי הקולנוע."),
]

# ============================================================================
#  4. רכיבים משותפים
# ============================================================================
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Crect width='64' height='64' rx='12' fill='%230b0a09'/%3E"
           "%3Cpath d='M30 6 L34 6 L26 30 L38 30 L28 58 L31 34 L20 34 Z' fill='%23e0493d'/%3E%3C/svg%3E")

ICON = {
 "phone": '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z"/></svg>',
 "wa": '<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1s-.5-.1-.7.2-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 01-2.4-1.5 9 9 0 01-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3.2 3.2 0 00-1 2.4 5.6 5.6 0 001.2 3 12.7 12.7 0 004.9 4.3c.7.3 1.2.5 1.6.6a3.9 3.9 0 001.8.1 2.9 2.9 0 001.9-1.4 2.4 2.4 0 00.2-1.3zM12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2z"/></svg>',
 "youtube": '<svg viewBox="0 0 24 24"><path d="M23 12s0-3.4-.4-5a2.9 2.9 0 00-2-2C18.7 4.5 12 4.5 12 4.5s-6.7 0-8.6.5a2.9 2.9 0 00-2 2C1 8.6 1 12 1 12s0 3.4.4 5a2.9 2.9 0 002 2c1.9.5 8.6.5 8.6.5s6.7 0 8.6-.5a2.9 2.9 0 002-2c.4-1.6.4-5 .4-5zM9.8 15.4V8.6l5.8 3.4z"/></svg>',
 "facebook": '<svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z"/></svg>',
 "instagram": '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.3 2.2.4.6.2 1 .5 1.4.9s.7.8.9 1.4c.1.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4s-.8.7-1.4.9c-.4.1-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9s-.7-.8-.9-1.4c-.1-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4s.8-.7 1.4-.9c.4-.1 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1zM12 7.8a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4zm0 6.9a2.7 2.7 0 110-5.4 2.7 2.7 0 010 5.4zm5.4-7a1 1 0 11-2 0 1 1 0 012 0z"/></svg>',
 "mail": '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V6l8 5 8-5z"/></svg>',
}

def wa_link(text=None):
    from urllib.parse import quote
    return "https://wa.me/%s?text=%s" % (WA_NUMBER, quote(text or WA_TEXT))

def nav(active, depth_prefix=""):
    p = depth_prefix
    def item(href, label, key):
        cls = ' class="active"' if key == active else ""
        return '<a href="%s%s"%s>%s</a>' % (p, href, cls, label)
    drop_active = ' class="is-active"' if active.startswith("fmt-") else ""
    formats_menu = "".join(
        '<a href="%s%s"%s>%s</a>' % (p, f["file"], ' class="active"' if active == "fmt-" + f["slug"] else "", f["nav"])
        for f in FORMATS)
    return f"""<header class="nav">
  <nav class="nav-inner" aria-label="ניווט ראשי">
    <a class="nav-logo latin" href="{p}index.html">SOUND<b>CLASH</b></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="פתיחת תפריט">
      <span></span><span></span><span></span>
    </button>
    <div class="nav-links" id="nav-links" data-open="false">
      {item("index.html", "דף הבית", "home")}
      <details class="nav-drop">
        <summary{drop_active}>הפורמטים</summary>
        <div class="drop-menu">{formats_menu}</div>
      </details>
      {item("shows.html", "הופעות", "shows")}
      {item("gallery.html", "גלריה", "gallery")}
      {item("about.html", "אודות", "about")}
      {item("contact.html", "יצירת קשר", "contact")}
      <a class="nav-phone-mobile" href="tel:{PHONE_TEL}">חייגו {PHONE_MAIN}</a>
    </div>
    <a class="nav-phone" href="tel:{PHONE_TEL}">{ICON["phone"]} {PHONE_MAIN}</a>
  </nav>
</header>"""

def socials_html():
    out = []
    for key in ("youtube", "facebook", "instagram"):
        url = SOCIAL.get(key, "").strip()
        if url:
            label = {"youtube": "יוטיוב", "facebook": "פייסבוק", "instagram": "אינסטגרם"}[key]
            out.append('<a href="%s" target="_blank" rel="noopener" aria-label="%s">%s</a>' % (url, label, ICON[key]))
    return '<div class="socials">%s</div>' % "".join(out) if out else ""

def contact_band(title, sub, extra_btn=""):
    people = "".join(
        '<div class="person"><b>%s</b><a href="tel:%s">%s</a></div>' % (n, t, p)
        for n, p, t in CONTACTS)
    people += '<div class="person"><b>אימייל</b><a href="mailto:%s">%s</a></div>' % (EMAIL, EMAIL)
    return f"""<section>
  <div class="wrap">
    <div class="contact-band reveal">
      <div class="eyebrow" style="justify-content:center">להזמנת המופע</div>
      <h2>{title}</h2>
      <p class="sub">{sub}</p>
      <div class="people">{people}</div>
      <div class="cta-row center">
        <a class="btn btn-solid" href="tel:{PHONE_TEL}">{ICON["phone"]} להזמנה בטלפון</a>
        <a class="btn btn-wa" href="{wa_link()}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
        {extra_btn}
      </div>
    </div>
  </div>
</section>"""

def footer(p=""):
    fmt_links = "".join('<li><a href="%s%s">%s</a></li>' % (p, f["file"], f["nav"]) for f in FORMATS)
    return f"""<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div class="brand latin">SOUND<b>CLASH</b></div>
        <p class="tagline">מופע קרב מוזיקלי חי, שבו ההכרעה בין שני צדדים נמסרת לקהל — בהצבעה חיה מהטלפון.</p>
        {socials_html()}
      </div>
      <div>
        <h4>הזירות</h4>
        <ul>{fmt_links}</ul>
      </div>
      <div>
        <h4>יצירת קשר</h4>
        <ul>
          <li><a href="tel:{PHONE_TEL}">{PHONE_MAIN} · ינון</a></li>
          <li><a href="tel:0546589303">054-6589303 · נעמה</a></li>
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><a href="{wa_link()}" target="_blank" rel="noopener">וואטסאפ</a></li>
          <li><a href="{p}contact.html">טופס הזמנה</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">© {datetime.date.today().year} להקת <span class="latin">SOUNDCLASH</span> · מעשיתיאטרון · כל הזכויות שמורות</div>
  </div>
</footer>
<a class="wa-float" href="{wa_link()}" target="_blank" rel="noopener" aria-label="שליחת הודעה בוואטסאפ">{ICON["wa"]}</a>"""

def page(filename, title, description, body, active, theme="theme-90", og_img=HERO_IMG, jsonld=""):
    doc = f"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{SITE_URL}/{filename}">
<link rel="icon" href="{FAVICON}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Soundclash">
<meta property="og:locale" content="he_IL">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="{og_img}">
<meta property="og:url" content="{SITE_URL}/{filename}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Suez+One&family=Heebo:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
{jsonld}
</head>
<body class="{theme}">
{nav(active)}
{body}
{footer()}
<script src="assets/js/site.js" defer></script>
</body>
</html>
"""
    with open(os.path.join(OUT, filename), "w", encoding="utf-8") as fh:
        fh.write(doc)
    return filename


# ============================================================================
#  5. בלוקי תוכן חוזרים
# ============================================================================
def stats_bar(items):
    return '<div class="stats"><div class="wrap">%s</div></div>' % "".join(
        '<div class="stat"><div class="num latin">%s</div><div class="lbl">%s</div></div>' % (n, l)
        for n, l in items)

DEFAULT_STATS = [
    ("6", "נגנים על הבמה"),
    ("2", "סולן וסולנית"),
    ("4", "זירות קרב"),
    ("90", "דקות מופע"),
    ("APP", "אפליקציית הצבעה משלנו"),
]

def mechanism_block(head="ככה זה עובד, שלב אחר שלב",
                    sub="ההצבעה אינה גימיק שמתלווה למופע — היא המבנה שלו. כל סיבוב נסגר בהכרעה של הקהל."):
    return f"""<section id="mechanism">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">המנגנון</div>
      <h2>{head}</h2>
      <p>{sub}</p>
    </div>
    <div class="mechanism">
      <div class="step reveal"><h3>הזירה נפתחת</h3><p>שני הצדדים מוכרזים מהבמה, והקהל סורק קוד ונכנס לאפליקציית ההצבעה מהטלפון. בלי הורדה, בלי הרשמה.</p></div>
      <div class="step reveal"><h3>שיר מול שיר</h3><p>הלהקה מנגנת שיר מהצד האחד ומיד אחריו שיר מהצד השני. ראש בראש, בביצוע חי ונאמן למקור.</p></div>
      <div class="step reveal"><h3>הקהל מכריע</h3><p>בסוף כל סיבוב נפתחת ההצבעה, והתוצאה עולה על המסך בזמן אמת. האולם רואה מי מוביל ובכמה.</p></div>
      <div class="step reveal"><h3>הכרזה ופרסים</h3><p>הניקוד המצטבר קובע את המנצחת של הערב, ובין המצביעים מחולקים פרסים. הקהל יוצא עם תוצאה, לא רק עם מופע.</p></div>
    </div>
    <p class="center mt-32" style="color:var(--text-dim)">את מערכת ההצבעות אנחנו מביאים ומפעילים — אפליקציה שפיתחנו בעצמנו, שרצה על הטלפון של הקהל. אין מה להתקין באולם ואין ציוד שצריך להשיג.</p>
  </div>
</section>"""

def spec_block(rows, title="המפרט, בלי לחפש"):
    body = "".join('<div class="spec-row"><dt>%s</dt><dd>%s</dd></div>' % (k, v) for k, v in rows)
    return f"""<section id="spec">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">מפרט</div>
      <h2>{title}</h2>
    </div>
    <dl class="spec reveal">{body}</dl>
  </div>
</section>"""

DEFAULT_SPEC = [
    ("הרכב", "ינון בר שירה – שירה וגיטרה אקוסטית | רעות זורמן – שירה וגיטרה חשמלית | "
             "ולאד פוזיילוב – גיטרה מובילה וקולות | חן רימציקי – קלידים | "
             "עומר מתתיהו – בס | תומר כהן – תופים"),
    ("אורך המופע", "כ-90 דקות. ניתן לקצר או להאריך לפי מבנה הערב"),
    ("מבנה", "סיבובי קרב, שיר מול שיר, עם הצבעת קהל בסוף כל סיבוב"),
    ("מה אנחנו מביאים", "את אפליקציית ההצבעה ואת ההפעלה שלה מול הקהל"),
    ("מה נדרש במקום", "מערכת הגברה ותאורה סטנדרטית לאולם, ומסך או מקרן להצגת התוצאות"),
    ("זמינות פורמט", "זירת הניינטיז זמינה מיידית. יתר הזירות עולות לבמה תוך 4–6 שבועות ממועד ההזמנה"),
    ("קהל", "מועדונים ובמות, אירועי חברה, מחלקות תרבות ומתנ״סים, פסטיבלים ואירועים פרטיים"),
    ("שפה", "המופע מוגש בעברית, הרפרטואר בשפת המקור"),
]

def video_section(vids, head="צפו בקרב מקרוב", eyebrow="בפעולה", sub="", limit=3):
    cards = "".join(f"""<article class="video-card reveal">
        <div class="video-thumb"><iframe src="https://www.youtube.com/embed/{vid}?rel=0" title="{html.escape(t)}"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>
        <div class="video-info"><h3>{html.escape(t)}</h3></div>
      </article>""" for vid, t in vids[:limit])
    yt = SOCIAL.get("youtube", "").strip()
    more = ('<div class="cta-row center mt-32"><a class="btn btn-outline" href="%s" target="_blank" rel="noopener">%s לערוץ היוטיוב המלא</a></div>' % (yt, ICON["youtube"])) if yt else ""
    return f"""<section id="videos">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">{eyebrow}</div>
      <h2>{head}</h2>
      {('<p>%s</p>' % sub) if sub else ''}
    </div>
    <div class="video-grid">{cards}</div>
    {more}
  </div>
</section>"""

def gallery_section(imgs, head="תמונות מהבמה", eyebrow="גלריה", link_more=True):
    figs = "".join(
        '<figure class="reveal%s"><img src="%s" alt="%s" loading="lazy"></figure>' % (" contain" if c else "", u, html.escape(a))
        for u, a, c in imgs)
    more = ('<div class="cta-row center mt-32"><a class="btn btn-outline" href="gallery.html">לגלריה המלאה</a></div>'
            if link_more else "")
    return f"""<section id="gallery">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">{eyebrow}</div><h2>{head}</h2></div>
    <div class="gallery">{figs}</div>
    {more}
  </div>
</section>
<div class="lightbox" role="dialog" aria-modal="true" aria-label="תצוגת תמונה">
  <button class="close" aria-label="סגירה">&times;</button>
  <button class="arrow prev" aria-label="הקודם">&rsaquo;</button>
  <img src="" alt="">
  <button class="arrow next" aria-label="הבא">&lsaquo;</button>
</div>"""

def formats_index():
    cards = ""
    for f in FORMATS:
        status_cls = "status" if f["live"] else "status neutral"
        cards += f"""<a class="format-card {f['css']} reveal" href="{f['file']}">
      <div class="{status_cls}">{f['tag']}</div>
      <div class="era latin">{f['era']}</div>
      <h3>{f['name_html']}</h3>
      <p>{f['short']}</p>
      <span class="go">לדף הזירה ←</span>
    </a>"""
    return f"""<section id="formats">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">הזירות</div>
      <h2>אותו מנגנון, ארבע זירות</h2>
      <p>מופעי קרב לארבע זירות שונות: ניינטיז, אייטיז, Y2K, וסדרות נגד סרטים. בוחרים את הזירה שמדברת לקהל שלכם.</p>
    </div>
    <div class="formats-grid">{cards}</div>
  </div>
</section>"""


# ============================================================================
#  6. דף הבית
# ============================================================================
AUDIENCE = [
    ("מועדונים ובמות",
     "ערב עם מבנה ומתח פנימי, לא רשימת שירים. הקהל נכנס לאפליקציה כבר בשיר הראשון ונשאר בה עד ההכרזה — וזה בדיוק הזמן שבו הוא עומד מול הבר. הרפרטואר בנוי מלהיטים שהאולם מזהה מהתו הראשון."),
    ("מחלקות תרבות ומתנ״סים",
     "מופע שמתאים לקהל רחב ולטווח גילים גדול, בלי תוכן בעייתי ובלי צורך בהיכרות מוקדמת עם הלהקה. ההצבעה מייצרת השתתפות פעילה של הקהל — גם של מי שבא בשביל להביא את הילדים."),
    ("אירועי חברה",
     "המבנה התחרותי עובד מצוין מול קבוצות: אפשר לפצל את המצביעים לצוותים, ולהקרין את התוצאות על מסך האולם. ההרכב מאפשר התאמה לגודל האירוע, לכמות האורחים ולמשך הערב."),
    ("פסטיבלים ואירועי עיר",
     "פורמט שאפשר להסביר בשורה אחת בתוכנייה, ושמייצר לרשות המארגנת נכס מדיד — כמה אנשים הצביעו ומה יצא. ארבע הזירות מאפשרות להחזיר את אותו קונספט בשנה הבאה עם עשור אחר."),
]

def audience_block():
    cards = "".join(
        '<div class="aud-card reveal"><h3>%s</h3><p>%s</p></div>' % (h, p) for h, p in AUDIENCE)
    return f"""<section id="audience">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">למי זה מתאים</div>
      <h2>למה זה עובד אצלכם</h2>
      <p>אותו מופע, ארבעה סוגי אירוע — ומה שמשתנה הוא מה שהמנגנון עושה בשבילכם.</p>
    </div>
    <div class="audience">{cards}</div>
  </div>
</section>"""

HOME_JSONLD = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"MusicGroup","name":"Soundclash","alternateName":"סאונדקלאש",
"url":"%s","genre":["Rock","Tribute","Live Music"],"description":"מופע קרב מוזיקלי חי שבו הקהל מצביע ומכריע בין שני צדדים.",
"image":"%s","email":"%s","telephone":"+972-54-6738192",
"address":{"@type":"PostalAddress","addressCountry":"IL"}}
</script>""" % (SITE_URL, HERO_IMG, EMAIL)

home_body = f"""
<div class="next-show" data-next-show hidden></div>

<section class="hero">
  <div class="hero-photo" style="background-image:url('{HERO_IMG}')"></div>
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">מופע חי · Live Show</div>
    <h1 class="split-fill latin">SOUNDCLASH</h1>
    <h2>קרב מוזיקלי חי. שני צדדים, שיר מול שיר — והקהל מכריע.</h2>
    <p class="lede">
      Soundclash מציגה פורמט מופע שבו <b>הלהיטים הגדולים ביותר של העידן</b> עומדים זה מול זה,
      <span class="b-side">שיר מול שיר, בביצוע חי</span> — וההכרעה בין שני הצדדים נמסרת לקהל,
      בהצבעה מהטלפון בסוף כל סיבוב.
    </p>
    <div class="hero-video">
      <iframe src="https://www.youtube.com/embed/{TRAILER}?rel=0" title="Soundclash — טריילר"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
    </div>
    <div class="cta-row center">
      <a class="btn btn-solid" href="tel:{PHONE_TEL}">{ICON["phone"]} להזמנת המופע</a>
      <a class="btn btn-wa" href="{wa_link()}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
      <a class="btn btn-outline" href="#formats">לארבע הזירות</a>
    </div>
  </div>
</section>

{stats_bar(DEFAULT_STATS)}
{mechanism_block()}
{formats_index()}
{video_section(VIDEOS, head="צפו בקרב מקרוב", sub="ביצועים חיים, ותגובות הקהל בזמן ההצבעה.", limit=3)}
{audience_block()}
{gallery_section(IMAGES[:6], head="תמונות מהבמה")}
{spec_block(DEFAULT_SPEC)}
{contact_band("רוצים את הקרב הזה באירוע שלכם?",
              "אפשר להתקשר, לשלוח וואטסאפ, או למלא את טופס ההזמנה עם התאריך והמקום — ונחזור אליכם עם הצעה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""

page("index.html",
     "Soundclash — מופע קרב מוזיקלי חי שבו הקהל מכריע",
     "מופע קרב מוזיקלי חי בשישה נגנים: שני צדדים, שיר מול שיר, והקהל מצביע ומכריע מהטלפון. ארבע זירות — ניינטיז, אייטיז, Y2K וסדרות נגד סרטים. להזמנות: 054-6738192.",
     home_body, "home", theme="theme-90", jsonld=HOME_JSONLD)


# ============================================================================
#  7. דפי הפורמטים
# ============================================================================
FORMAT_PAGES = {
 "90s": dict(
   title="Soundclash ניינטיז — קרב הרוק של שנות ה-90, ארה״ב נגד בריטניה",
   desc="מופע קרב חי על עשור הרוק של שנות ה-90: גראנג׳ וגלאם אמריקאי מול בריטפופ ואינדי בריטי, שיר מול שיר, והקהל מכריע בהצבעה מהטלפון. להזמנות 054-6738192.",
   sub="הקרב הגדול על השליטה בניינטיז",
   arc="מהגראנג׳ של סיאטל ועד ל<em>בריטפופ</em> של מנצ׳סטר, מהגלאם האמריקאי ועד לאינדי הבריטי — עשור אחד, ושני צדדים של האוקיינוס שלא הסכימו על כלום.",
   lede=("בצד אחד <b>הסאונד המלוכלך של הגראנג׳ וההפקה הגדולה של הרוק האמריקאי</b>. "
         "בצד השני <span class='b-side'>החוצפה, המלודיות והסטייל של הרוק הבריטי</span>. "
         "שיר מול שיר, סיבוב מול סיבוב — והקהל מכריע."),
   side_a=("TEAM USA", "הצד האמריקאי", "העוצמה, הריף והגיטרה המעוותת — העשור שבו אמריקה כתבה את הרוק הכבד של הרדיו.",
           ["גראנג׳", "גלאם רוק", "רוק אלטרנטיבי אמריקאי", "פוסט-גראנג׳"]),
   side_b=("TEAM UK", "הצד הבריטי", "המלודיה, ההברה והסטייל — העשור שבו בריטניה החזירה לעצמה את הרדיו העולמי.",
           ["בריטפופ", "אינדי בריטי", "אגדות הרוק הבריטי", "אלטרנטיב בריטי"]),
   avail="זירת הניינטיז היא הפורמט שרץ היום, ומוכנה לתאריכים מיידיים."),

 "80s": dict(
   title="Soundclash אייטיז — קרב שנות ה-80, בריטניה נגד ארה״ב",
   desc="מופע קרב חי על שנות ה-80: הסינת׳-פופ והניו-ווייב הבריטי מול הסטדיום רוק והגלאם האמריקאי, שיר מול שיר, והקהל מכריע בהצבעה חיה. להזמנות 054-6738192.",
   sub="ניאון מול סטדיון — הקרב על האייטיז",
   arc="מהסינת׳-פופ הבריטי ועד ל<em>סטדיום רוק</em> אמריקאי, מהניו-רומנטיקס ועד לגלאם מטאל — העשור שבו כל שיר נשמע כמו נבואה על העתיד.",
   lede=("בצד אחד <b>הגיטרות הגדולות, הבלדות והסטדיונים של אמריקה</b>. "
         "בצד השני <span class='b-side'>הסינתסייזרים, הניאון והסטייל של הגל הבריטי החדש</span>. "
         "העשור הכי מלוטש שהיה לרוק, בשני נוסחים שאי אפשר לבלבל ביניהם."),
   side_a=("TEAM USA", "הצד האמריקאי", "העשור שבו הרוק האמריקאי גדל לגודל של אצטדיון — סולואים, בלדות והרמוניות שנבנו כדי למלא אולם.",
           ["סטדיום רוק", "גלאם מטאל", "הארט רוק", "פופ אמריקאי של MTV"]),
   side_b=("TEAM UK", "הצד הבריטי", "העשור שבו בריטניה החליפה את הגיטרה בסינתסייזר, ואת החולצה במעיל — וכבשה את המצעדים.",
           ["סינת׳-פופ", "ניו-ווייב", "ניו-רומנטיקס", "פוסט-פאנק בריטי"]),
   avail="זירת האייטיז עולה לבמה תוך 4–6 שבועות ממועד ההזמנה."),

 "y2k": dict(
   title="Soundclash Y2K — קרב שנות האלפיים, בריטניה נגד ארה״ב",
   desc="מופע קרב חי על שנות האלפיים: האינדי והגראז׳ רוק הבריטי מול הפופ-פאנק והרוק האמריקאי, שיר מול שיר, והקהל מכריע בהצבעה חיה. להזמנות 054-6738192.",
   sub="העשור הראשון של המילניום, בשני נוסחים",
   arc="מהגראז׳ רוק הבריטי של תחילת האלפיים ועד ל<em>פופ-פאנק</em> האמריקאי, מהאינדי של הקלאבים ועד לרוק של תחנות הרדיו הגדולות — העשור שכולם גדלו עליו ואף אחד עוד לא ניגן ראש בראש.",
   lede=("בצד אחד <b>הרוק והפופ האמריקאי של שנות האלפיים</b> — העשור של הריף הקצר והפזמון הגדול. "
         "בצד השני <span class='b-side'>הגל הבריטי החדש</span>, שהחזיר את הגיטרות למועדונים. "
         "זו הזירה של הקהל שהיה בן עשרים בשנת 2005."),
   side_a=("TEAM USA", "הצד האמריקאי", "הפזמון שנבנה לרדיו, הגיטרה שנבנתה לחדר החזרות — והעשור שבו שניהם התחברו.",
           ["פופ-פאנק", "רוק אלטרנטיבי", "ניו-מטאל", "פופ אמריקאי"]),
   side_b=("TEAM UK", "הצד הבריטי", "הגל שיצא מהמועדונים הקטנים של לונדון וסיים בפסטיבלים הגדולים באירופה.",
           ["אינדי בריטי", "גראז׳ רוק", "אלקטרו-פופ בריטי", "לנדמארק בריטי"]),
   avail="זירת ה-Y2K עולה לבמה תוך 4–6 שבועות ממועד ההזמנה."),

 "screen": dict(
   title="Soundclash סדרות נגד סרטים — קרב הפזמונים של המסך",
   desc="מופע קרב חי על מוזיקת המסך: פזמוני הפתיחה של הסדרות מול פסקולי הקולנוע הגדולים, שיר מול שיר, והקהל מכריע בהצבעה חיה. להזמנות 054-6738192.",
   sub="שני מסכים, קרב אחד",
   arc="מפזמוני הפתיחה שכולם יודעים בעל פה ועד ל<em>רגעי הפסקול</em> הגדולים של הקולנוע — הפעם הקרב אינו בין שתי מדינות, אלא בין שני מסכים.",
   lede=("בצד אחד <b>הסדרות</b> — הפזמונים שנכנסו לסלון פעם בשבוע, שנה אחרי שנה, עד שכולם ידעו אותם. "
         "בצד השני <span class='b-side'>הקולנוע</span> — השירים שנצרבו יחד עם סצנה אחת גדולה. "
         "זירה שלא דורשת מהקהל להכיר להקה, רק לזכור איפה הוא שמע את זה."),
   side_a=("TEAM TV", "צד הסדרות", "פזמוני פתיחה, נושאים חוזרים ורגעי סיום עונה — מוזיקה שנבנתה כדי לחזור.",
           ["פזמוני פתיחה", "סדרות פולחן", "טלוויזיה של פעם", "רגעי סיום עונה"]),
   side_b=("TEAM FILM", "צד הסרטים", "שירי נושא ורגעי פסקול — מוזיקה שנבנתה כדי לחתום סצנה אחת ולהישאר.",
           ["שירי נושא", "רגעי פסקול", "קולנוע פולחן", "הסצנה שכולם זוכרים"]),
   avail="זירת הסדרות והסרטים עולה לבמה תוך 4–6 שבועות ממועד ההזמנה."),
}

def duel_block(a, b):
    def card(side, cls):
        tag, h, p, chips = side
        chips_html = "".join('<span class="chip">%s</span>' % c for c in chips)
        return (f'<div class="duel-card {cls} reveal"><span class="tag latin">{tag}</span>'
                f'<h3>{h}</h3><p>{p}</p><div class="chips">{chips_html}</div></div>')
    return f"""<section id="sides">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">שני הצדדים</div>
      <h2>מי עומד מול מי</h2>
    </div>
    <div class="duel">
      {card(a, "a")}
      <div class="vs latin">VS</div>
      {card(b, "b")}
    </div>
  </div>
</section>"""

for f in FORMATS:
    d = FORMAT_PAGES[f["slug"]]
    spec = [r for r in DEFAULT_SPEC if r[0] != "זמינות פורמט"]
    spec.insert(5, ("זמינות", d["avail"]))

    if f["live"]:
        vids = video_section(VIDEOS, head="צפו בקרב מקרוב",
                             sub="ביצועים חיים מזירת הניינטיז, ותגובות הקהל בזמן ההצבעה.", limit=3)
    else:
        vids = video_section(VIDEOS, head="ככה נראה קרב Soundclash", eyebrow="המנגנון בעיניים",
                             sub="הסרטונים צולמו בזירת הניינטיז — הזירה שרצה היום. המנגנון, ההצבעה והמבנה זהים בכל הזירות; מה שמשתנה הוא הרפרטואר.",
                             limit=3)

    body = f"""
<section class="hero">
  <div class="hero-photo" style="background-image:url('{IMAGES[1][0]}')"></div>
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">{f['tag']} · Soundclash</div>
    <div class="era-mark latin">{f['era']}</div>
    <h2>{d['sub']}</h2>
    <p class="lede">{d['lede']}</p>
    <div class="cta-row center">
      <a class="btn btn-solid" href="tel:{PHONE_TEL}">{ICON["phone"]} להזמנת הזירה הזו</a>
      <a class="btn btn-wa" href="{wa_link('היי, אשמח לפרטים על ' + f['name'] + ' לאירוע שלנו.')}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
      <a class="btn btn-outline" href="contact.html">טופס הזמנה</a>
    </div>
  </div>
</section>

<section style="padding-top:56px; padding-bottom:8px">
  <div class="wrap"><p class="arc reveal">{d['arc']}</p></div>
</section>

{stats_bar(DEFAULT_STATS)}
{duel_block(d['side_a'], d['side_b'])}
{mechanism_block(head="ככה מוכרעת הזירה", sub="ההצבעה אינה גימיק שמתלווה למופע — היא המבנה שלו. כל סיבוב נסגר בהכרעה של הקהל.")}
{vids}
{gallery_section(IMAGES[3:6], head="תמונות מהבמה")}
{spec_block(spec, title="המפרט של הזירה הזו")}
{contact_band("רוצים את " + f['name_html'] + " אצלכם?",
              "תגידו לנו תאריך, מקום וגודל קהל משוער — ונחזור אליכם עם הצעה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""
    page(f["file"], d["title"], d["desc"], body, "fmt-" + f["slug"], theme=f["theme"], og_img=IMAGES[1][0])


# ============================================================================
#  8. הופעות קרובות
# ============================================================================
shows_body = f"""
<section class="hero compact">
  <div class="hero-photo" style="background-image:url('{IMAGES[2][0]}')"></div>
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div class="eyebrow">לוח הופעות</div>
    <h1 class="latin" style="font-size:clamp(40px,8vw,86px)">SHOWS</h1>
    <h2>הופעות קרובות פתוחות לקהל</h2>
    <p class="lede">כאן מתפרסמים התאריכים שפתוחים לרכישת כרטיסים. להזמנת המופע לאירוע פרטי, לחברה או למקום שלכם — יצירת קשר ישירה.</p>
  </div>
</section>

<section>
  <div class="wrap-narrow">
    <div class="show-list" data-shows-list>
      <div class="empty-state">טוען תאריכים…</div>
    </div>
    <noscript><p class="empty-state" style="margin-top:16px">לצפייה בתאריכים המעודכנים יש לאפשר JavaScript, או להתקשר ל-{PHONE_MAIN}.</p></noscript>
  </div>
</section>

{contact_band("לא מצאתם תאריך שמתאים?",
              "אנחנו מעלים את המופע גם כאירוע סגור — במועדון, בחברה, במתנ״ס או בפסטיבל.")}
"""
page("shows.html", "הופעות קרובות — Soundclash",
     "לוח ההופעות הקרובות של Soundclash, עם קישורים לרכישת כרטיסים. להזמנת המופע לאירוע: 054-6738192.",
     shows_body, "shows", theme="theme-90", og_img=IMAGES[2][0])


# ============================================================================
#  9. גלריה
# ============================================================================
gallery_body = f"""
<section class="hero compact">
  <div class="hero-photo" style="background-image:url('{IMAGES[1][0]}')"></div>
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div class="eyebrow">מהבמה</div>
    <h1 class="latin" style="font-size:clamp(40px,8vw,86px)">GALLERY</h1>
    <h2>תמונות מההופעות</h2>
    <p class="lede">לחיצה על תמונה פותחת אותה בגודל מלא.</p>
  </div>
</section>

{gallery_section(IMAGES, head="כל התמונות", eyebrow="גלריה", link_more=False)}
{video_section(VIDEOS, head="וידאו מההופעות", eyebrow="וידאו", limit=4)}
{contact_band("רוצים לראות את זה אצלכם?",
              "אפשר להתקשר, לשלוח וואטסאפ, או למלא את טופס ההזמנה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""
page("gallery.html", "גלריה — Soundclash",
     "תמונות ווידאו מהופעות Soundclash: הלהקה על הבמה, הקהל בהצבעה, ורגעים מתוך הקרב.",
     gallery_body, "gallery", theme="theme-90", og_img=IMAGES[1][0])


# ============================================================================
#  10. אודות
# ============================================================================
LINEUP = [
    ("ינון בר שירה",   "שירה וגיטרה אקוסטית"),
    ("רעות זורמן",     "שירה וגיטרה חשמלית"),
    ("ולאד פוזיילוב",  "גיטרה חשמלית מובילה וקולות"),
    ("חן רימציקי",     "קלידים"),
    ("עומר מתתיהו",    "בס"),
    ("תומר כהן",       "תופים"),
]
lineup_html = "".join('<li><b>%s</b> — %s</li>' % (name, role) for name, role in LINEUP)

about_body = f"""
<section class="hero compact">
  <div class="hero-photo" style="background-image:url('{IMAGES[0][0]}')"></div>
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">אודות</div>
    <h1 class="split-fill latin" style="font-size:clamp(46px,10vw,110px)">SOUNDCLASH</h1>
    <h2>להקה שבנתה לעצמה זירה</h2>
  </div>
</section>

<section>
  <div class="wrap-narrow prose reveal">
    <p><strong>Soundclash היא הרכב חי של שישה נגנים, המגיש מופע קרב מוזיקלי שבו שני צדדים עומדים זה מול זה, שיר מול שיר.</strong>
    המופע אינו מקבץ של להיטים בסדר כלשהו: הוא בנוי כסדרת סיבובים, ובסופו של כל סיבוב הקהל מצביע ומכריע מי לקח אותו.</p>

    <p>את מערכת ההצבעה פיתחנו בעצמנו. היא רצה בדפדפן של הטלפון, בלי הורדה ובלי הרשמה, ומציגה את התוצאה על מסך האולם בזמן אמת.
    זה מה שמחזיק את הקהל בתוך המופע לכל אורכו — הוא לא רק צופה בערב, הוא קובע איך הוא נגמר. את המערכת אנחנו מביאים ומפעילים,
    כך שמבחינת המקום המארח זו לא עוד משימה טכנית ברשימה.</p>

    <h3>ההרכב</h3>
    <ul class="lineup">{lineup_html}</ul>

    <h3>הזירות</h3>
    <p>אותו מנגנון מוגש בארבע זירות: ניינטיז, אייטיז, Y2K, וסדרות נגד סרטים. זירת הניינטיז היא זו שרצה היום;
    שאר הזירות עולות לבמה תוך ארבעה עד שישה שבועות ממועד ההזמנה. גודל ההרכב ומבנה הסיבובים מאפשרים התאמה
    לסוג האירוע, לכמות האורחים ולמשך ההופעה.</p>

    <h3>מי עומד מאחורי זה</h3>
    <p>ההפקה היא של <strong>מעשיתיאטרון</strong>. אנשי הקשר להזמנות הם <strong>ינון בר שירה</strong> ו<strong>נעמה בר שירה</strong>,
    ואפשר להגיע אלינו ישירות בטלפון, בוואטסאפ או במייל — בלי סוכנות באמצע.</p>
  </div>
</section>

{stats_bar(DEFAULT_STATS)}
{mechanism_block()}
{gallery_section(IMAGES[6:], head="הלהקה", link_more=True)}
{contact_band("נשמח לדבר",
              "תגידו לנו תאריך, מקום וגודל קהל משוער — ונחזור אליכם עם הצעה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""
page("about.html", "אודות הלהקה — Soundclash",
     "Soundclash — הרכב חי של שישה נגנים, מופע קרב מוזיקלי עם אפליקציית הצבעה שפיתחנו בעצמנו. ההרכב, המנגנון וארבע הזירות.",
     about_body, "about", theme="theme-90")


# ============================================================================
#  11. יצירת קשר
# ============================================================================
fmt_options = "".join('<option>%s</option>' % f["name"] for f in FORMATS)
contact_people = "".join(
    '<div class="person"><b>%s</b><a href="tel:%s">%s</a></div>' % (n, t, p) for n, p, t in CONTACTS)

contact_body = f"""
<section class="hero compact">
  <div class="hero-photo" style="background-image:url('{IMAGES[1][0]}')"></div>
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">להזמנת המופע</div>
    <h1 class="latin" style="font-size:clamp(38px,7.5vw,78px)">BOOK THE CLASH</h1>
    <h2>בואו נמצא לזה תאריך</h2>
    <p class="lede">הכי מהיר — טלפון או וואטסאפ. אם נוח לכם בכתב, הטופס למטה שולח לנו את כל מה שאנחנו צריכים כדי לחזור אליכם עם הצעה.</p>
    <div class="cta-row center">
      <a class="btn btn-solid" href="tel:{PHONE_TEL}">{ICON["phone"]} {PHONE_MAIN}</a>
      <a class="btn btn-wa" href="{wa_link()}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
      <a class="btn btn-outline" href="mailto:{EMAIL}">{ICON["mail"]} מייל</a>
    </div>
  </div>
</section>

<section>
  <div class="wrap-narrow">
    <div class="form-card reveal">
      <h2 style="font-size:26px; margin-bottom:8px">טופס הזמנה</h2>
      <p style="color:var(--text-dim); margin-bottom:26px; font-size:15.5px">
        ארבעה שדות חובה בלבד. כל השאר עוזר לנו לחזור אליכם עם תשובה מדויקת כבר בפנייה הראשונה.</p>

      <form data-contact-form>
        <div class="field-row">
          <div class="field">
            <label for="f-name">שם מלא <span class="req">*</span></label>
            <input id="f-name" name="name" type="text" required autocomplete="name" placeholder="ישראל ישראלי">
          </div>
          <div class="field">
            <label for="f-phone">טלפון <span class="req">*</span></label>
            <input id="f-phone" name="phone" type="tel" required autocomplete="tel" placeholder="050-0000000" inputmode="tel">
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-email">אימייל</label>
            <input id="f-email" name="email" type="email" autocomplete="email" placeholder="name@example.com">
          </div>
          <div class="field">
            <label for="f-org">שם המקום / הגוף</label>
            <input id="f-org" name="org" type="text" placeholder="מועדון, חברה, מתנ״ס, פסטיבל">
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-type">סוג האירוע <span class="req">*</span></label>
            <select id="f-type" name="type" required>
              <option value="">בחרו…</option>
              <option>מועדון / במה</option>
              <option>אירוע חברה</option>
              <option>מחלקת תרבות / מתנ״ס</option>
              <option>פסטיבל / אירוע עירוני</option>
              <option>אירוע פרטי</option>
              <option>אחר</option>
            </select>
          </div>
          <div class="field">
            <label for="f-format">הזירה שמעניינת אתכם <span class="req">*</span></label>
            <select id="f-format" name="format" required>
              <option value="">בחרו…</option>
              {fmt_options}
              <option>עוד לא החלטנו</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-date">תאריך משוער</label>
            <input id="f-date" name="date" type="date">
          </div>
          <div class="field">
            <label for="f-size">גודל קהל משוער</label>
            <input id="f-size" name="size" type="text" placeholder="למשל 150–200">
          </div>
        </div>

        <div class="field">
          <label for="f-msg">משהו שכדאי שנדע</label>
          <textarea id="f-msg" name="message" placeholder="מיקום, שעה, מגבלות באולם, או כל דבר אחר"></textarea>
        </div>

        <div class="cta-row">
          <button class="btn btn-solid" type="submit">שליחת הפנייה</button>
          <a class="btn btn-wa" data-wa-from-form href="{wa_link()}" target="_blank" rel="noopener">{ICON["wa"]} לשלוח בוואטסאפ במקום</a>
        </div>
        <div class="form-msg" role="status" aria-live="polite"></div>
        <p class="form-note">כפתור הוואטסאפ פותח שיחה עם כל מה שכבר מילאתם בטופס — לא צריך להקליד שוב.</p>
      </form>
    </div>

    <div class="mt-32" style="text-align:center">
      <div class="people" style="margin-bottom:0">
        {contact_people}
        <div class="person"><b>אימייל</b><a href="mailto:{EMAIL}">{EMAIL}</a></div>
      </div>
    </div>
  </div>
</section>

{spec_block(DEFAULT_SPEC, title="מה כדאי לדעת לפני שמדברים")}
"""
page("contact.html", "יצירת קשר והזמנת המופע — Soundclash",
     "להזמנת מופע Soundclash: טלפון 054-6738192, וואטסאפ, מייל או טופס הזמנה. מועדונים, אירועי חברה, מחלקות תרבות ופסטיבלים.",
     contact_body, "contact", theme="theme-90", og_img=IMAGES[1][0])

print("נבנו הדפים:", ", ".join(sorted(f for f in os.listdir(OUT) if f.endswith(".html"))))

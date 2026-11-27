# -*- coding: utf-8 -*-
"""
בונה את אתר Soundclash מקובץ אחד.
כל התוכן, הקישורים ופרטי הקשר יושבים כאן. משנים כאן — מריצים `python3 build.py` —
וכל הדפים מתעדכנים יחד. אין תלות בשום ספרייה חיצונית.
"""
import os, re, html, datetime

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
    "youtube":   "https://www.youtube.com/@SoundclashmusicBattle",
    "facebook":  "https://www.facebook.com/profile.php?id=61589041324979",
    "instagram": "https://www.instagram.com/soundclash_music_battles/",
}

# ============================================================================
#  2. תמונות הבמה. הועברו מוויקס למאגר ב-19.11.2026 (tools/migrate_images.py).
#     לכל תמונה: <id>-800.webp (נייד), <id>-1600.webp (מלא), <id>-og.jpg (שיתוף 1200x630).
# ============================================================================
W = "assets/img/stage/"
PHOTO_CREDIT = "צילום: ירון וג וענת מגריל"
IMAGES = [   # צילומי ההופעה בתמונע, תל אביב (19.11.2026). (נתיב, תיאור, לאורך?)
    ("assets/img/tmuna/09202", "כל הלהקה על הבמה בתמונע, מול שני הדגלים והקהל", False),
    ("assets/img/tmuna/09122", "הלהקה בתאורה ירוקה, דגל בריטניה ודגל ארה״ב מאחור", False),
    ("assets/img/tmuna/09213", "הלהקה בתאורה סגולה מול אולם מלא", False),
    ("assets/img/tmuna/09363", "הסולנית מחייכת עם הגיטרה החשמלית", True),
    ("assets/img/tmuna/09307", "ינון שר עם האקוסטית בתאורה אדומה", False),
    ("assets/img/tmuna/09274", "הסולן והסולנית בתאורה כחולה", False),
    ("assets/img/tmuna/09224", "ינון עם האקוסטית מול הדגל האמריקאי", True),
    ("assets/img/tmuna/09347", "ההרכב המלא בתאורה אדומה", False),
    ("assets/img/tmuna/09219", "הגיטריסט, הסולן והסולנית בתאורה צבעונית", False),
    ("assets/img/tmuna/09270-2", "הבסיסט בחולצת קווין", True),
    ("assets/img/tmuna/09260", "יד מורמת לקהל בתאורה כחולה", False),
    ("assets/img/tmuna/09381", "הגיטריסט והקלידן", True),
    ("assets/img/tmuna/09230", "גיטרה חשמלית ואקוסטית זו לצד זו", False),
    ("assets/img/tmuna/09296", "שירה מול הדגל הבריטי", True),
    ("assets/img/tmuna/09350", "הסולנית והבסיסט מתחת לדגל האמריקאי", False),
    ("assets/img/tmuna/09393", "הסולן בעשן הבמה", True),
]
def img(i, size=1600):
    """נתיב לתמונת במה לפי מזהה, בגודל 800 או 1600."""
    return f"{i}-{size}.webp"
def hero_photo(i):
    """רקע הפתיחה: 800 בנייד, 1600 במסך רחב. תמונה שאינה מתיקיית הבמה עוברת כמו שהיא."""
    if i.startswith(W) or i.startswith("assets/img/tmuna/"):
        return f'<div class="hero-photo" style="--hp:url(\'/{img(i,800)}\');--hp-l:url(\'/{img(i)}\')"></div>'
    return f'<div class="hero-photo" style="--hp:url(\'/{i}\');--hp-l:url(\'/{i}\')"></div>'
def og_of(i):
    return f"{SITE_URL}/{i}-og.jpg"   # קיים ל-09122 ו-09202 מתיקיית תמונע
HERO_IMG = IMAGES[0][0]
OG = {k: f"{SITE_URL}/assets/img/og/{k}.jpg" for k in ("home", "tv-vs-film", "events", "israel", "shows")}

VIDEOS = [
    ("6XJsn9DJnxg", "הקהל בטירוף"),
    ("vkYElSJr6PI", "אז מה זה Soundclash?"),
    ("tjGkZa0l0NU", "ככה מצביעים באפליקציה"),
    ("AxSH8I3mNvE", "אז איך זה הולך עם ההצבעות?"),
]
TRAILER = "6XJsn9DJnxg"
import hashlib as _h
ASSET_V = _h.sha1(open("assets/css/site.css","rb").read() + open("assets/js/site.js","rb").read()).hexdigest()[:8]
# הטריילר מציג את הניינטיז, ולכן הוא מופיע רק בעמוד הניינטיז (ינון, 14.11.2026).
# בשאר העמודים: הדגמת האפליקציה של סדרות נגד סרטים, עד שיהיה סרטון חדש של המופע.
VIDEOS_NO_TRAILER = [v for v in VIDEOS if v[0] != TRAILER]
# בגלריה: הטריילר של הניינטיז (הסרטון החזק מהבמה) במקום "אז מה זה Soundclash?", ואחריו שני סרטוני ההצבעה (ינון, 24.11.2026)
GALLERY_VIDEOS = [VIDEOS[0], VIDEOS[2], VIDEOS[3]]
DEMO_MP4 = "assets/video/tv-vs-film-demo.mp4?v=9"
DEMO_POSTER = "assets/video/tv-vs-film-demo-poster.webp?v=9"
# תמונת רקע בלי דגלים לעמודי סדרות נגד סרטים: פריים מסרטוני ה-AI של המופע (ינון, 14.11.2026)
HERO_SCREEN = "assets/img/hero-tv-vs-film.jpg"
SCREEN_CLIPS = [  # (קובץ בלי סיומת, צד, מקור)
    ("assets/video/screen-09-tv", "tv", "Bad Romance"),  # הגלאם קודם (14.11.2026)
    ("assets/video/screen-03-film", "film", "טיטאניק"),
    ("assets/video/screen-10-tv", "tv", "חברים"),
]

def svids_html():
    return '<div class="svids">' + "".join(
        f'<figure class="svid reveal"><video src="{f}.mp4" poster="{f}.jpg" muted loop playsinline preload="none" data-autoplay-visible '
        f'aria-label="סרטון האווירה של {src}"></video>'
        f'<figcaption><span class="side side-{side}">{"סדרה" if side == "tv" else "סרט"}</span> {src}</figcaption></figure>'
        for f, side, src in SCREEN_CLIPS) + '</div>'

def screen_videos_section():
    """במקום תמונות מהבמה (עם דגלי הניינטיז): שלושה מסרטוני ה-AI שהוכנו למופע."""
    items = "".join(
        f'<figure class="svid reveal"><video src="{f}.mp4" poster="{f}.jpg" muted loop playsinline preload="none" data-autoplay-visible '
        f'aria-label="סרטון האווירה של {src}"></video>'
        f'<figcaption><span class="side side-{side}">{"סדרה" if side == "tv" else "סרט"}</span> {src}</figcaption></figure>'
        for f, side, src in SCREEN_CLIPS)
    return f"""<section id="on-screen">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">על המסך</div>
      <h2>סרטון מקורי לכל שיר</h2>
      <p>שלוש דוגמאות מתוך עשרים סרטוני האווירה שיצרנו למופע. כל שיר מקבל סרטון משלו, עם רמזים לסדרה או לסרט שהוא מגיע מהם.</p>
    </div>
    <div class="svids">{items}</div>
  </div>
</section>"""

DEMO_CAPTION = "הדגמה: סיבוב מסיבת הריקודים, Bad Romance מול It's Raining Men, על המסך ובטלפון"
DEMO_CAPTION_HTML = ("הדגמה: סיבוב מסיבת הריקודים, <bdi dir=\"ltr\">Bad Romance</bdi> מול "
                     "<bdi dir=\"ltr\">It's Raining Men</bdi>, על המסך ובטלפון")

def demo_video(cls="hero-video", caption=DEMO_CAPTION, caption_html=DEMO_CAPTION_HTML):
    return f"""<figure class="{cls} demo-video">
      <video src="{DEMO_MP4}" poster="{DEMO_POSTER}" autoplay muted loop playsinline preload="metadata"
        aria-label="{caption}"></video>
      <button type="button" class="demo-sound" aria-pressed="false" aria-label="הפעלת סאונד">
        <span class="on">🔊 עם סאונד</span><span class="off">🔇 בלי סאונד</span></button>
      <button type="button" class="demo-full" aria-label="צפייה במסך מלא, עם סאונד">⛶ מסך מלא</button>
    </figure>
    <p class="demo-cap">{caption_html}</p>"""

def yt_lite(vid, title):
    """תמונה וכפתור במקום נגן יוטיוב. הנגן נטען רק בלחיצה (site.js), כדי שהעמוד לא יהיה כבד בטלפון (ליה, 24.11.2026)."""
    t = html.escape(title)
    return (f'<button type="button" class="yt-lite" data-yt="{vid}" data-title="{t}" aria-label="הפעלת הסרטון: {t}" '
            f'style="background-image:url(\'https://i.ytimg.com/vi/{vid}/hqdefault.jpg\')"><span class="yt-play" aria-hidden="true"></span></button>')

def trailer_video(cls="hero-video"):
    return f"""<div class="{cls}">
      {yt_lite(TRAILER, "Soundclash ניינטיז, טריילר")}
    </div>"""

# ============================================================================
#  3. הפורמטים (״הזירות״)
# ============================================================================
def ltr(t):
    """עוטף מילה לטינית כדי שתישאר בכיוון שלה בתוך משפט עברי."""
    return '<span class="ltr">%s</span>' % t

# שורת סטטוס כנה לכל מופע. בלי תאריך בכורה, כדי שאף אחד לא יבין שאי אפשר להזמין לפניו (ינון, 24.11.2026)
LAUNCH_STATUS = "ההופעות הראשונות נסגרות עכשיו · מחיר השקה עד 31.3.2027"
# הסדר: סדרות נגד סרטים, מסיבה ישראלית, ניינטיז (ינון, 24.11.2026)
FORMATS = [
    dict(slug="screen", file="tv-vs-film.html", theme="theme-screen", css="f-screen",
         era="TV/FILM", name="Soundclash סדרות נגד סרטים",
         nav="סדרות נגד סרטים", nav_plain="סדרות נגד סרטים",
         name_html=ltr("Soundclash") + " סדרות נגד סרטים",
         tag="המופע החדש", live=False, hot=True, logo="assets/img/logo-tv-vs-film-sm.webp", logo_alt="Soundclash סדרות נגד סרטים",
         short="שיר מסדרה מול שיר מסרט, 10 סיבובים, ומסך עם וידאו מקורי לכל שיר.",
         occasion="לחנוכה ולאירוע הגדול של השנה: חברות, היכלי תרבות וערבים נוצצים",
         status=LAUNCH_STATUS),
    dict(slug="israel", file="israel.html", theme="theme-il", css="f-il",
         era="70–90", name="Soundclash מסיבה ישראלית",
         nav="מסיבה ישראלית", nav_plain="מסיבה ישראלית",
         name_html=ltr("Soundclash") + " מסיבה ישראלית",
         tag="להזמנה", live=False, logo="assets/img/logo-israeli-party-sm.webp?v=2", logo_alt="Soundclash מסיבה ישראלית",
         short="להיטי הסבנטיז והאייטיז מול להיטי הניינטיז, שירים שכל האולם שר, ורחבה מלאה עד הסוף.",
         occasion="לרשויות, לוועדי עובדים, למלונות ולבמות חוץ. בלי מסך, הכול בעברית",
         status=LAUNCH_STATUS),
    dict(slug="90s", file="90s.html", theme="theme-90", css="f-90",
         era="90's", name="Soundclash ניינטיז",
         nav='ניינטיז ' + ltr("90's"), nav_plain="ניינטיז 90's",
         name_html=ltr("Soundclash") + " ניינטיז",
         tag="כבר על הבמות", live=True, logo="assets/img/logo-90s-sm.webp", logo_alt="Soundclash ניינטיז",
         short="המופע שכבר עולה על הבמות: ארה״ב מול בריטניה.",
         occasion="לערב צוות, למועדון ולצוות בינלאומי (הנחיה גם באנגלית)",
         status="עולה עכשיו על הבמות · אפשר לבוא לראות לפני שמזמינים"),
    dict(slug="80s", file="80s.html", theme="theme-80", css="f-80",
         era="80's", name="Soundclash אייטיז",
         nav='אייטיז ' + ltr("80's"), nav_plain="אייטיז 80's",
         name_html=ltr("Soundclash") + " אייטיז",
         tag="לפי בקשה", live=False, draft=True,
         short="ניאון מול איצטדיון. הסינת׳ הבריטי מול הלהיטים הגדולים של אמריקה.")
]
# אייטיז ירד מהאתר כטיוטה (24.11.2026): אין לו עדיין סטליסט סגור בכיוון החדש, ולא בטוח שהוא המופע הבא.
# הדף 80s.html עדיין נבנה (עם noindex), אבל לא מופיע בתפריט, בפוטר, בכרטיסי הבית, בטופס ובמפת האתר.
# להחזרה: למחוק draft=True, להחזיר את השורה ב-sitemap.xml, ולעדכן את טקסט האודות ועמוד האירועים.
PUBLIC_FORMATS = [f for f in FORMATS if not f.get("draft")]

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
        for f in PUBLIC_FORMATS)
    return f"""<header class="nav">
  <nav class="nav-inner" aria-label="ניווט ראשי">
    <a class="nav-logo latin" href="{p}index.html">SOUND<b>CLASH</b></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="פתיחת תפריט">
      <span></span><span></span><span></span>
    </button>
    <div class="nav-links" id="nav-links" data-open="false">
      {item("index.html", "דף הבית", "home")}
      <details class="nav-drop">
        <summary{drop_active}>המופעים</summary>
        <div class="drop-menu">{formats_menu}</div>
      </details>
      {item("events.html", "לאירועי חברה", "events")}
      {item("authorities.html", "לרשויות", "authorities")}
      {item("shows.html", "הופעות", "shows")}
      {item("gallery.html", "גלריה", "gallery")}
      {item("about.html", "אודות", "about")}
      {item("contact.html", "יצירת קשר", "contact")}
      <a class="nav-vote-mobile" href="{p}live/">🗳 להצבעה במופע</a>
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

def contact_band(title, sub, extra_btn="", photo=True):
    people = "".join(
        '<div class="person"><b>%s</b><a href="tel:%s">%s</a></div>' % (n, t, p)
        for n, p, t in CONTACTS)
    people += '<div class="person"><b>אימייל</b><span>%s</span></div>' % EMAIL
    return f"""<div class="seam-div" aria-hidden="true"></div>
<section>
  <div class="wrap">
    <div class="contact-band reveal{' has-photo' if photo else ''}">
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
    fmt_links = "".join('<li><a href="%s%s">%s</a></li>' % (p, f["file"], f["nav"]) for f in PUBLIC_FORMATS)
    return f"""<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div class="brand latin">SOUND<b>CLASH</b></div>
        <p class="tagline">מופע קרב מוזיקלי חי, שבו ההכרעה בין שני צדדים נמסרת לקהל, בהצבעה חיה מהטלפון.</p>
        {socials_html()}
      </div>
      <div>
        <h4>המופעים</h4>
        <ul>{fmt_links}<li><a href="{p}live/">🗳 להצבעה במופע</a></li></ul>
      </div>
      <div>
        <h4>יצירת קשר</h4>
        <ul>
          <li><a href="tel:{PHONE_TEL}">{PHONE_MAIN} · ינון</a></li>
          <li><a href="tel:0546589303">054-6589303 · נעמה</a></li>
          <li><a href="{wa_link()}" target="_blank" rel="noopener">וואטסאפ</a></li>
          <li><a href="{p}events.html">לאירועי חברה</a></li>
          <li><a href="{p}authorities.html">לרשויות ומחלקות תרבות</a></li>
          <li><a href="{p}contact.html">טופס הזמנה</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">© {datetime.date.today().year} <span class="latin">SOUNDCLASH</span> · כל הזכויות שמורות · <a class="footer-crew" href="{p}live/admin/">כניסת להקה</a></div>
  </div>
</footer>
<a class="wa-float" href="{wa_link()}" target="_blank" rel="noopener" aria-label="שליחת הודעה בוואטסאפ">{ICON["wa"]}</a>"""

def mbar(active):
    """פס פעולה קבוע בתחתית המסך בנייד: וואטסאפ, חיוג, ופעולה ראשית לפי העמוד."""
    main = ('<a class="m-main" href="#quote">הצעת מחיר</a>' if active == "events"
            else '<a class="m-main" href="contact.html">להזמנת המופע</a>')
    return (f'<nav class="mbar" aria-label="פעולות מהירות">'
            f'<a class="m-wa" href="{wa_link()}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>'
            f'<a class="m-call" href="tel:{PHONE_TEL}">{ICON["phone"]} חיוג</a>{main}</nav>')

def page(filename, title, description, body, active, theme="theme-90", og_img=None, jsonld="", noindex=False):
    og_img = og_img or OG["home"]
    doc = f"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{SITE_URL}/{filename}">{'<meta name="robots" content="noindex">' if noindex else ''}
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/icon-32.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
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
<link rel="stylesheet" href="assets/css/site.css?v={ASSET_V}">
{jsonld}
</head>
<body class="{theme}">
{nav(active)}
{body}
{footer()}
{mbar(active)}
<script src="assets/js/site.js?v={ASSET_V}" defer></script>
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
    ("6", "על הבמה, עם סולן וסולנית"),
    ("20", "להיטים שכולם מכירים"),
    ("10", "סיבובים"),
    ("90", "דקות מופע"),
    ("APP", "אפליקציית הצבעה משלנו"),
]

NOTE_GENERAL = ("את מערכת ההצבעות אנחנו מביאים ומפעילים מהבמה. זו אפליקציה שפיתחנו בעצמנו, והיא רצה על הטלפון של הקהל. "
                "התוצאה עולה בטלפון של כל אחד מהקהל, ועל מסך המקום אם יש. בסדרות נגד סרטים יש גם מסך עם סרטוני אווירה, "
                "ואם אין מסך במקום, נכלול אותו בהצעת המחיר.")
NOTE_NO_SCREEN = ("את מערכת ההצבעות אנחנו מביאים ומפעילים מהבמה. זו אפליקציה שפיתחנו בעצמנו, והיא רצה על הטלפון של הקהל. "
                  "אין מה להתקין באולם ואין ציוד שצריך להשיג: התוצאה עולה בטלפון של כל אחד מהקהל, ועל מסך המקום אם יש.")
NOTE_SCREEN = ("את מערכת ההצבעות אנחנו מביאים ומפעילים מהבמה. זו אפליקציה שפיתחנו בעצמנו, והיא רצה על הטלפון של הקהל. "
               "על המסך רצים סרטוני אווירה מקוריים לכל שיר ותוצאות ההצבעה. אם אין מסך או מקרן במקום, נכלול אותו בהצעת המחיר.")

def mechanism_block(note=NOTE_GENERAL, head="ככה זה עובד, שלב אחר שלב",
                    sub="כל סיבוב נגמר כשהקהל מכריע, והנקודות מצטברות עד ההכרזה."):
    return f"""<div class="seam-div" aria-hidden="true"></div>
<section id="mechanism">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">המנגנון</div>
      <h2>{head}</h2>
      <p>{sub}</p>
    </div>
    <div class="mechanism">
      <div class="step reveal"><h3>הקרב נפתח</h3><p>שני הצדדים מוכרזים מהבמה, והקהל סורק קוד ונכנס לאפליקציית ההצבעה מהטלפון. בלי הורדה, בלי הרשמה.</p></div>
      <div class="step reveal"><h3>שיר מול שיר</h3><p>הלהקה מנגנת שיר של צד אחד, ומיד אחריו שיר של הצד השני. ראש בראש, בביצוע חי ונאמן למקור.</p></div>
      <div class="step reveal"><h3>הקהל מכריע</h3><p>ההצבעה פתוחה לאורך כל הסיבוב. בסופו יש ספירה לאחור של 20 שניות, והתוצאה נחשפת בזמן אמת.</p></div>
      <div class="step reveal"><h3>הכרזה ופרסים</h3><p>הניקוד המצטבר קובע את הצד המנצח, ובין המצביעים מוגרלים פרסים.</p></div>
    </div>
    <p class="center mt-32" style="color:var(--text-dim)">{note}</p>
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

ADDONS = [
    ("שטיח אדום", "וצלם פפראצי שמחכה לאורחים", "redcarpet"),
    ("עוד חצי שעה של ריקודים", "הלהקה ממשיכה לנגן להיטי רחבה אחרי ההכרזה על המנצח", "dance"),
    ("פופקורן של קולנוע", "עגלת פופקורן בכניסה, כמו בבכורה", "popcorn"),
    ("דמויות בהשראת המסך", "דמויות מקוריות שמסתובבות בין האורחים", "characters"),
    ("פסלוני זהב", "לזוכי החידון ולמצביעים המצטיינים", "awards"),
    ("חידון מונחה לפני המופע", "שאלות על המסך הגדול, וכל האולם עונה מהטלפון", "quiz"),
    ("הלוגו שלכם בפתיח", "ו״פוסטר הקרב״ עם התוצאות למחרת", "logo"),
    ("זוג שירים משלכם", "לבחירתכם מהרשימה, או סיבוב חדש שנבנה בשבילכם", "duel"),
]

ADDON_IMG_V = "1"
def addon_card(h, t, img):
    return ('<div class="addon has-img reveal"><div class="addon-img"><img src="assets/img/addons/%s.webp?v=%s" '
            'alt="%s" loading="lazy" decoding="async" width="640" height="480"></div>'
            '<div class="addon-body"><b>%s</b><span>%s</span></div></div>') % (img, ADDON_IMG_V, h, h, t)

def addons_block(head="ערב בכיכובכם", sub="להיטים מקפיצים ומרקידים שמרימים את כל האולם. רוצים יותר? בונים את הערב מתוספות שאנחנו מביאים:", cta=True, only=None, texts=None, cta_href="events.html#quote"):
    items = [a for a in ADDONS if a[0] in only] if only else ADDONS
    if only: items.sort(key=lambda a: only.index(a[0]))
    cards = "".join(addon_card(h, (texts or {}).get(h, t), i) for h, t, i in items)
    btn = (f'<div class="cta-row center mt-32"><a class="btn btn-outline" href="{cta_href}">לבניית הערב שלכם</a></div>' if cta else "")
    return f"""<section id="addons">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">תוספות</div>
      <h2>{head}</h2>
      <p>{sub}</p>
    </div>
    <div class="addons">{cards}</div>
    {btn}
  </div>
</section>"""

DUELS_SECTION = """<section id="duels">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">מהרפרטואר</div>
      <h2>ככה נראה דו־קרב</h2>
      <p>כל דו־קרב בנוי סביב נושא משותף: שיר מסדרה מול שיר מסרט. ארבע דוגמאות מתוך עשרה.</p>
    </div>
    <div class="duel-list">
      <div class="duel-row reveal">
        <div class="theme">מסיבת ריקודים</div>
        <div class="side tv"><span class="who latin">TV</span><b>Bad Romance</b><small>גוסיפ גירל</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">FILM</span><b>It's Raining Men</b><small>היומן של ברידג׳ט ג׳ונס</small></div>
      </div>
      <div class="duel-row reveal">
        <div class="theme">הריקוד</div>
        <div class="side tv"><span class="who latin">TV</span><b>Fame</b><small>תהילה</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">FILM</span><b>Stayin' Alive</b><small>קדחת מוצאי שבת</small></div>
      </div>
      <div class="duel-row reveal">
        <div class="theme">תל אביב מול תל אביב</div>
        <div class="side tv"><span class="who latin">TV</span><b>מכה אפורה</b><small>פלורנטין</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">FILM</span><b>לגור איתו</b><small>דיזנגוף 99</small></div>
      </div>
      <div class="duel-row reveal">
        <div class="theme">אני שם בשבילך</div>
        <div class="side tv"><span class="who latin">TV</span><b>I'll Be There for You</b><small>חברים</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">FILM</span><b>I'm a Believer</b><small>שרק</small></div>
      </div>
    </div>
    <p class="center mt-32" style="color:var(--text-dim)">להיטים מקפיצים ומרקידים. על המסך רצים סרטוני אווירה מקוריים לכל שיר, ובין השירים עולות תוצאות ההצבעה.</p>
  </div>
</section>"""

# ביוגרפיות הסולנים (14.11.2026). אותו נוסח בחוברות ובחבילת הפרסום.
NICOLE_PHOTO = "assets/img/nicole-rodoy.jpg"
YINON_PHOTO = "assets/img/yinon-bar-shira.jpg"
NICOLE_BIO = ("זמרת ושחקנית. מופיעה בהפקות מוזיקליות, בפרויקטים אמנותיים ובמחזות זמר "
              "(״צלילי המוזיקה״, ״LEA״, מופעי קברט ועוד). בוגרת ״המסלול לתיאטרון ומחזות זמר״ ולהקה צבאית.")
YINON_BIO = ("בוגר בית הספר רימון. זמר בצמד ״רטרו״ לקבלות פנים ובלהקת המחווה ״טופ גאנז״. "
             "יוצר מחזות הזמר ״טריפ״ ו״עשן מעל המים״, ומפיק ויוזם הקונספט של Soundclash.")
BAND_LINE = ("ולצידם על הבמה: <b>ולאד פוזיילוב</b> (גיטרה וקולות, ״הכל בגלל ג׳ני״), "
             "<b>חן ירמיצקי</b> (קלידים, הראסטיז), <b>עומר מתתיהו</b> (בס) ו<b>תומר כהן</b> (תופים, Honeybee).")

CREW = [  # עיגולי פנים מתוך צילומי תמונע (תומר: צילום שלו). שמות אומתו מול ינון, 19.11.2026
    ("vlad", "ולאד פוזיילוב", "גיטרה וקולות", "״הכל בגלל ג׳ני״"),
    ("chen", "חן ירמיצקי", "קלידים", "הראסטיז"),
    ("omer", "עומר מתתיהו", "בס", ""),
    ("tomer", "תומר כהן", "תופים", "Honeybee"),
]
def crew_html():
    return "".join(f'<li><img src="assets/img/tmuna/face-{k}.webp" alt="{n}" loading="lazy" width="400" height="400">'
                   f'<b>{n}</b><span>{r}{(" · " + x) if x else ""}</span></li>' for k, n, r, x in CREW)

def voices_block(head="הקולות של סדרות נגד סרטים", eyebrow="על הבמה", crew=True, nicole=True, note="",
                 lead=None, yinon_role="שירה", yinon_img=YINON_PHOTO, yinon_pos="center 30%"):
    """שני הסולנים של סדרות נגד סרטים, עם תמונה וביוגרפיה קצרה."""
    def card(img, alt, name, role, bio, pos="center 20%"):
        return (f'<article class="voice reveal"><img src="{img}" alt="{alt}" loading="lazy" style="object-position:{pos}">'
                f'<div class="voice-body"><h3>{name}</h3><div class="role">{role}</div><p>{bio}</p></div></article>')
    return f"""<section id="voices">
  <div class="wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">{eyebrow}</div>
      <h2>{head}</h2>
    </div>
    <div class="voices"{'' if nicole else ' style="grid-template-columns:minmax(0,420px);justify-content:center"'}>
      {card(*lead) if lead else (card(NICOLE_PHOTO, "ניקול רודוי, הסולנית של Soundclash", "ניקול רודוי", "שירה", NICOLE_BIO) if nicole else "")}
      {card(yinon_img, "ינון בר שירה שר על הבמה", "ינון בר שירה", yinon_role, YINON_BIO, pos=yinon_pos)}
    </div>
    {('<p class="center mt-32" style="color:var(--text-dim)">' + note + '</p>') if note else ''}
    {('<div class="crew reveal"><div class="crew-label">ולצידם על הבמה</div><ul class="crew-list">' + crew_html() + '</ul></div>') if crew else ''}
  </div>
</section>"""

REUT_90 = "רעות זורמן – שירה וגיטרה חשמלית"
NICOLE_TV = "ניקול רודוי – שירה"
SINGER_ONLY = "סולנית – שירה"
# בסדרות נגד סרטים ינון רק שר, בלי גיטרה אקוסטית (ינון, 14.11.2026)
YINON_ACOUSTIC = "ינון בר שירה – שירה וגיטרה אקוסטית"
YINON_VOCALS = "ינון בר שירה – שירה"
SINGER_GENERAL = "ניקול רודוי – שירה (סדרות נגד סרטים) | רעות זורמן – שירה וגיטרה חשמלית (ניינטיז)"

REQ_GENERAL = "מערכת הגברה עם איש סאונד, ותאורה סטנדרטית לאולם, ובסדרות נגד סרטים גם מסך או מקרן. אין במקום? נביא הגברה, תאורה, מסך ואיש סאונד משלנו, בתוספת תשלום"
REQ_NO_SCREEN = "מערכת הגברה עם איש סאונד, ותאורה סטנדרטית לאולם. אין במקום? נביא הגברה, תאורה ואיש סאונד משלנו, בתוספת תשלום. מסך לא צריך: התוצאה עולה בטלפונים של הקהל"
REQ_SCREEN = "מערכת הגברה עם איש סאונד, ותאורה סטנדרטית לאולם, ומסך או מקרן לסרטוני האווירה ולתוצאות. אין במקום? נביא את מה שחסר, כולל איש סאונד משלנו, בתוספת תשלום"

DEFAULT_SPEC = [
    ("הרכב", "ינון בר שירה – שירה וגיטרה אקוסטית | " + SINGER_GENERAL + " | "
             "ולאד פוזיילוב – גיטרה מובילה וקולות | חן ירמיצקי – קלידים | "
             "עומר מתתיהו – בס | תומר כהן – תופים"),
    ("אורך המופע", "כ-90 דקות. ניתן לקצר או להאריך לפי מבנה הערב"),
    ("מבנה", "סיבובי קרב, שיר מול שיר, עם הצבעת קהל בסוף כל סיבוב"),
    ("מה אנחנו מביאים", "את אפליקציית ההצבעה ואת ההפעלה שלה מול הקהל"),
    ("מה נדרש במקום", REQ_GENERAL),
    ("זמינות פורמט", "מופע הניינטיז זמין מיידית. שאר המופעים זמינים להזמנה בתיאום מראש"),
    ("קהל", "מועדונים ובמות, אירועי חברה, מחלקות תרבות ומתנ״סים, פסטיבלים ואירועים פרטיים"),
    ("שפה", "המופע מוגש בעברית, הרפרטואר בשפת המקור"),
]

def video_section(vids, head="צפו בקרב מקרוב", eyebrow="בפעולה", sub="", limit=3):
    cards = "".join(f"""<article class="video-card reveal">
        <div class="video-thumb">{yt_lite(vid, t)}</div>
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
        '<figure class="reveal"><img src="%s" srcset="%s 800w, %s 1600w" sizes="(max-width:700px) 50vw, 400px" data-full="%s" alt="%s" loading="lazy" width="800" height="%d"></figure>' % (img(u,800), img(u,800), img(u), img(u), html.escape(a), 1200 if c else 533)
        for u, a, c in imgs)
    more = ('<div class="cta-row center mt-32"><a class="btn btn-outline" href="gallery.html">לגלריה המלאה</a></div>'
            if link_more else "")
    return f"""<section id="gallery">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">{eyebrow}</div><h2>{head}</h2></div>
    <div class="gallery masonry">{figs}</div>
    <p class="photo-credit">{PHOTO_CREDIT}</p>
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
    for f in PUBLIC_FORMATS:
        status_cls = "status" if (f["live"] or f.get("hot")) else "status neutral"
        cards += f"""<a class="format-card {f['css']} reveal" href="{f['file']}">
      <div class="{status_cls}">{f['tag']}</div>
      {('<img class="card-logo" src="' + f['logo'] + '" alt="' + f['logo_alt'] + '" loading="lazy" width="300" height="360">') if f.get('logo') else ('<div class="era latin">' + f['era'] + '</div>')}
      <h3>{f['name_html']}</h3>
      <p class="fc-for">{f.get('occasion', '')}</p>
      <p>{f['short']}</p>
      <p class="fc-status">{f.get('status', '')}</p>
      <span class="go">לדף המופע ←</span>
    </a>"""
    return f"""<section id="formats">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">המופעים</div>
      <h2>בחרו את המופע שלכם</h2>
      <p>אותו מנגנון בכל מופע: שיר מול שיר, והקהל מכריע מהטלפון. בוחרים לפי האירוע והקהל.</p>
    </div>
    <div class="formats-grid">{cards}</div>
  </div>
</section>"""


# ============================================================================
#  5ב. הופעות: שורות, יומן, סימון לגוגל
# ============================================================================
T = "assets/img/tmuna/"   # צילומי ההופעה בתמונע (19.11.2026), <id>-800.webp / <id>-1600.webp
SHOW_PHOTOS_A = ["09307", "09347", "09303", "09350"]   # תאורה אדומה, לשורות בצד האדום
SHOW_PHOTOS_B = ["09274", "09260", "09283", "09250"]   # תאורה כחולה, לשורות בצד הכחול
HE_DAYS = ["יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת", "יום ראשון"]  # לפי weekday() של פייתון

def load_shows(upcoming=True):
    """הופעות מ-shows.json, ממוינות לפי תאריך, עם שם קובץ יומן קבוע לכל אחת."""
    import json as _j
    allshows = _j.load(open("shows.json", encoding="utf-8")).get("shows", [])
    seen = {}
    for x in allshows:                     # אותו כלל שמות כמו ב-site.js
        n = seen.get(x["date"], 0) + 1; seen[x["date"]] = n
        x["_cal"] = "cal/%s%s.ics" % (x["date"], "" if n == 1 else "-%d" % n)
    today = datetime.date.today().isoformat()
    out = [x for x in allshows if (x.get("date", "") >= today or not upcoming)]
    return sorted(out, key=lambda x: (x["date"], x.get("time", "")))

def show_start(x):
    """תאריך ושעה בשעון ישראל, כאובייקט עם אזור זמן."""
    from zoneinfo import ZoneInfo
    hh, mm = (int(v) for v in (x.get("time") or "21:00").split(":"))
    y, m, d = (int(v) for v in x["date"].split("-"))
    return datetime.datetime(y, m, d, hh, mm, tzinfo=ZoneInfo("Asia/Jerusalem"))

def fmt_short(x):
    return (x.get("format") or "Soundclash").replace("Soundclash", "").strip() or "Soundclash"

def show_wa(x):
    y, m, d = (int(v) for v in x["date"].split("-"))
    return wa_link("היי, אשמח לשריין מקום להופעה של Soundclash ב%s%s ב-%d.%d." % (x["venue"], (", " + x["city"]) if x.get("city") else "", d, m))

def show_waze(x):
    from urllib.parse import quote
    q = x.get("address") or (x["venue"] + " " + x.get("city", ""))
    return "https://waze.com/ul?q=%s&navigate=yes" % quote(q.strip())

MARK_MIC = '<path d="M50 12a14 14 0 0114 14v22a14 14 0 01-28 0V26a14 14 0 0114-14zM28 46a22 22 0 0044 0M50 68v16M38 86h24"/>'
MARK_VOTE = '<rect x="30" y="8" width="40" height="84" rx="8"/><path d="M40 70V58M50 70V40M60 70V50"/>'

def show_rows(shows, prefix=""):
    """שורות ההופעות בסגנון לוח האירועים של nbshira.com. אותה תבנית בדיוק נבנית גם ב-site.js."""
    e = html.escape
    rows = []
    for i, x in enumerate(shows):
        y, m, d = (int(v) for v in x["date"].split("-"))
        wd = HE_DAYS[datetime.date(y, m, d).weekday()]
        side = "a" if i % 2 == 0 else "b"
        pool = SHOW_PHOTOS_A if side == "a" else SHOW_PHOTOS_B
        photo = T + pool[(i // 2) % len(pool)]
        info = " · ".join(e(v) for v in (x.get("note"), x.get("address")) if v)
        main = (f'<a class="btn btn-solid" href="{e(x["tickets"])}" target="_blank" rel="noopener">כרטיסים</a>' if x.get("tickets")
                else f'<a class="btn btn-wa" href="{e(show_wa(x))}" target="_blank" rel="noopener">{ICON["wa"]} שריון מקום בוואטסאפ</a>')
        rows.append(f"""<article class="sx-row">
  <div class="sx-date side-{side}">
    <svg class="sx-mark" aria-hidden="true" viewBox="0 0 100 100">{MARK_MIC if side == "a" else MARK_VOTE}</svg>
    <div><div class="d1">{wd}{(' · <bdi dir="ltr">' + e(x["time"]) + '</bdi>') if x.get("time") else ''}</div>
      <div class="d2"><bdi dir="ltr">{d}.{m}.{y}</bdi></div></div>
    <div><div class="k">{e(fmt_short(x))}</div><div class="pl">{e(x.get("city", ""))}</div></div>
  </div>
  <div class="sx-photo"><img src="{prefix}{img(photo, 800)}" alt="" loading="lazy" width="800" height="533"></div>
  <div class="sx-title">
    <b>{e(x["venue"])}</b>
    {('<span>' + info + '</span>') if info else ''}
    <div class="sx-acts">{main}<a class="btn btn-ghost" href="{prefix}{x["_cal"]}">ליומן</a><a class="btn btn-ghost" href="{e(show_waze(x))}" target="_blank" rel="noopener">Waze</a></div>
  </div>
</article>""")
    return "\n".join(rows)

def static_shows(limit=None):
    """הגרסה הסטטית, כדי שהדף לא ייראה ריק לפני שה-JS נטען. site.js מחליף אותה בגרסה עדכנית."""
    shows = load_shows()
    if not shows:
        return '<div class="empty-state">אין כרגע תאריכים פתוחים לקהל הרחב.</div>'
    return show_rows(shows[:limit] if limit else shows)

def write_calendars():
    """קובץ יומן (ics) לכל הופעה קרובה, בתיקייה cal/. נוצר מחדש בכל בנייה."""
    os.makedirs(os.path.join(OUT, "cal"), exist_ok=True)
    for x in load_shows():
        st = show_start(x).astimezone(datetime.timezone.utc)
        en = st + datetime.timedelta(hours=2)
        loc = ", ".join(v for v in (x["venue"], x.get("address") or x.get("city", "")) if v)
        desc = " · ".join(v for v in (x.get("format"), x.get("note"), ("כרטיסים: " + x["tickets"]) if x.get("tickets") else "", SITE_URL + "/shows.html") if v)
        esc_ics = lambda t: t.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")
        ics = "\r\n".join([
            "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Soundclash//shows//HE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            "UID:%s@soundclash.co.il" % x["_cal"].replace("cal/", "").replace(".ics", ""),
            "DTSTAMP:" + x["date"].replace("-", "") + "T000000Z",   # קבוע, כדי שהקובץ לא ישתנה בכל בנייה
            "DTSTART:" + st.strftime("%Y%m%dT%H%M%SZ"),
            "DTEND:" + en.strftime("%Y%m%dT%H%M%SZ"),
            "SUMMARY:" + esc_ics("Soundclash ב%s" % x["venue"]),
            "LOCATION:" + esc_ics(loc),
            "DESCRIPTION:" + esc_ics(desc),
            "URL:" + (x.get("tickets") or SITE_URL + "/shows.html"),
            "END:VEVENT", "END:VCALENDAR", ""])
        with open(os.path.join(OUT, x["_cal"]), "w", encoding="utf-8", newline="") as fh:
            fh.write(ics)

def shows_jsonld():
    """סימון Event של גוגל לכל הופעה קרובה, כדי שההופעות יוכלו להופיע בחיפוש."""
    import json as _j
    evs = []
    for x in load_shows():
        ev = {"@context": "https://schema.org", "@type": "MusicEvent",
              "name": "Soundclash %s ב%s" % (fmt_short(x), x["venue"]),
              "startDate": show_start(x).isoformat(),
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {"@type": "Place", "name": x["venue"],
                           "address": {"@type": "PostalAddress", "streetAddress": x.get("address", ""),
                                       "addressLocality": x.get("city", ""), "addressCountry": "IL"}},
              "image": [OG["shows"]],
              "description": "מופע קרב מוזיקלי חי: שיר מול שיר, והקהל מכריע מהטלפון.",
              "performer": {"@type": "MusicGroup", "name": "Soundclash", "url": SITE_URL},
              "organizer": {"@type": "Organization", "name": "Soundclash", "url": SITE_URL},
              "url": SITE_URL + "/shows.html"}
        if x.get("tickets"):
            ev["offers"] = {"@type": "Offer", "url": x["tickets"], "availability": "https://schema.org/InStock"}
        evs.append(ev)
    return ('<script type="application/ld+json">%s</script>' % _j.dumps(evs, ensure_ascii=False)) if evs else ""

STRIP = [("09363", "הסולנית עם הגיטרה החשמלית"), ("09224", "ינון בר שירה עם האקוסטית"),
         ("09381", "הגיטריסט והקלידן"), ("09296", "שירה מול הדגל הבריטי")]
def shows_strip():
    pics = "".join(f'<div><img src="{img(T + i, 800)}" alt="{a}" loading="lazy" width="800" height="1200"></div>' for i, a in STRIP)
    return f'<div class="sx-rule"><span>מהבמה · תמונע, תל אביב</span><i></i></div><div class="sx-strip">{pics}</div><p class="photo-credit">{PHOTO_CREDIT}</p>'

write_calendars()

# ============================================================================
#  6. דף הבית
# ============================================================================
AUDIENCE = [
    ("מועדונים ובמות",
     "ערב עם מתח מהשיר הראשון ועד ההכרזה. הקהל נכנס לאפליקציה כבר בשיר הראשון ונשאר בה עד הסוף, וזה בדיוק הזמן שבו הוא עומד מול הבר. הרפרטואר בנוי מלהיטים שהאולם מזהה מהתו הראשון."),
    ("מחלקות תרבות ומתנ״סים",
     "ערב תרבות נוצץ לקהל בני 30 ו-40 פלוס: הלהיטים שגדלו עליהם, עם גלאם וכוריאוגרפיה, ובלי צורך בהיכרות מוקדמת עם הלהקה. ההצבעה מייצרת השתתפות פעילה של כל האולם, גם של מי שבא רק בשביל לצאת לערב טוב."),
    ("אירועי חברה",
     "המבנה התחרותי עובד מצוין מול קבוצות: כל העובדים מצביעים מהטלפון, והתוצאות עולות על מסך האולם. ההרכב מאפשר התאמה לגודל האירוע, לכמות האורחים ולמשך הערב."),
    ("פסטיבלים ואירועי עיר",
     "קל להסביר בשורה אחת בתוכנייה, ובסוף הערב יש לרשות מספר אמיתי: כמה תושבים הצביעו. ושלושת המופעים מאפשרים להחזיר את אותו קונספט בשנה הבאה, עם עשור אחר."),
]

def audience_block():
    cards = "".join(
        '<div class="aud-card reveal"><h3>%s</h3><p>%s</p></div>' % (h, p) for h, p in AUDIENCE)
    return f"""<section id="audience">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">למי זה מתאים</div>
      <h2>למה זה עובד אצלכם</h2>
      <p>אותו מופע, ארבעה סוגי אירוע. מה שמשתנה הוא מה שהמנגנון עושה בשבילכם.</p>
    </div>
    <div class="audience">{cards}</div>
  </div>
</section>"""

HOME_JSONLD = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"MusicGroup","name":"Soundclash","alternateName":"סאונדקלאש",
"url":"%s","genre":["Live Music","Pop","Interactive Show"],"description":"מופע קרב מוזיקלי חי שבו הקהל מצביע ומכריע בין שני צדדים.",
"image":"%s","email":"%s","telephone":"+972-54-6738192",
"address":{"@type":"PostalAddress","addressCountry":"IL"}}
</script>""" % (SITE_URL, OG["home"], EMAIL)

CROWD_MP4 = "assets/video/crowd-wonderbar.mp4?v=1"
CROWD_POSTER = "assets/video/crowd-wonderbar.jpg?v=1"
VOTE_MP4 = "assets/video/vote-proof.mp4?v=1"     # 28 שניות: במה, הצבעה בטלפון, תוצאה, קהל (21.11.2026)
VOTE_POSTER = "assets/video/vote-proof.jpg?v=1"
TVVOTE_MP4 = "assets/video/tvfilm-vote.mp4?v=9"   # 47 שניות: האפליקציה של סדרות נגד סרטים, הבמה והקהל (21.11.2026)
TVVOTE_POSTER = "assets/video/tvfilm-vote.jpg?v=1"
def crowd_clip(src=None, poster=None, label="הקהל בוונדרבר, חיפה, ידיים וטלפונים באוויר"):
    """20 שניות מצילום טלפון בתוך הקהל, וונדרבר 5.9.2026. מתנגן בלי קול כשהוא על המסך.
    עם src אחר: אותו נגן לסרטון אנכי אחר (למשל סרטון ההצבעה)."""
    return f"""<figure class="demo-video crowd-clip">
      <video src="{src or CROWD_MP4}" poster="{poster or CROWD_POSTER}" muted loop playsinline preload="none" data-autoplay-visible
        aria-label="{label}"></video>
      <button type="button" class="demo-sound" aria-pressed="false" aria-label="הפעלת סאונד">
        <span class="on">🔊 עם סאונד</span><span class="off">🔇 בלי סאונד</span></button>
      <button type="button" class="demo-full" aria-label="צפייה במסך מלא, עם סאונד">⛶</button>
    </figure>"""

def crowd_card(head="וונדרבר, חיפה", text="20 שניות מתוך ההופעה בספטמבר, מצולמות בטלפון מתוך הקהל. שיר מול שיר, הידיים באוויר, ובסוף כל סיבוב כולם מצביעים.",
               eyebrow="ככה זה נראה מהקהל", wrap=False, clip=None):
    """כרטיס עם סרטון הקהל מוונדרבר ומלל לידו. wrap=True עוטף אותו במקטע משלו."""
    card = f"""<div class="sx-crowd reveal">
      {clip or crowd_clip()}
      <div>
        <div class="eyebrow">{eyebrow}</div>
        <h2>{head}</h2>
        <p>{text}</p>
      </div>
    </div>"""
    return f'<section class="crowd-sec"><div class="wrap">{card}</div></section>' if wrap else card

def vote_card(text, head="הקהל מכריע מהטלפון", eyebrow="ככה מצביעים", wrap=False):
    """סרטון ההצבעה: הבמה שואלת, הקהל מצביע בטלפון, התוצאה עולה והאולם מגיב."""
    return crowd_card(head=head, text=text, eyebrow=eyebrow, wrap=wrap,
        clip=crowd_clip(VOTE_MP4, VOTE_POSTER, "הלהקה שואלת מי תעדיפו, הקהל מצביע בטלפון, התוצאה עולה והאולם מגיב"))

def tvfilm_vote_card(text, head="מהכניסה ועד ההכרעה", eyebrow="ככה זה עובד בסדרות נגד סרטים", wrap=False):
    """סרטון ההדגמה של סדרות נגד סרטים: האפליקציה בפעולה, מחוברת לבמה ולקהל. בא לפני הזוג, לא במקומו."""
    return crowd_card(head=head, text=text, eyebrow=eyebrow, wrap=wrap,
        clip=crowd_clip(TVVOTE_MP4, TVVOTE_POSTER, "הדגמה: סורקים QR, הסרטונים על המסך, אימוג׳ים, הצבעה בטלפון וההכרעה, עם הלהקה והקהל"))

def proof_pair(text, head="ככה נראה ערב של Soundclash", eyebrow="מהקהל", wrap=False):
    """שני הסרטונים זה לצד זה: הקהל המתלהב מוונדרבר, וסרטון ההצבעה. לא אחד במקום השני (ינון, 21.11.2026)."""
    clips = f"""<div class="pair-clips">
        <div>{crowd_clip()}<small>הקהל בוונדרבר</small></div>
        <div>{crowd_clip(TVVOTE_MP4, TVVOTE_POSTER, "הדגמה: סורקים QR, הסרטונים על המסך, אימוג׳ים, הצבעה בטלפון וההכרעה, עם הלהקה והקהל")}<small>ככה זה עובד</small></div>
      </div>"""
    card = f"""<div class="sx-crowd sx-pair reveal">
      {clips}
      <div>
        <div class="eyebrow">{eyebrow}</div>
        <h2>{head}</h2>
        <p>{text}</p>
      </div>
    </div>"""
    return f'<section class="crowd-sec"><div class="wrap">{card}</div></section>' if wrap else card

IL_VOTE_MP4 = "assets/video/israeli-vote.mp4?v=3"   # 47 שניות: האפליקציה של המסיבה הישראלית בטלפון, הבמה והקהל (24.11.2026)
IL_VOTE_POSTER = "assets/video/israeli-vote.jpg?v=1"
def il_proof_pair(text, head="ככה נראה ערב של Soundclash", eyebrow="מהקהל", wrap=False):
    """כמו proof_pair, עם סרטון האפליקציה של המסיבה הישראלית (בלי מסך, הכול בטלפון)."""
    clips = f"""<div class="pair-clips">
        <div>{crowd_clip()}<small>הקהל בוונדרבר</small></div>
        <div>{crowd_clip(IL_VOTE_MP4, IL_VOTE_POSTER, "הדגמה: נכנסים מהטלפון, עובדה על כל שיר, אימוג׳ים, הצבעה וההכרעה, עם הלהקה והקהל")}<small>ככה זה עובד</small></div>
      </div>"""
    card = f"""<div class="sx-crowd sx-pair reveal">
      {clips}
      <div>
        <div class="eyebrow">{eyebrow}</div>
        <h2>{head}</h2>
        <p>{text}</p>
        <figure class="ps-quote" style="margin-top:22px">
          <blockquote>״החבר׳ה אצלנו עפו עליכם. קיבלתם פירגון עד השמיים.״</blockquote>
          <figcaption>שחר הרוש · קהילת אלפא, אלפי מנשה · כ-200 משתתפים, בהופעת הניינטיז</figcaption>
        </figure>
      </div>
    </div>"""
    return f'<section class="crowd-sec"><div class="wrap">{card}</div></section>' if wrap else card

IL_PHONES = [("il-phone-fact", "💡 על כל שיר", "מי כתב, ואיך זה קרה"),
             ("il-phone-vote", "🗳 הצבעה", "לחיצה אחת, ואפשר להחליף עד הרגע האחרון"),
             ("il-phone-result", "🏆 הכרעה", "התוצאה והאימוג׳ים של כל שיר")]
def il_phones_section():
    """במקום מסך: מה הקהל רואה בטלפון. צילומי מסך אמיתיים מהאפליקציה (24.11.2026)."""
    items = "".join(f'<figure class="svid reveal"><img src="assets/img/{f}.webp?v=1" alt="{h}: {t}" loading="lazy" width="390" height="844" '
                    f'style="width:100%;height:auto;border-radius:22px;border:1px solid rgba(255,255,255,.12)">'
                    f'<figcaption><b>{h}</b> {t}</figcaption></figure>' for f, h, t in IL_PHONES)
    return f"""<section id="on-phone">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">בטלפון</div>
      <h2>כל האולם מחובר</h2>
      <p>בלי מסך ובלי להוריד אפליקציה: סורקים QR, ובטלפון של כל אחד יש עובדה על כל שיר, אימוג׳ים בזמן השירים, הצבעה ותוצאה.</p>
    </div>
    <div class="svids">{items}</div>
    <p class="swipe-hint" style="text-align:center;color:var(--text-dim);font-size:14px;margin-top:6px">החליקו הצידה לעוד מסכים ←</p>
    <style>@media (min-width:821px){{.swipe-hint{{display:none}}}}</style>
  </div>
</section>"""

# תוספות שמתאימות למסיבה הישראלית (בלי פופקורן של קולנוע ודמויות מהמסך)
IL_ADDONS = ["עוד חצי שעה של ריקודים", "שטיח אדום", "חידון מונחה לפני המופע", "פסלוני זהב", "הלוגו שלכם בפתיח", "זוג שירים משלכם"]
IL_ADDON_TEXT = {"עוד חצי שעה של ריקודים": "הלהקה ממשיכה לנגן להיטי רחבה ישראליים אחרי ההכרזה על המנצח",
                 "חידון מונחה לפני המופע": "שאלות על הלהיטים הישראליים, וכל האולם עונה מהטלפון"}

def il_packages_section():
    """שלוש החבילות, כמו באירועי החברה, בנוסח של המסיבה הישראלית (בלי מסך כברירת מחדל). ינון, 24.11.2026."""
    return """<section id="packages">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">חבילות</div>
      <h2>שלוש דרכים להזמין</h2>
      <p>ההצעה נבנית לפי המקום, גודל הקהל והתוספות שתבחרו. ספרו לנו על האירוע ונחזור אליכם עם הצעת מחיר.</p>
    </div>
    <div class="packages">
      <article class="pkg reveal">
        <div class="pkg-tag latin">SET</div>
        <h3>גרסה של 45 דקות</h3>
        <p class="pkg-for">להרמת כוסית, כנס, או ערב עם תוכנית נוספת</p>
        <ul>
          <li>כ-45 דקות</li>
          <li>5 סיבובים</li>
          <li>הצבעה חיה ותוצאה בכל טלפון</li>
          <li>הכרזת מנצח</li>
        </ul>
      </article>
      <article class="pkg reveal">
        <div class="pkg-tag latin">FULL SHOW</div>
        <h3>המופע המלא</h3>
        <p class="pkg-for">חנוכה, ערב קהילה, במת חוץ או מסיבת חברה שהמופע הוא הלב שלה</p>
        <ul>
          <li>כ-90 דקות</li>
          <li>10 סיבובים</li>
          <li>הצבעה חיה ותוצאה בכל טלפון</li>
          <li>הגרלת פרסים בין המצביעים</li>
          <li>להיטים ישראליים מקפיצים ומרקידים</li>
          <li><b>מתנת השקה:</b> דו־קרב לבחירתכם. אתם בוחרים שני שירים, כל שיר שתרצו, והקהל מכריע</li>
        </ul>
        <div class="pkg-up"><b>אפשר להוסיף: חצי שעת מסיבה</b><span>בתוספת תשלום. אחרי ההכרזה על המנצח הלהקה לא יורדת מהבמה: עוד 30 דקות של להיטי רחבה ישראליים, בלי הצבעות, רק לרקוד. בלילה של כוכבים היא כבר כלולה.</span></div>
      </article>
      <article class="pkg pkg-star reveal">
        <div class="pkg-tag latin">A NIGHT OF STARS</div>
        <h3>לילה של כוכבים</h3>
        <p class="pkg-for"><b>הקהל שלכם הם הכוכבים.</b> לאירוע השנתי, לערב הוקרה או לחגיגה שרוצים שתיזכר</p>
        <ul>
          <li>המופע המלא, ואחריו חצי שעת מסיבה</li>
          <li>5 תוספות לבחירתכם: שטיח אדום וצלם, פסלוני זהב, חידון על הלהיטים הישראליים, דו־קרב לבחירתכם ועוד</li>
          <li><b>20% הנחה</b> על התוספות וגם על חצי שעת המסיבה</li>
          <li>חידון לפני המופע והלוגו שלכם בפתיח, במתנה</li>
        </ul>
      </article>
    </div>
    <p class="center mt-32" style="color:var(--text-dim)"><b>רוצים את זה גם על מסך גדול?</b> המופע עובד מצוין בלי מסך, והתוצאה עולה בטלפונים. אם יש מסך או מקרן, נוסיף סרטון אווירה מקורי לכל שיר, ואת ההצבעה והתוצאות על המסך הגדול.</p>
    <div class="cta-row center mt-32"><a class="btn btn-solid" href="contact.html">לקבלת הצעת מחיר</a></div>
  </div>
</section>"""

def nineties_packages_section():
    """שלוש החבילות, כמו במסיבה הישראלית, בנוסח של הניינטיז (ינון, 24.11.2026: חבילות וגרסה של 45 דקות)."""
    return """<section id="packages">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">חבילות</div>
      <h2>שלוש דרכים להזמין</h2>
      <p>ההצעה נבנית לפי המקום, גודל הקהל והתוספות שתבחרו. ספרו לנו על האירוע ונחזור אליכם עם הצעת מחיר.</p>
    </div>
    <div class="packages">
      <article class="pkg reveal">
        <div class="pkg-tag latin">SET</div>
        <h3>גרסה של 45 דקות</h3>
        <p class="pkg-for">להרמת כוסית, לכנס, או לערב עם תוכנית נוספת</p>
        <ul>
          <li>כ-45 דקות</li>
          <li>5 סיבובים</li>
          <li>הצבעה חיה ותוצאה בכל טלפון</li>
          <li>הכרזת מנצח</li>
        </ul>
      </article>
      <article class="pkg reveal">
        <div class="pkg-tag latin">FULL SHOW</div>
        <h3>המופע המלא</h3>
        <p class="pkg-for">ערב צוות, מסיבת חברה, ערב קהילה או מועדון, כשהמופע הוא הלב של הערב</p>
        <ul>
          <li>כ-90 דקות</li>
          <li>9 סיבובים</li>
          <li>הצבעה חיה ותוצאה בכל טלפון</li>
          <li>הגרלת פרסים בין המצביעים</li>
          <li>להיטי הניינטיז שכולם מכירים</li>
        </ul>
        <div class="pkg-up"><b>אפשר להוסיף: חצי שעת מסיבה</b><span>בתוספת תשלום. אחרי ההכרזה על המנצח הלהקה לא יורדת מהבמה: עוד 30 דקות של להיטי ניינטיז לרחבה, בלי הצבעות, רק לרקוד. בלילה של כוכבים היא כבר כלולה.</span></div>
      </article>
      <article class="pkg pkg-star reveal">
        <div class="pkg-tag latin">A NIGHT OF STARS</div>
        <h3>לילה של כוכבים</h3>
        <p class="pkg-for"><b>הקהל שלכם הם הכוכבים.</b> לאירוע השנתי, לערב הוקרה או לחגיגה שרוצים שתיזכר</p>
        <ul>
          <li>המופע המלא, ואחריו חצי שעת מסיבה</li>
          <li>5 תוספות לבחירתכם: שטיח אדום וצלם, פסלוני זהב, חידון על הניינטיז, דו־קרב לבחירתכם ועוד</li>
          <li><b>20% הנחה</b> על התוספות וגם על חצי שעת המסיבה</li>
          <li>חידון לפני המופע והלוגו שלכם בפתיח, במתנה</li>
        </ul>
      </article>
    </div>
    <p class="center mt-32" style="color:var(--text-dim)"><b>רוצים את זה גם על מסך גדול?</b> המופע עובד מצוין בלי מסך, והתוצאה עולה בטלפונים. אם יש מסך או מקרן, נוסיף סרטון אווירה מקורי לכל שיר, ואת ההצבעה והתוצאות על המסך הגדול.</p>
    <div class="cta-row center mt-32"><a class="btn btn-solid" href="contact.html">לקבלת הצעת מחיר</a></div>
  </div>
</section>"""

def nineties_faq_section():
    """שאלות נפוצות לניינטיז (קונים מדומים, 24.11.2026)."""
    qa = [
        ("צריך מסך?", "לא. כל אחד בקהל רואה את ההצבעה והתוצאה בטלפון שלו. אם יש במקום מסך או מקרן, נוסיף סרטון אווירה מקורי לכל שיר ואת התוצאות על המסך הגדול. זו תוספת שמשדרגת את הערב, לא תנאי."),
        ("מה קורה אם הקליטה חלשה?", "ההצבעה עובדת בכל טלפון עם קליטה בסיסית או עם ה-Wi-Fi של המקום. ואם הקליטה בכל זאת נופלת, הקרב ממשיך: הקהל מצביע בדגלונים בצבעי שני הצדדים, וההכרעה מוכרזת מהבמה."),
        ("צריך להוריד אפליקציה?", "לא. סורקים קוד ומצביעים מהדפדפן בטלפון, בלי הורדה ובלי הרשמה."),
        ("איזה מידע נאסף מהקהל?", "כמעט כלום. מי שרוצה כותב שם פרטי או כינוי, וכל מצביע מקבל מספר כרטיס אקראי. לא מבקשים טלפון, מייל או פרטים מזהים."),
        ("יש לנו עובדים שלא מדברים עברית", "השירים באנגלית ומוכרים בכל העולם, וההנחיה מהבמה יכולה להיות גם באנגלית, לפי בקשה. ספרו לנו כשאתם פונים."),
        ("אפשר לקצר את המופע או לשלב אותו בערב עם תוכנית נוספת?", "כן. יש גרסה של 45 דקות, ואת המופע המלא, כ-90 דקות, אפשר לחלק לשני חלקים סביב נאומים, ארוחה או טקס."),
        ("אפשר לראות את המופע לפני שמזמינים?", "כן. הניינטיז עולה על הבמות במועדונים, ואפשר לבוא לאחת ההופעות הקרובות. כל התאריכים ב<a class=\"inline\" href=\"shows.html\">לוח ההופעות</a>."),
    ]
    items = "".join(f'<details class="reveal"><summary>{q}</summary><p>{a}</p></details>' for q, a in qa)
    return f"""<section id="faq">
  <div class="wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">שאלות נפוצות</div>
      <h2>מה צריך לדעת לפני שסוגרים</h2>
    </div>
    <div class="faq">{items}</div>
  </div>
</section>"""

def il_faq_section():
    qa = [
        ("צריך מסך?", "לא. כל אחד בקהל רואה את ההצבעה והתוצאה בטלפון שלו. אם יש במקום מסך או מקרן, נוסיף סרטון אווירה מקורי לכל שיר ואת התוצאות על המסך הגדול. זו תוספת שמשדרגת את הערב, לא תנאי."),
        ("מה קורה אם הקליטה חלשה?", "ההצבעה עובדת בכל טלפון עם קליטה בסיסית או עם ה-Wi-Fi של המקום. ואם הקליטה בכל זאת נופלת, הקרב ממשיך: הקהל מצביע בדגלונים בצבעי שני הצדדים, וההכרעה מוכרזת מהבמה. כך גם מי שבלי טלפון יודע מי ניצח."),
        ("צריך להוריד אפליקציה?", "לא. סורקים קוד ומצביעים מהדפדפן בטלפון, בלי הורדה ובלי הרשמה."),
        ("איזה מידע נאסף מהקהל?", "כמעט כלום. מי שרוצה כותב שם פרטי או כינוי, וכל מצביע מקבל מספר כרטיס אקראי. ההגרלה נעשית לפי מספר הכרטיס, והזוכה מראה את המסך שלו ללהקה. לא מבקשים טלפון, מייל או פרטים מזהים."),
        ("זה מתאים לבמת חוץ ולאירוע גדול?", "כן. המופע עובד באולם, בפארק ובבמה שכונתית, ואין צורך במסך. בהגברה, בתאורה ובאיש הסאונד אנחנו מתאימים את עצמנו למה שיש במקום, ואם חסר משהו, נביא."),
        ("אפשר לשלב את המופע בתוך ערב עם נאומים, ארוחה או טקס?", "כן. הגרסה של 45 דקות נבנתה בדיוק בשביל זה, ואת המופע המלא אפשר לחלק לשני חלקים סביב התוכנית שלכם."),
        ("יש לנו קהל שלא מדבר עברית", "המסיבה הישראלית כולה בעברית, והיא בנויה לקהל ישראלי. לצוות מעורב מתאים יותר <a class=\"inline\" href=\"tv-vs-film.html\">סדרות נגד סרטים</a>, שרוב השירים בו באנגלית, ויש לנו גם <a class=\"inline\" href=\"en.html\" lang=\"en\" dir=\"ltr\">עמוד באנגלית</a>."),
        ("המופע כבר עלה מול קהל?", "הלהקה, האפליקציה והמנגנון כבר עולים על הבמות במופע הניינטיז, ומשם צילומי הקהל בעמוד. המסיבה הישראלית בנויה על אותה להקה ואותה אפליקציה, עם סטליסט ישראלי."),
    ]
    items = "".join(f'<details class="reveal"><summary>{q}</summary><p>{a}</p></details>' for q, a in qa)
    return f"""<section id="faq">
  <div class="wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">שאלות נפוצות</div>
      <h2>מה צריך לדעת לפני שסוגרים</h2>
    </div>
    <div class="faq">{items}</div>
  </div>
</section>"""

# ======== הניינטיז: אותו מבנה כמו סדרות נגד סרטים והמסיבה הישראלית (ינון, 24.11.2026) ========
NINETIES_STATS = [
    ("6", "על הבמה, עם סולן וסולנית"),
    ("18", "להיטים שכולם מכירים"),
    ("9", "סיבובים"),
    ("90", "דקות מופע"),
    ("APP", "אפליקציית הצבעה משלנו"),
]
REUT_PHOTO = "assets/img/tmuna/09363-800.webp"
REUT_BIO = "זמרת וגיטריסטית יוצרת. מנגנת גיטרה ב״הכל בגלל ג׳ני״, ומוציאה את האלבום השני שלה כזמרת יוצרת."
REUT_CARD = (REUT_PHOTO, "רעות זורמן שרה ומנגנת על הבמה", "רעות זורמן", "שירה וגיטרה חשמלית", REUT_BIO, "center 25%")
YINON_90_PHOTO = "assets/img/tmuna/09296-800.webp"

def _nd_row(theme, a, aa, b, bb):
    return f"""      <div class="duel-row reveal">
        <div class="theme">{theme}</div>
        <div class="side tv"><span class="who latin">USA</span><b dir="ltr">{a}</b><small>{aa}</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">UK</span><b dir="ltr">{b}</b><small>{bb}</small></div>
      </div>"""
# ארבעה סיבובים מתוך live/assets/shows/nineties.js
NINETIES_DUELS_SECTION = f"""<section id="duels">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">מהרפרטואר</div>
      <h2>ככה נראה סיבוב</h2>
      <p>בכל סיבוב שיר של להקה אמריקאית מול שיר של להקה בריטית, סביב נושא משותף. ארבע דוגמאות מתוך תשעה.</p>
    </div>
    <div class="duel-list">
{_nd_row("מרד נעורים", "Smells Like Teen Spirit", "נירוונה", "Creep", "רדיוהד")}
{_nd_row("זאת אני, יש לך בעיה עם זה?", "Bitch", "מרדית׳ ברוקס", "Ready to Go", "רפובליקה")}
{_nd_row("קרב הצבעים", "Black", "פרל ג׳ם", "Yellow", "קולדפליי")}
{_nd_row("לחיות את החיים כמו שהם", "It's My Life", "בון ג׳ובי", "Don't Look Back in Anger", "אואזיס")}
    </div>
    <p class="center mt-32" style="color:var(--text-dim)">להיטים שכל האולם שר. אחרי כל סיבוב התוצאה עולה בטלפון של כל אחד מהקהל.</p>
  </div>
</section>"""

N_VOTE_MP4 = "assets/video/nineties-vote.mp4?v=1"   # האפליקציה של הניינטיז בטלפון, הבמה והקהל (24.11.2026)
N_VOTE_POSTER = "assets/video/nineties-vote.jpg?v=1"
def nineties_app_card():
    """סרטון האפליקציה של הניינטיז, בלי מסך, הכול בטלפון. סרטון הקהל כבר מופיע למעלה, ברצועת ההוכחה."""
    return crowd_card(head="מהכניסה ועד ההכרעה", eyebrow="ככה זה עובד בניינטיז", wrap=True,
        text="סורקים QR ונכנסים מהטלפון, בלי להוריד אפליקציה. על כל שיר יש סיפור קצר, בזמן השירים שולחים אימוג׳ים, "
             "ובסוף הסיבוב מצביעים בלחיצה. התוצאה עולה מיד אצל כל אחד מהקהל. האפליקציה אמיתית, הקהל והלהקה מהופעות הניינטיז, והתוצאה מתוך הדגמה.",
        clip=crowd_clip(N_VOTE_MP4, N_VOTE_POSTER, "הדגמה: נכנסים מהטלפון, סיפור על כל שיר, אימוג׳ים, הצבעה וההכרעה, עם הלהקה והקהל"))

N_PHONES = [("n-phone-fact", "💡 על כל שיר", "הסיפור שמאחורי השיר"),
            ("n-phone-song", "🔥 בזמן השיר", "אימוג׳ים, והמילים כדי לשיר יחד"),
            ("n-phone-result", "🏆 הכרעה", "התוצאה עולה מיד")]
def phones_section(phones, sub):
    items = "".join(f'<figure class="svid reveal"><img src="assets/img/{f}.webp?v=1" alt="{h}: {t}" loading="lazy" width="390" height="844" '
                    f'style="width:100%;height:auto;border-radius:22px;border:1px solid rgba(255,255,255,.12)">'
                    f'<figcaption><b>{h}</b> {t}</figcaption></figure>' for f, h, t in phones)
    return f"""<section id="on-phone">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">בטלפון</div>
      <h2>כל האולם מחובר</h2>
      <p>{sub}</p>
    </div>
    <div class="svids">{items}</div>
  </div>
</section>"""

# תוספות שמתאימות לניינטיז (בלי פופקורן ודמויות מהמסך)
N_ADDONS = ["עוד חצי שעה של ריקודים", "שטיח אדום", "חידון מונחה לפני המופע", "פסלוני זהב", "הלוגו שלכם בפתיח", "זוג שירים משלכם"]
N_ADDON_TEXT = {"עוד חצי שעה של ריקודים": "הלהקה ממשיכה לנגן להיטי ניינטיז לרחבה אחרי ההכרזה על המנצח",
                "חידון מונחה לפני המופע": "שאלות על הניינטיז, וכל האולם עונה מהטלפון"}

def nineties_shows():
    """ההופעות הקרובות של הניינטיז: המופע היחיד שאפשר לבוא ולראות לפני שמזמינים."""
    shows = [x for x in load_shows() if "ניינטיז" in x.get("format", "")]
    if not shows:
        return ""
    return f"""<section id="next-shows" class="home-shows" data-shows-section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">ההופעות הקרובות של הניינטיז</div>
      <h2>באים לראות לפני שמזמינים</h2>
    </div>
    <div class="sx-list" data-shows-list data-limit="3" data-format="ניינטיז">
{show_rows(shows[:3])}
    </div>
    <div class="cta-row center mt-32"><a class="btn btn-outline" href="shows.html">ללוח ההופעות המלא</a></div>
  </div>
</section>"""

def proof_strip():
    return f"""<section class="proof-strip">
  <div class="wrap ps-grid">
    <div class="ps-text">
      <div class="eyebrow">מהקהל</div>
      <figure class="ps-quote reveal">
        <blockquote>״החבר׳ה אצלנו עפו עליכם. קיבלתם פירגון עד השמיים.״</blockquote>
        <figcaption>שחר הרוש · קהילת אלפא, אלפי מנשה · כ-200 משתתפים</figcaption>
      </figure>
      <div class="ps-venues reveal"><span>הופענו ב:</span> <b>תמונע</b> תל אביב · <b>וונדרבר</b> חיפה · <b>אלפא פאב</b> אלפי מנשה · <b>בלה צ'או</b> ראשון לציון</div>
      <p class="ps-cap">בסרטון: וונדרבר, חיפה, ספטמבר 2026. צילום טלפון מתוך הקהל.</p>
    </div>
    {crowd_clip()}
  </div>
</section>"""

def home_shows():
    if not load_shows():
        return ""
    return f"""<section id="next-shows" class="home-shows" data-shows-section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">לוח ההופעות</div>
      <h2>ההופעות הקרובות</h2>
    </div>
    <div class="sx-list" data-shows-list data-limit="3">
{static_shows(limit=3)}
    </div>
    <div class="cta-row center mt-32"><a class="btn btn-outline" href="shows.html">ללוח ההופעות המלא</a></div>
  </div>
</section>"""

ADDONS_TOP = ["שטיח אדום", "עוד חצי שעה של ריקודים", "פופקורן של קולנוע", "דמויות בהשראת המסך"]
def addons_compact():
    cards = "".join(addon_card(h, t, i) for h, t, i in ADDONS if h in ADDONS_TOP)
    return f"""<section id="addons">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">תוספות</div>
      <h2>אפשר להפוך את זה לערב שלם</h2>
      <p>כמה מהתוספות שאנחנו מביאים. את כולן אפשר לראות בעמוד אירועי החברה.</p>
    </div>
    <div class="addons">{{cards}}</div>
    <div class="cta-row center mt-32"><a class="btn btn-outline" href="events.html#addons">לכל התוספות</a></div>
  </div>
</section>""".replace("{cards}", cards)

home_body = f"""
<div class="next-show" data-next-show hidden></div>

<section class="hero">
  {hero_photo(HERO_IMG)}
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">מופע חי · Live Show</div>
    <h1 class="split-fill latin">SOUNDCLASH</h1>
    <h2>לא עוד להקת קאברים. קרב שאתם מכריעים.</h2>
    <p class="lede">
      שיר מול שיר, <b>להיטים שכולם מכירים</b>, והקהל מכריע מהטלפון.
      המופע החדש שלנו: <a class="inline" href="tv-vs-film.html"><span class="b-side">סדרות נגד סרטים</span></a>.
    </p>
    <div class="proofs"><span>אתם מכריעים</span><span>מופע עם מסך</span><span>ערב שלם</span></div>
    {demo_video()}
    <div class="cta-row center">
      <a class="btn btn-solid" href="tv-vs-film.html">לסדרות נגד סרטים</a>
      <a class="btn btn-outline hide-m" href="tel:{PHONE_TEL}">{ICON["phone"]} להזמנת המופע</a>
      <a class="btn btn-wa hide-m" href="{wa_link()}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
      <a class="btn btn-outline" href="events.html">לאירועי חברה</a>
      <a class="btn btn-outline" href="authorities.html">לרשויות</a>
    </div>
  </div>
</section>

{stats_bar(DEFAULT_STATS)}
{proof_strip()}
{formats_index()}
{home_shows()}
{mechanism_block()}
{addons_compact()}
{video_section(VIDEOS_NO_TRAILER, head="צפו בקרב מקרוב", sub="ביצועים חיים ממופע הניינטיז, ותגובות הקהל בזמן ההצבעה. המנגנון זהה בכל המופעים.", limit=2)}
{audience_block()}
{gallery_section(IMAGES[:6], head="תמונות מהבמה")}
{contact_band("רוצים את הקרב הזה באירוע שלכם?",
              "אפשר להתקשר, לשלוח וואטסאפ, או למלא את טופס ההזמנה עם התאריך והמקום, ונחזור אליכם עם הצעה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""

page("index.html",
     "Soundclash — מופע קרב מוזיקלי חי שבו הקהל מכריע",
     "לא עוד להקת קאברים: מופע קרב מוזיקלי חי בשישה נגנים, שיר מול שיר, והקהל מכריע מהטלפון. המופע החדש: סדרות נגד סרטים. וגם מסיבה ישראלית וניינטיז. להזמנות: 054-6738192.",
     home_body, "home", theme="theme-90", jsonld=HOME_JSONLD)


# ============================================================================
#  7. דפי הפורמטים
# ============================================================================
FORMAT_PAGES = {
 "90s": dict(
   title="Soundclash ניינטיז — קרב הלהיטים של שנות ה-90, ארה״ב נגד בריטניה",
   desc="מופע קרב חי על להיטי שנות ה-90: גראנג׳ וגלאם אמריקאי מול בריטפופ ואינדי בריטי, שיר מול שיר, והקהל מכריע בהצבעה מהטלפון. להזמנות 054-6738192.",
   sub="אמריקה נגד בריטניה. הקהל מכריע.",
   arc="מהגראנג׳ של סיאטל ועד ה<em>בריטפופ</em> של מנצ׳סטר: עשור אחד, ושני צדדים של האוקיינוס שלא הסכימו על כלום.",
   lede=("9 סיבובים ו-18 להיטים שכולם מכירים: <b>להקה אמריקאית</b> מול <span class='b-side'>להקה בריטית</span>, סביב נושא משותף. "
         "מצביעים מהטלפון, והתוצאה עולה מיד אצל כל אחד מהקהל. סולן וסולנית בפרונט, וכל האולם שר."),
   # שמות שירים במקום ז׳אנרים: קונה מזהה שירים, לא ז׳אנרים (ליה ואיתי, 24.11.2026)
   side_a=("TEAM USA", "הצד האמריקאי", "נירוונה, פרל ג׳ם, גרין דיי ובון ג׳ובי. הלהיטים שמילאו את הרדיו של שנות ה-90.",
           ["Smells Like Teen Spirit", "Black", "Basket Case", "It's My Life"]),
   side_b=("TEAM UK", "הצד הבריטי", "רדיוהד, אואזיס, בלר וקולדפליי. הפזמונים שכל העולם שר בקול.",
           ["Creep", "Song 2", "Yellow", "Don't Look Back in Anger"]),
   avail="מופע הניינטיז כבר עולה על הבמות, ומוכן לתאריכים מיידיים."),

 "80s": dict(
   title="Soundclash אייטיז — קרב שנות ה-80, בריטניה נגד ארה״ב",
   desc="מופע קרב חי על שנות ה-80: הסינת׳-פופ והניו-ווייב הבריטי מול הסטדיום רוק והגלאם האמריקאי, שיר מול שיר, והקהל מכריע בהצבעה חיה. להזמנות 054-6738192.",
   sub="ניאון מול איצטדיון — הקרב על האייטיז",
   arc="מהסינת׳-פופ הבריטי ועד ל<em>סטדיום רוק</em> אמריקאי, מהניו-רומנטיקס ועד לגלאם מטאל — העשור שבו כל שיר נשמע כמו נבואה על העתיד.",
   lede=("בצד אחד <b>הגיטרות הגדולות, הבלדות והסטדיונים של אמריקה</b>. "
         "בצד השני <span class='b-side'>הסינתסייזרים, הניאון והסטייל של הגל הבריטי החדש</span>. "
         "העשור הכי מלוטש של הלהיטים, בשני נוסחים שאי אפשר לבלבל ביניהם."),
   side_a=("TEAM USA", "הצד האמריקאי", "העשור שבו הרוק האמריקאי גדל לגודל של אצטדיון — סולואים, בלדות והרמוניות שנבנו כדי למלא אולם.",
           ["סטדיום רוק", "גלאם מטאל", "הארט רוק", "פופ אמריקאי של MTV"]),
   side_b=("TEAM UK", "הצד הבריטי", "העשור שבו בריטניה החליפה את הגיטרה בסינתסייזר, ואת החולצה במעיל — וכבשה את המצעדים.",
           ["סינת׳-פופ", "ניו-ווייב", "ניו-רומנטיקס", "פוסט-פאנק בריטי"]),
   avail="מופע האייטיז זמין להזמנה. ספרו לנו על התאריך, ונבנה את הערב לפי האולם והקהל."),

 "israel": dict(
   title="Soundclash מסיבה ישראלית — שנות ה-70 וה-80 נגד שנות ה-90",
   desc="מסיבה ישראלית: קרב חי על הלהיטים הישראליים של שנות ה-70 וה-80 מול שנות ה-90, שיר מול שיר, הקהל מכריע מהטלפון, וכל האולם שר ורוקד. להזמנות 054-6738192.",
   sub="שלושה עשורים, מסיבה אחת. הקהל מכריע.",
   arc="מצביקה פיק, משינה וגזוז ועד אתניקס, הדורבנים ודנה אינטרנשיונל: <em>שלושה עשורים</em> של שירים שכל הארץ שרה, ועכשיו גם רוקדת.",
   lede=("10 סיבובים ו-20 להיטים שכולם מכירים: <b>להיט מהסבנטיז או מהאייטיז</b> מול <span class='b-side'>להיט מהניינטיז</span>, באותו וייב. "
         "מצביעים מהטלפון, והתוצאה עולה מיד בטלפון של כל אחד מהקהל, גם בלי מסך. סולן וסולנית בפרונט, וכל האולם שר ורוקד."),
   side_a=("TEAM 70–80", "צד ה-70 וה-80", "הלהקות הגדולות, צביקה פיק והלהיטים ששרים בקולי קולות.",
           ["להקות האייטיז", "צביקה פיק", "להיטי הסבנטיז", "שירי רדיו"]),
   side_b=("TEAM 90s", "צד הניינטיז", "העשור שבו הגיטרות חזרו, הפופ התחדש וזמרות וזמרים חדשים הגדירו דור.",
           ["להקות הניינטיז", "זמרות גדולות", "הפופ החדש", "להיטי רחבה"]),
   avail="מסיבה ישראלית זמינה להזמנה: לרשויות ולמחלקות תרבות, לוועדי עובדים ולחברות, להיכלים ולמלונות, באולם או בבמת חוץ. ספרו לנו על התאריך, ונבנה את הערב לפי המקום והקהל."),

 "screen": dict(
   title="Soundclash סדרות נגד סרטים — קרב השירים של המסך",
   desc="מופע קרב חי על מוזיקת המסך: השירים הגדולים מתוך סדרות טלוויזיה מול השירים הגדולים מתוך סרטי קולנוע, שיר מול שיר, והקהל מכריע בהצבעה חיה. להזמנות 054-6738192.",
   sub="סדרות נגד סרטים. הקהל מכריע.",
   arc="על המסך: <em>וידאו מקורי לכל שיר</em>, ושירי הסדרות מקבלים פתיח מקורי בסגנון העשור שלהם.",
   lede=("10 סיבובים ו-20 להיטים שכולם מכירים: <b>שיר מסדרה</b> מול <span class='b-side'>שיר מסרט</span>, סביב נושא משותף. "
         "מצביעים מהטלפון, והתוצאה עולה למסך הגדול. מופע ערב נוצץ, עם גלאם, כוריאוגרפיה וסולן וסולנית בפרונט."),
   side_a=("TEAM TV", "צד הסדרות", "השירים שליוו סדרה שלמה — משיר הפתיחה שכולם שרים בעל פה ועד לרגע שהשיר הנכון עלה בדיוק בזמן.",
           ["שירי פתיחה מוכרים", "רגעי מפתח מהעונה", "סדרות פולחן", "השירים שכולם מזהים"]),
   side_b=("TEAM FILM", "צד הסרטים", "השירים שנצרבו יחד עם סצנה אחת גדולה — לא הפסקול התזמורתי, אלא השיר שכולם מזהים מהשנייה הראשונה.",
           ["שירים מסצנות איקוניות", "הלהיט שכולם מכירים מהסרט", "קולנוע פולחן", "הסצנה שכולם זוכרים"]),
   avail="זמין להזמנה למועדונים, לאירועי חברה, לרשויות ולהיכלי תרבות. יש גם גרסה של 45 דקות."),
}

ISRAEL_DUELS_SECTION = """<section id="duels">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">מהרפרטואר</div>
      <h2>ככה נראה סיבוב</h2>
      <p>בכל סיבוב להיט מהסבנטיז או מהאייטיז מול להיט מהניינטיז, באותו וייב. ארבע דוגמאות מתוך עשרה.</p>
    </div>
    <div class="duel-list">
      <div class="duel-row reveal">
        <div class="theme">קרב הלהקות</div>
        <div class="side tv"><span class="who latin" dir="ltr">70–80</span><b>רכבת לילה לקהיר</b><small>משינה</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">90s</span><b>ג׳סיקה</b><small>אתניקס</small></div>
      </div>
      <div class="duel-row reveal">
        <div class="theme">מה אומרים עליה?</div>
        <div class="side tv"><span class="who latin" dir="ltr">70–80</span><b>שיר הפרחה</b><small>עפרה חזה</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">90s</span><b>באה מאהבה</b><small>יהודית רביץ וגידי גוב</small></div>
      </div>
      <div class="duel-row reveal">
        <div class="theme">מסיבת ריקודים</div>
        <div class="side tv"><span class="who latin" dir="ltr">70–80</span><b>הרקדן האוטומטי</b><small>צביקה פיק ורותי נבון</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">90s</span><b>יעקב</b><small>ללדין</small></div>
      </div>
      <div class="duel-row reveal">
        <div class="theme">יוצאים אל הדיסקו</div>
        <div class="side tv"><span class="who latin" dir="ltr">70–80</span><b>יום שישי</b><small>בנזין</small></div>
        <div class="mini-vs latin">VS</div>
        <div class="side film"><span class="who latin">90s</span><b>שוב הדיסקו כאן</b><small>הדורבנים</small></div>
      </div>
    </div>
    <p class="center mt-32" style="color:var(--text-dim)">ועוד שישה סיבובים, עם "שלח לי מלאך", "על קו הזינוק", "חללית", "היא לא יודעת מה עובר עליי", "לגור איתו" ו"דיווה".</p>
    <p class="center mt-32"><b>לא עוד ערב להיטים: כל שיר נלחם על הקול של הקהל, ובטלפון מחכה הסיפור שמאחוריו.</b></p>
  </div>
</section>"""

def other_shows(slug):
    """בתחתית כל עמוד מופע: שני המופעים האחרים, לפי סוג האירוע (24.11.2026)."""
    cards = ""
    for o in PUBLIC_FORMATS:
        if o["slug"] == slug:
            continue
        cards += f"""<a class="format-card {o['css']} reveal" href="{o['file']}">
      {('<img class="card-logo" src="' + o['logo'] + '" alt="' + o['logo_alt'] + '" loading="lazy" width="300" height="360">') if o.get('logo') else ''}
      <h3>{o['name_html']}</h3>
      <p class="fc-for">{o.get('occasion', '')}</p>
      <p class="fc-status">{o.get('status', '')}</p>
      <span class="go">לדף המופע ←</span>
    </a>"""
    return f"""<section id="other-shows">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">עוד מופעים</div>
      <h2>מחפשים משהו אחר לאירוע שלכם?</h2>
      <p>אותו מנגנון, רפרטואר אחר. אפשר גם לשלב: מופע אחד לאירוע הגדול, ומופע אחר לאירוע השני בשנה.</p>
    </div>
    <div class="formats-grid">{cards}</div>
  </div>
</section>"""

def duel_block(a, b, photos=None):
    def card(side, cls):
        tag, h, p, chips = side
        chips_html = "".join(('<span class="chip latin" dir="ltr">%s</span>' if re.match(r"[A-Za-z]", c) else '<span class="chip">%s</span>') % c for c in chips)
        ph = (photos or {}).get(cls)
        style = f' style="--dc:url(\'/{T}{ph}-800.webp\')"' if ph else ""
        return (f'<div class="duel-card {cls}{" has-photo" if ph else ""} reveal"{style}><span class="tag latin">{tag}</span>'
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
    spec = [(k, v.replace(SINGER_GENERAL, {"90s": REUT_90, "screen": NICOLE_TV, "israel": NICOLE_TV}.get(f["slug"], SINGER_ONLY))
                 .replace(YINON_ACOUSTIC, YINON_VOCALS if f["slug"] == "screen" else YINON_ACOUSTIC)) if k == "הרכב" else (k, v)
            for k, v in spec]
    spec = [(k, (REQ_SCREEN if f["slug"] == "screen" else REQ_NO_SCREEN) if k == "מה נדרש במקום" else v) for k, v in spec]
    spec.insert(5, ("זמינות", d["avail"]))
    if f["slug"] == "israel":
        IL_SPEC = {"שפה": "המופע כולו בעברית",
                   "אורך המופע": "כ-90 דקות, או גרסה של 45 דקות. אפשר להוסיף חצי שעת מסיבה עם להיטי רחבה ישראליים",
                   "קהל": "רשויות ומחלקות תרבות, ועדי עובדים וחברות, היכלי תרבות ומתנ״סים, מלונות, אירועי חוץ וחגים, ואירועים פרטיים",
                   "מה נדרש במקום": "מערכת הגברה עם איש סאונד, ותאורה סטנדרטית, באולם או בבמת חוץ. אין במקום? נביא משלנו, בתוספת תשלום. מסך לא צריך: התוצאה עולה בטלפונים. יש מסך? נוסיף סרטון אווירה לכל שיר ואת התוצאות על המסך"}
        spec = [(k, IL_SPEC.get(k, v)) for k, v in spec]
        spec.insert(6, ("אם הקליטה חלשה", "הקרב ממשיך: הקהל מצביע בדגלונים בצבעי שני הצדדים, וההכרעה מוכרזת מהבמה"))
    if f["slug"] == "90s":
        # קונים מדומים, 24.11.2026; הנחיה באנגלית לפי בקשה (ינון)
        N_SPEC = {"מה נדרש במקום": "מערכת הגברה עם איש סאונד, ותאורה סטנדרטית לאולם. אין במקום? נביא משלנו, בתוספת תשלום. מסך לא צריך: התוצאה עולה בטלפונים. יש מסך? נוסיף סרטון אווירה לכל שיר ואת התוצאות על המסך",
                  "אורך המופע": "כ-90 דקות, או גרסה של 45 דקות. אפשר להוסיף חצי שעת מסיבה עם להיטי ניינטיז",
                  "שפה": "המופע מוגש בעברית, והשירים בשפת המקור. הנחיה גם באנגלית, לפי בקשה",
                  "קהל": "מועדונים ופאבים, אירועי חברה, ערבי צוות וגיבוש, מלונות, ערבי קהילה וצעירים, מחלקות תרבות ומתנ״סים, פסטיבלים ואירועים פרטיים"}
        spec = [(k, N_SPEC.get(k, v)) for k, v in spec]
        spec.insert(6, ("אם הקליטה חלשה", "הקרב ממשיך: הקהל מצביע בדגלונים בצבעי שני הצדדים, וההכרעה מוכרזת מהבמה"))
    if f["slug"] == "screen":
        spec.insert(5, ("אם הקליטה חלשה", "הקרב ממשיך: הקהל מצביע בדגלונים בצבעי שני הצדדים, וההכרעה מוכרזת מהבמה"))

    if f["live"]:
        vids = video_section(VIDEOS_NO_TRAILER, head="צפו בקרב מקרוב",
                             sub="ביצועים חיים ממופע הניינטיז, ותגובות הקהל בזמן ההצבעה.", limit=3)
    elif f["slug"] in ("screen", "israel"):
        vids = ""   # סרטוני היוטיוב של הניינטיז לא מוצגים כאן; במקומם סרטוני ה-AI / סרטון האפליקציה (ינון, 14.11 ו-24.11.2026)
    else:
        vids = video_section(VIDEOS_NO_TRAILER, head="ככה נראה קרב Soundclash", eyebrow="המנגנון בעיניים",
                             sub="הסרטונים צולמו בניינטיז, המופע שכבר עולה על הבמות. המנגנון וההצבעה זהים.",
                             limit=3)

    body = f"""
<section class="hero">
  {"" if f["slug"] == "israel" else hero_photo(HERO_SCREEN if f["slug"] == "screen" else IMAGES[1][0])}
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">{f['tag']} · Soundclash</div>
    {('<img class="hero-logo" src="' + f['logo'].replace('-sm', '') + '" alt="' + f['logo_alt'] + '">') if f.get('logo') else ('<div class="era-mark latin">' + f['era'] + '</div>')}
    <h1 class="as-h2">{d['sub']}</h1>
    <p class="lede">{d['lede']}</p>
    <p class="status-line">{f.get('status', '')}</p>
    {trailer_video() if f["live"] else (demo_video() if f["slug"] == "screen" else "")}
    <div class="cta-row center">
      <a class="btn btn-solid" href="tel:{PHONE_TEL}">{ICON["phone"]} להזמנת המופע</a>
      <a class="btn btn-wa hide-m" href="{wa_link('היי, אשמח לפרטים על ' + f['name'] + ' לאירוע שלנו.')}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
      <a class="btn btn-outline hide-m" href="contact.html">טופס הזמנה</a>
    </div>
  </div>
</section>

<section style="padding-top:56px; padding-bottom:8px">
  <div class="wrap"><p class="arc reveal">{d['arc']}</p></div>
</section>

{stats_bar(NINETIES_STATS if f["slug"] == "90s" else DEFAULT_STATS)}
{proof_strip() if f["slug"] == "90s" else ""}
{(DUELS_SECTION + voices_block() + proof_pair("משמאל, 20 שניות מתוך הקהל בהופעת הניינטיז בוונדרבר, חיפה. מימין, סדרות נגד סרטים מהכניסה ועד ההכרעה: סורקים QR, סרטון AI מקורי לכל שיר על המסך, אימוג׳ים, הצבעה בלחיצה והכרעה. האפליקציה אמיתית, הקהל בצילומים מהופעות הניינטיז, והתוצאה מתוך הדגמה. בסרטונים מופיעה הזמרת של מופע הניינטיז. בסדרות נגד סרטים שרה ניקול רודוי. קליפ מצולם של סדרות נגד סרטים, עם ניקול והלהקה, יעלה לכאן באמצע דצמבר.", wrap=True) + addons_block()) if f["slug"] == "screen" else (ISRAEL_DUELS_SECTION + voices_block(head="הקולות של המסיבה הישראלית") + il_proof_pair("משמאל: הקהל בהופעת הניינטיז בוונדרבר. מימין: האפליקציה של המסיבה הישראלית, מהכניסה ועד ההכרעה. צילומי הבמה והקהל מהופעת הניינטיז, והתוצאה מתוך הדגמה.", wrap=True) + addons_block(only=IL_ADDONS, texts=IL_ADDON_TEXT, cta_href="contact.html").replace('<section id="addons">', '<section id="addons"><style>@media (min-width:900px){#addons .addons{grid-template-columns:repeat(3,1fr)}}</style>', 1) + il_packages_section()) if f["slug"] == "israel" else (duel_block(d['side_a'], d['side_b'], photos={"a": "09224", "b": "09296"}) + NINETIES_DUELS_SECTION
       + voices_block(head="הקולות של הניינטיז", lead=REUT_CARD, yinon_role="שירה וגיטרה אקוסטית", yinon_img=YINON_90_PHOTO, yinon_pos="center 20%")
       + nineties_app_card()
       + phones_section(N_PHONES, "בלי מסך ובלי להוריד אפליקציה: סורקים QR, ובטלפון של כל אחד יש סיפור על כל שיר, המילים, אימוג׳ים בזמן השירים, הצבעה ותוצאה.")
       + addons_block(only=N_ADDONS, texts=N_ADDON_TEXT, cta_href="contact.html").replace('<section id="addons">', '<section id="addons"><style>@media (min-width:900px){#addons .addons{grid-template-columns:repeat(3,1fr)}}</style>', 1) + nineties_packages_section()) if f["slug"] == "90s" else duel_block(d['side_a'], d['side_b'])}
{mechanism_block(note=NOTE_SCREEN if f["slug"] == "screen" else NOTE_NO_SCREEN, head="ככה מוכרע הקרב")}
{vids}
{screen_videos_section() if f["slug"] == "screen" else (il_phones_section() if f["slug"] == "israel" else gallery_section(IMAGES[3:6], head="תמונות מהבמה"))}
{nineties_shows() if f["slug"] == "90s" else ""}
{spec_block(spec, title="המפרט של המופע")}
{il_faq_section() if f["slug"] == "israel" else (nineties_faq_section() if f["slug"] == "90s" else "")}
{other_shows(f["slug"])}
{contact_band("רוצים את " + f['name_html'] + " אצלכם?",
              "תגידו לנו תאריך, מקום וגודל קהל משוער, ונחזור אליכם עם הצעה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>', photo=f["slug"] not in ("screen", "israel", "80s"))}
"""
    page(f["file"], d["title"], d["desc"], body, "fmt-" + f["slug"], theme=f["theme"], og_img={"screen": OG["tv-vs-film"], "israel": OG["israel"]}.get(f["slug"], og_of(IMAGES[1][0])), noindex=bool(f.get("draft")))


# ============================================================================
#  8. הופעות קרובות
# ============================================================================
shows_body = f"""
<section class="sx-page">
  <div class="wrap">
    <header class="sx-head">
      <div class="sx-side a"></div><div class="sx-side b"></div>
      <div class="sx-head-in">
        <div class="sx-kicker latin">SHOWS</div>
        <h1>לוח ההופעות</h1>
        <p>איפה פוגשים את הקרב הבא</p>
      </div>
    </header>
    <p class="sx-lede">ההופעות הפתוחות לקהל. כרטיסים בקישור, או שריון מקום בוואטסאפ.</p>
    <div class="sx-list" data-shows-list>
{static_shows()}
    </div>
    <noscript><p class="empty-state" style="margin-top:16px">לצפייה בתאריכים המעודכנים יש לאפשר JavaScript, או להתקשר ל-{PHONE_MAIN}.</p></noscript>
    {crowd_card()}
    {shows_strip()}
  </div>
</section>

{contact_band("לא מצאתם תאריך שמתאים?",
              "אנחנו מעלים את המופע גם כאירוע סגור: במועדון, בחברה, במתנ״ס או בפסטיבל.")}
"""
page("shows.html", "הופעות קרובות — Soundclash",
     "לוח ההופעות הקרובות של Soundclash: תאריכים, כרטיסים, שריון מקום וניווט. להזמנת המופע לאירוע: 054-6738192.",
     shows_body, "shows", theme="theme-90", og_img=OG["shows"], jsonld=shows_jsonld())


# ============================================================================
#  9. גלריה
# ============================================================================
gallery_body = f"""
<section class="hero compact">
  {hero_photo(IMAGES[1][0])}
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div class="eyebrow">מהבמה</div>
    <h1 class="latin" style="font-size:clamp(40px,8vw,86px)">GALLERY</h1>
    <h2>תמונות מההופעות</h2>
    <p class="lede">לחיצה על תמונה פותחת אותה בגודל מלא.</p>
  </div>
</section>

{gallery_section(IMAGES, head="כל התמונות", eyebrow="גלריה", link_more=False)}
{crowd_card(wrap=True)}
{video_section(GALLERY_VIDEOS, head="וידאו מההופעות", eyebrow="וידאו", limit=3)}
{contact_band("רוצים לראות את זה אצלכם?",
              "אפשר להתקשר, לשלוח וואטסאפ, או למלא את טופס ההזמנה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""
page("gallery.html", "גלריה — Soundclash",
     "תמונות ווידאו מהופעות Soundclash: הלהקה על הבמה, הקהל בהצבעה, ורגעים מתוך הקרב.",
     gallery_body, "gallery", theme="theme-90", og_img=og_of(IMAGES[1][0]))


# ============================================================================
#  10. אודות
# ============================================================================
LINEUP = [
    ("ינון בר שירה",   "שירה וגיטרה אקוסטית"),
    ("ניקול רודוי",    "שירה. הסולנית של סדרות נגד סרטים"),
    ("רעות זורמן",     "שירה וגיטרה חשמלית במופע הניינטיז"),
    ("ולאד פוזיילוב",  "גיטרה חשמלית מובילה וקולות"),
    ("חן ירמיצקי",     "קלידים"),
    ("עומר מתתיהו",    "בס"),
    ("תומר כהן",       "תופים"),
]
BAND_PHOTOS = [  # השמות אומתו מול ינון (19.11.2026)
    ("09393", "ינון בר שירה", "שירה וגיטרה אקוסטית"),
    ("09363", "רעות זורמן", "שירה וגיטרה חשמלית, ניינטיז"),
    ("09381", "ולאד פוזיילוב וחן ירמיצקי", "גיטרה מובילה וקלידים"),
    ("09270-2", "עומר מתתיהו", "בס"),
    ("tomer", "תומר כהן", "תופים"),
]
def band_photos():
    cards = "".join(f'<figure class="band-card reveal"><img src="{T}{i}-800.webp" alt="{n}, {r}" loading="lazy" width="800" height="1200"{' style="object-position:50% 55%"' if i == "tomer" else ""}>'
                    f'<figcaption><b>{n}</b><span>{r}</span></figcaption></figure>' for i, n, r in BAND_PHOTOS)
    return f"""<section id="band">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">על הבמה</div><h2>הלהקה</h2>
      <p>ששת הנגנים של Soundclash, ברובם מההופעה בתמונע, תל אביב.</p></div>
    <div class="band-grid">{cards}</div>
    <p class="photo-credit">צילומי הבמה: ירון וג וענת מגריל</p>
    <div class="cta-row center mt-32"><a class="btn btn-outline" href="gallery.html">לגלריה המלאה</a></div>
  </div>
</section>"""

lineup_html = "".join('<li><b>%s</b> — %s</li>' % (name, role) for name, role in LINEUP)

about_body = f"""
<section class="hero compact">
  {hero_photo(IMAGES[0][0])}
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

    <p>את מערכת ההצבעה פיתחנו בעצמנו. היא רצה בדפדפן של הטלפון, בלי הורדה ובלי הרשמה, ומציגה את התוצאה בזמן אמת, בטלפון של כל אחד מהקהל ועל מסך האולם אם יש.
    זה מה שמחזיק את הקהל בתוך המופע לכל אורכו: הוא קובע איך הערב נגמר. את המערכת אנחנו מביאים ומפעילים,
    כך שמבחינת המקום המארח זו לא עוד משימה טכנית ברשימה.</p>

    <h3>ההרכב</h3>
    <ul class="lineup">{lineup_html}</ul>

    <h3>המופעים</h3>
    <p>אותו מנגנון מוגש בכמה מופעים: סדרות נגד סרטים, המופע החדש; ניינטיז, שכבר עולה על הבמות; ומסיבה ישראלית.
    כל המופעים זמינים להזמנה בתיאום מראש. גודל ההרכב ומבנה הסיבובים מאפשרים התאמה
    לסוג האירוע, לכמות האורחים ולמשך ההופעה.</p>

    <h3>מי עומד מאחורי זה</h3>
    <p>Soundclash היא להקה עצמאית. אנשי הקשר להזמנות הם <strong>ינון בר שירה</strong> ו<strong>נעמה בר שירה</strong>,
    ואפשר להגיע אלינו ישירות בטלפון, בוואטסאפ או בטופס יצירת הקשר באתר.</p>
  </div>
</section>

{voices_block(head="הסולנים של סדרות נגד סרטים", eyebrow="המופע החדש", crew=False)}
{stats_bar(DEFAULT_STATS)}
{mechanism_block()}
{band_photos()}
{contact_band("נשמח לדבר",
              "תגידו לנו תאריך, מקום וגודל קהל משוער, ונחזור אליכם עם הצעה.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""
page("about.html", "אודות הלהקה — Soundclash",
     "Soundclash — הרכב חי של שישה נגנים, מופע קרב מוזיקלי עם אפליקציית הצבעה שפיתחנו בעצמנו. ההרכב, המנגנון וארבעת המופעים.",
     about_body, "about", theme="theme-90")


# ============================================================================
#  11. יצירת קשר
# ============================================================================
fmt_options = "".join('<option>%s</option>' % f["name"] for f in PUBLIC_FORMATS)
contact_people = "".join(
    '<div class="person"><b>%s</b><a href="tel:%s">%s</a></div>' % (n, t, p) for n, p, t in CONTACTS)

contact_body = f"""
<section class="hero compact">
  {hero_photo(IMAGES[1][0])}
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">להזמנת המופע</div>
    <h1 class="latin" style="font-size:clamp(38px,7.5vw,78px)">BOOK THE CLASH</h1>
    <h2>בואו נמצא לזה תאריך</h2>
    <p class="lede">הכי מהיר: טלפון או וואטסאפ. אם נוח לכם בכתב, הטופס למטה שולח לנו את כל מה שאנחנו צריכים כדי לחזור אליכם עם הצעה.</p>
    <div class="cta-row center">
      <a class="btn btn-solid" href="tel:{PHONE_TEL}">{ICON["phone"]} {PHONE_MAIN}</a>
      <a class="btn btn-wa" href="{wa_link()}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
      <a class="btn btn-outline" href="#book-form">{ICON["mail"]} לטופס למטה</a>
    </div>
  </div>
</section>

<section>
  <div class="wrap-narrow">
    <div class="form-card reveal" id="book-form">
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
              <option>רשות / מועצה / מחלקת תרבות</option>
              <option>מתנ״ס / היכל תרבות</option>
              <option>ועד עובדים</option>
              <option>מלון</option>
              <option>פסטיבל / אירוע עירוני</option>
              <option>אירוע פרטי</option>
              <option>אחר</option>
            </select>
          </div>
          <div class="field">
            <label for="f-format">המופע שמעניין אתכם <span class="req">*</span></label>
            <select id="f-format" name="format" required>
              <option value="">בחרו…</option>
              {fmt_options}
              <option>עוד לא בטוחים, תמליצו לנו</option>
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
        <p class="form-note">כפתור הוואטסאפ פותח שיחה עם כל מה שכבר מילאתם בטופס, ולא צריך להקליד שוב.</p>
      </form>
    </div>

    <div class="mt-32" style="text-align:center">
      <div class="people" style="margin-bottom:0">
        {contact_people}
        <div class="person"><b>אימייל</b><span>{EMAIL}</span></div>
      </div>
    </div>
  </div>
</section>

{crowd_card(head="ככה זה נראה אצלכם", text="20 שניות מההופעה בוונדרבר, חיפה, מצולמות בטלפון מתוך הקהל. זה מה שאנחנו מביאים לאירוע: אולם שעומד על הרגליים ומצביע.", eyebrow="מהקהל", wrap=True)}
{spec_block(DEFAULT_SPEC, title="מה כדאי לדעת לפני שמדברים")}
"""
page("contact.html", "יצירת קשר והזמנת המופע — Soundclash",
     "להזמנת מופע Soundclash: טלפון 054-6738192, וואטסאפ או טופס הזמנה. מועדונים, אירועי חברה, מחלקות תרבות ופסטיבלים.",
     contact_body, "contact", theme="theme-90", og_img=og_of(IMAGES[1][0]))


# ============================================================================
#  דף אירועי חברה (events.html) — הזירה בראש הדף: סדרות נגד סרטים
#  הסגנונות הייחודיים לדף יושבים ב-site.css תחת "דף אירועי חברה".
# ============================================================================
CORP_WA_TEXT = "היי, אשמח להצעת מחיר למופע Soundclash באירוע חברה."
events_body = r"""<section class="hero hero-corp">
  {hero_photo(HERO_SCREEN)}
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">לאירועי חברה</div>
    <img class="hero-logo" src="assets/img/logo-tv-vs-film.webp" width="680" height="792" alt="Soundclash סדרות נגד סרטים">
    <h1 class="as-h2">סדרות נגד סרטים. והעובדים מכריעים.</h1>
    <p class="lede">מופע קרב מוזיקלי חי: שישה נגנים, סולן וסולנית, <b>השירים מהסדרות</b> מול <span class="b-side">השירים מהסרטים</span> שכולם בחדר גדלו עליהם. כל עובד מצביע מהטלפון, התוצאה עולה למסך בזמן אמת, ובסוף הערב מוכרז מנצח. ואפשר להפוך את זה לערב שלם, עם תוספות שאנחנו מביאים.</p>
    <div class="cta-row center">
      <a class="btn btn-solid" href="#quote">לקבלת הצעת מחיר</a>
      <a class="btn btn-outline" href="#addons">לבניית הערב</a>
      <a class="btn btn-wa hide-m" href="{CORP_WA}" target="_blank" rel="noopener">{WA} וואטסאפ</a>
      <a class="btn btn-outline hide-m" href="tel:0546738192">{PH} 054-6738192</a>
    </div>
  </div>
</section>

<div class="stats"><div class="wrap"><div class="stat"><div class="num latin">6</div><div class="lbl">על הבמה, עם סולן וסולנית</div></div><div class="stat"><div class="num latin">20</div><div class="lbl">להיטים שכולם מכירים</div></div><div class="stat"><div class="num latin">10</div><div class="lbl">סיבובים</div></div><div class="stat"><div class="num latin">90</div><div class="lbl">דקות, או גרסה של 45</div></div><div class="stat"><div class="num latin">APP</div><div class="lbl">הצבעה מהטלפון</div></div></div></div>

<section id="proof" class="proof-top">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">כבר הופענו</div>
      <h2>הקהל מכריע, והאולם מלא עד הסוף</h2>
    </div>
    <div class="proof-main proof-solo reveal">
      <div class="proof-num latin">200</div>
      <h3>קהילת אלפא, אלפי מנשה</h3>
      <p>הזמינה את Soundclash לערב קהילתי באלפא פאב, עם כ-200 משתתפים.</p>
      <blockquote class="quote">
        <p>״החבר׳ה אצלנו עפו עליכם. קיבלתם פירגון עד השמיים. תמסור לצוות שלך תודה רבה מקהילת אלפא, ואתם מוזמנים תמיד.״</p>
        <cite>שחר הרוש · קהילת אלפא, אלפי מנשה</cite>
      </blockquote>
    </div>
    <div class="venues-line reveal"><span class="vl-label">הופענו גם ב:</span>
      <ul data-past-venues>
        <li><b>תמונע</b><span>תל אביב</span></li>
        <li><b>וונדרבר</b><span>חיפה</span></li>
        <li><b>אלפא פאב</b><span>אלפי מנשה</span></li>
        <li><b>בלה צ'או</b><span>ראשון לציון</span></li>
      </ul>
    </div>
    <!--CROWD-->
  </div>
</section>

{ADDONS}

<section id="packages">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">חבילות</div>
      <h2>שלוש דרכים להזמין</h2>
      <p>ההצעה נבנית לפי האולם, גודל הקהל והתוספות שתבחרו. ספרו לנו על האירוע, ונחזור אליכם עם הצעת מחיר.</p>
    </div>
    <div class="packages">
      <article class="pkg reveal">
        <div class="pkg-tag latin">SET</div>
        <h3>גרסה של 45 דקות</h3>
        <p class="pkg-for">להרמת כוסית, כנס או ערב עם תוכנית נוספת</p>
        <ul>
          <li>כ-45 דקות</li>
          <li>5 סיבובים</li>
          <li>הצבעה חיה ומסך תוצאות</li>
          <li>הכרזת מנצח</li>
        </ul>
      </article>
      <article class="pkg reveal">
        <div class="pkg-tag latin">FULL SHOW</div>
        <h3>המופע המלא</h3>
        <p class="pkg-for">ערב גיבוש או מסיבת חברה שהמופע הוא הלב שלה</p>
        <ul>
          <li>כ-90 דקות</li>
          <li>10 סיבובים</li>
          <li>הצבעה חיה ומסך תוצאות</li>
          <li>הגרלת פרסים בין המצביעים</li>
          <li>להיטים מקפיצים ומרקידים</li>
        </ul>
        <div class="pkg-up"><b>אפשר להוסיף: חצי שעת מסיבה</b><span>בתוספת תשלום. אחרי ההכרזה על המנצח הלהקה לא יורדת מהבמה: עוד 30 דקות של להיטי רחבה, בלי הצבעות, רק לרקוד. בלילה של כוכבים היא כבר כלולה.</span></div>
      </article>
      <article class="pkg pkg-star reveal">
        <div class="pkg-tag latin">A NIGHT OF STARS</div>
        <h3>לילה של כוכבים</h3>
        <p class="pkg-for"><b>העובדים שלכם הם הכוכבים.</b> לאירוע השנתי, להשקה או לחגיגה שרוצים שתיזכר</p>
        <ul>
          <li>המופע המלא, ואחריו חצי שעת מסיבה</li>
          <li>5 תוספות לבחירתכם: שטיח אדום וצלם, פופקורן, דמויות, פסלוני זהב, חידון מותאם לחברה, דו־קרב לבחירתכם ועוד</li>
          <li><b>20% הנחה</b> על התוספות וגם על חצי שעת המסיבה</li>
          <li>חידון לפני המופע והלוגו שלכם בפתיח, במתנה</li>
        </ul>
      </article>
    </div>
    <p class="center mt-32" style="color:var(--text-dim)">לא מחפשים סדרות וסרטים? אותו מנגנון רץ גם ב<a class="inline" href="90s.html">ניינטיז</a> (המופע שכבר עולה על הבמות) וב<a class="inline" href="israel.html">מסיבה הישראלית</a>. רוצים מופע בנושא אחר? <a class="inline" href="contact.html">דברו איתנו</a>.</p>
  </div>
</section>

{VOICES}

{DUELS}

<section id="screen-demo">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">על המסך ובטלפון</div>
      <h2>ככה זה נראה באולם</h2>
    </div>
    <div class="mt-32"><!--DEMO--></div>
    <div class="mt-32"><!--SVIDS--></div>
    <p class="center mt-32" style="color:var(--text-dim)">על המסך: סרטון אווירה מקורי לכל שיר. שלוש דוגמאות מתוך עשרים שיצרנו למופע.</p>
  </div>
</section>

<section id="flow">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">מה קורה באולם</div>
      <h2>ארבעה שלבים, מהשיר הראשון ועד ההכרזה</h2>
    </div>
    <div class="mechanism">
      <div class="step reveal"><h3>סורקים קוד</h3><p>העובדים סורקים קוד מהמסך ונכנסים להצבעה מהטלפון, בלי הורדה ובלי הרשמה.</p></div>
      <div class="step reveal"><h3>שיר מול שיר</h3><p>הלהקה מנגנת שיר מסדרה ומיד אחריו שיר מסרט, בביצוע חי ונאמן למקור.</p></div>
      <div class="step reveal"><h3>הקהל מכריע</h3><p>ההצבעה פתוחה לאורך שני השירים. בסוף הדו־קרב יש ספירה לאחור של 20 שניות, והתוצאה עולה למסך.</p></div>
      <div class="step reveal"><h3>מנצח ופרסים</h3><p>הניקוד המצטבר קובע את הצד המנצח, ובין המצביעים מוגרלים פרסים.</p></div>
    </div>
  </div>
</section>

<section id="second-event">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">עוד באותה שנה</div>
      <h2>האירוע השני שלכם בשנה</h2>
      <p>סדרות נגד סרטים לאירוע הגדול. לאירוע הבא בשנה יש לנו עוד שני מופעים, עם אותו מנגנון ורפרטואר אחר.</p>
    </div>
    <div class="packages">
      <a class="pkg reveal" href="israel.html">
        <div class="pkg-tag">מסיבה ישראלית</div>
        <h3>ליום העצמאות, לוועד ולמסיבת הקיץ</h3>
        <p class="pkg-for">להיטי הסבנטיז והאייטיז מול להיטי הניינטיז, כולו בעברית. עובד גם בלי מסך ובבמת חוץ.</p>
        <span class="go">למסיבה הישראלית ←</span>
      </a>
      <a class="pkg reveal" href="90s.html">
        <div class="pkg-tag latin">90's</div>
        <h3>לערב צוות, לגיבוש ולצוות בינלאומי</h3>
        <p class="pkg-for">ארה״ב מול בריטניה: הלהיטים באנגלית שכל העולם מכיר. הנחיה גם באנגלית, לפי בקשה.</p>
        <span class="go">לניינטיז ←</span>
      </a>
    </div>
  </div>
</section>

<section id="why">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">למה זה עובד בחברה</div>
      <h2>המופע שבו אף אחד לא נשאר בצד</h2>
    </div>
    <ul class="why-list reveal">
      <li><b>מחבר בין דורות.</b> חברים, טיטאניק, פוקימון ורוקי וריקי גל: גם עובד בן 25 וגם מנהלת בת 50 מזהים את השיר מהתו הראשון.</li>
      <li><b>כולם משתתפים.</b> כל אחד מצביע מהטלפון ורואה את הקול שלו מזיז את התוצאה על המסך.</li>
      <li><b>יש מתח ויש מנצח.</b> שני צדדים, שיר מול שיר, והקרב נשאר צמוד עד הדו־קרב האחרון.</li>
      <li><b>בלי ספק נוסף לתאם.</b> את האפליקציה, מסך התוצאות וההפעלה מול הקהל אנחנו מביאים ומפעילים.</li>
    </ul>
  </div>
</section>

<section id="faq">
  <div class="wrap-narrow">
    <div class="section-head reveal">
      <div class="eyebrow">שאלות שרכזות שואלות</div>
      <h2>מה צריך לדעת לפני שסוגרים</h2>
    </div>
    <div class="faq">
      <details class="reveal"><summary>מה צריך מהאולם?</summary><p>הגברה עם איש סאונד, תאורה סטנדרטית, ומסך או מקרן להצגת התוצאות. אם אין באולם, נביא הגברה, תאורה, מסך ואיש סאונד משלנו, בתוספת תשלום. הדבר היחיד שחשוב במיוחד הוא קליטה סלולרית או Wi-Fi סבירים לעובדים.</p></details>
      <details class="reveal"><summary>העובדים צריכים להוריד אפליקציה?</summary><p>לא. סורקים קוד מהמסך ומצביעים מהדפדפן בטלפון, בלי הורדה ובלי הרשמה.</p></details>
      <details class="reveal"><summary>יש לנו עובדים שלא מדברים עברית</summary><p>רוב השירים הם להיטים באנגלית, וההצבעה היא לחיצה אחת על השיר שאהבתם. יש לנו גם <a href="en.html" lang="en" dir="ltr">עמוד באנגלית</a> שאפשר להעביר לצוות.</p></details>
      <details class="reveal"><summary>לכמה עובדים זה מתאים?</summary><p>מעשרות עובדים ועד אירועים גדולים. ההגברה, המסך והמשך מותאמים לגודל האירוע ולמבנה הערב.</p></details>
      <details class="reveal"><summary>באיזו שפה המופע?</summary><p>ההגשה בעברית, והשירים בשפת המקור. בדרך יש גם רגעים בעברית שכל האולם שר.</p></details>
      <details class="reveal"><summary>אפשר לשלב את המופע בתוך ערב עם נאומים, ארוחה או הענקת פרסים?</summary><p>כן. הגרסה של 45 דקות נבנתה בדיוק בשביל זה, ואת המופע המלא אפשר לחלק לשני חלקים סביב התוכנית שלכם.</p></details>
      <details class="reveal"><summary>אפשר להפוך את זה לערב שלם?</summary><p>כן: חידון מונחה על המסך לפני המופע, שטיח אדום, פופקורן, דמויות, פסלוני זהב ועוד. בוחרים מה מתאים, ואנחנו מביאים ומפעילים.</p></details>
      <details class="reveal"><summary>מה קורה אם הקליטה באולם חלשה?</summary><p>ההצבעה עובדת בכל טלפון עם קליטה בסיסית או עם ה-Wi-Fi של המקום. ואם הקליטה בכל זאת נופלת, הקרב ממשיך: הקהל מצביע בדגלונים בצבעי שני הצדדים, וההכרעה מוכרזת מהבמה.</p></details>
      <details class="reveal"><summary>איזה מידע נאסף מהעובדים בהצבעה?</summary><p>כמעט כלום. לא מורידים אפליקציה ולא נרשמים. מי שרוצה כותב שם פרטי או כינוי, וכל מצביע מקבל מספר כרטיס אקראי. ההגרלה נעשית לפי מספר הכרטיס, והזוכה מראה את המסך שלו ללהקה. לא מבקשים טלפון, מייל או פרטים מזהים.</p></details>
      <details class="reveal"><summary>כמה זמן מראש צריך להזמין?</summary><p>כדאי לפנות מוקדם ככל האפשר, כדי לתאם את הרפרטואר והצד הטכני מול האולם.</p></details>
    </div>
  </div>
</section>

<section id="lineup">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">מפרט</div>
      <h2>המפרט, בלי לחפש</h2>
    </div>
    <dl class="spec reveal"><div class="spec-row"><dt>הרכב</dt><dd>ינון בר שירה – שירה | ניקול רודוי – שירה | ולאד פוזיילוב – גיטרה מובילה וקולות | חן ירמיצקי – קלידים | עומר מתתיהו – בס | תומר כהן – תופים</dd></div><div class="spec-row"><dt>אורך</dt><dd>גרסה של כ-45 דקות, או מופע מלא של כ-90 דקות</dd></div><div class="spec-row"><dt>קהל</dt><dd>מעשרות עובדים ועד אירועים גדולים. ההגברה והמסך מותאמים לגודל האירוע</dd></div><div class="spec-row"><dt>מה אנחנו מביאים</dt><dd>אפליקציית ההצבעה, מסך התוצאות וההפעלה מול הקהל</dd></div><div class="spec-row"><dt>מה נדרש במקום</dt><dd>הגברה ותאורה סטנדרטיות, מסך או מקרן להצגת התוצאות, וקליטה סלולרית או Wi-Fi לעובדים. אין הגברה, תאורה או מסך? נביא משלנו, כולל איש סאונד, בתוספת תשלום</dd></div><div class="spec-row"><dt>מתאים ל</dt><dd>ערבי גיבוש, מסיבות חברה, הרמות כוסית, כנסים ואירועים שנתיים</dd></div></dl>
  </div>
</section>

<section id="quote">
  <div class="wrap">
    <div class="contact-band reveal">
      <div class="eyebrow" style="justify-content:center">הצעת מחיר</div>
      <h2>ספרו לנו על האירוע</h2>
      <p class="sub">תאריך, מקום, כמה עובדים ומה אופי הערב. נחזור אליכם עם הצעה.</p>
      <div class="people"><div class="person"><b>ינון בר שירה</b><a href="tel:0546738192">054-6738192</a></div><div class="person"><b>נעמה בר שירה</b><a href="tel:0546589303">054-6589303</a></div><div class="person"><b>אימייל</b><span>Stageart.pnima@gmail.com</span></div></div>
      <div class="cta-row center">
        <a class="btn btn-wa" href="{CORP_WA}" target="_blank" rel="noopener">{WA} וואטסאפ</a>
        <a class="btn btn-solid" href="tel:0546738192">{PH} להזמנה בטלפון</a>
        <a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>
      </div>
    </div>
  </div>
</section>"""
events_body = (events_body.replace("{WA}", ICON["wa"]).replace("{PH}", ICON["phone"])
               .replace("{DUELS}", DUELS_SECTION)
               .replace("{HERO_SCREEN}", HERO_SCREEN)
               .replace("{hero_photo(HERO_SCREEN)}", hero_photo(HERO_SCREEN))
               .replace("<!--SVIDS-->", svids_html())
               .replace("{VOICES}", voices_block(head="מי על הבמה", eyebrow="הנבחרת"))
               .replace("{ADDONS}", addons_block(head="מה עוד אפשר להוסיף לערב", sub="מוסיפים מה שמתאים לאירוע שלכם. כל התוספות מגיעות איתנו, בלי ספק נוסף לתאם.", cta=False))
               .replace("{CORP_WA}", html.escape(wa_link(CORP_WA_TEXT), quote=True)))
events_body = events_body.replace("<!--DEMO-->", demo_video())
events_body = events_body.replace("<!--CROWD-->", proof_pair("משמאל, 20 שניות מתוך הקהל בהופעת הניינטיז בוונדרבר, חיפה. מימין, סדרות נגד סרטים מהכניסה ועד ההכרעה: סורקים QR בלי להוריד אפליקציה, סרטון AI מקורי לכל שיר על המסך, אימוג׳ים, הצבעה בלחיצה והכרעה. האפליקציה אמיתית, הקהל בצילומים מהופעות הניינטיז, והתוצאה מתוך הדגמה. בסרטונים מופיעה הזמרת של מופע הניינטיז. בסדרות נגד סרטים שרה ניקול רודוי."))
page("events.html", "Soundclash לאירועי חברה — קרב מוזיקלי שהעובדים מכריעים",
     "מופע קרב מוזיקלי חי לאירועי חברה וערבי גיבוש: סדרות נגד סרטים, שישה נגנים, סולן וסולנית, והעובדים מצביעים מהטלפון ומכריעים. להצעת מחיר: 054-6738192.",
     events_body, "events", theme="theme-screen", og_img=OG["events"])

# ============================================================================
#  דף לרשויות ומחלקות תרבות (authorities.html), 24.11.2026
#  המסיבה הישראלית ראשונה: בלי מסך, בעברית, לבמת חוץ ולחגים. בלי מחירים באתר.
# ============================================================================
GOV_WA_TEXT = "היי, אשמח לפרטים ולהצעה למופע Soundclash לאירוע של הרשות."
GOV_SHOWS = [  # (slug, למה זה מתאים לרשות)
    ("israel", "לחמישי בפארק, לט״ו באב, ליום העצמאות ולחנוכה בקהילה. כולו בעברית, בלי מסך, ועובד גם בבמת חוץ."),
    ("screen", "להיכל התרבות ולסדרת המנויים: ערב נוצץ לבני 30 פלוס, עם מסך ווידאו מקורי לכל שיר."),
    ("90s", "לערבי צעירים, לפסטיבל בירה ולפאב הקהילתי. המופע שכבר עולה על הבמות, ואפשר לבוא לראות אותו לפני שמזמינים."),
]
def gov_shows():
    by = {f["slug"]: f for f in PUBLIC_FORMATS}
    cards = ""
    for slug, why in GOV_SHOWS:
        o = by[slug]
        cards += f"""<a class="format-card {o['css']} reveal" href="{o['file']}">
      {('<img class="card-logo" src="' + o['logo'] + '" alt="' + o['logo_alt'] + '" loading="lazy" width="300" height="360">') if o.get('logo') else ''}
      <h3>{o['name_html']}</h3>
      <p class="fc-for">{why}</p>
      <p class="fc-status">{o.get('status', '')}</p>
      <span class="go">לדף המופע ←</span>
    </a>"""
    return f"""<section id="formats">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">המופעים</div>
      <h2>בחרו את המופע לאירוע שלכם</h2>
      <p>אותו מנגנון בכל מופע: שיר מול שיר, והתושבים מכריעים מהטלפון. משנה רק הרפרטואר.</p>
    </div>
    <div class="formats-grid">{cards}</div>
    <p class="center mt-32 reveal" style="color:var(--text-dim)"><b style="color:var(--text)">מתנת השקה במסיבה הישראלית: דו־קרב לבחירתכם.</b> אתם בוחרים שני שירים, כל שיר שתרצו, למשל השיר שכל היישוב שר, והתושבים מכריעים. להזמנות שייחתמו עד 31.3.2027.</p>
  </div>
</section>"""

GOV_SPEC = [
    ("תשלום", "לפי נוהל הרשות, בתשלום שוטף, בלי מקדמה. החשבונית מופקת על ידי שחר חוויות חינוכיות בע״מ"),
    ("מחיר", "מחיר השקה להזמנות שייחתמו עד 31.3.2027, בלי תוספת על חגים"),
    ("אורך", "כ-90 דקות, או גרסה של 45 דקות. אפשר להוסיף חצי שעת מסיבה"),
    ("מה נדרש במקום", "מערכת הגברה עם איש סאונד, ותאורה סטנדרטית, באולם או בבמת חוץ. אין במקום? נביא משלנו, בתוספת תשלום"),
    ("מסך", "במסיבה הישראלית ובניינטיז לא צריך מסך: התוצאה עולה בטלפונים של הקהל. בסדרות נגד סרטים, או אם יש מסך במקום, מוסיפים סרטון אווירה לכל שיר ואת התוצאות על המסך הגדול"),
    ("אם הקליטה חלשה", "הקרב ממשיך: הקהל מצביע בדגלונים בצבעי שני הצדדים, וההכרעה מוכרזת מהבמה"),
    ("מה נאסף מהקהל", "כמעט כלום: בלי הורדה ובלי הרשמה. מי שרוצה כותב שם או כינוי, וכל מצביע מקבל מספר כרטיס אקראי להגרלה"),
]

gov_body = f"""
<section class="hero compact">
  {hero_photo(IMAGES[1][0])}
  <div class="hero-glow"></div>
  <div class="hero-seam"></div>
  <div class="hero-inner">
    <div class="eyebrow">לרשויות ומחלקות תרבות</div>
    <h1 class="as-h2">קרב מוזיקלי שהתושבים מכריעים</h1>
    <p class="lede">שישה נגנים, סולן וסולנית, להיטים שכל הקהל מכיר, וכל אחד מצביע מהטלפון בין שני צדדים. לבמת חוץ, לחגים, לערבי קהילה ולהיכל התרבות. ובסוף הערב יש לכם מספר אמיתי: כמה תושבים השתתפו.</p>
    <p class="status-line">מחיר השקה עד 31.3.2027 · בלי תוספת על חגים</p>
    <div class="cta-row center">
      <a class="btn btn-solid" href="tel:{PHONE_TEL}">{ICON["phone"]} {PHONE_MAIN}</a>
      <a class="btn btn-wa" href="{html.escape(wa_link(GOV_WA_TEXT), quote=True)}" target="_blank" rel="noopener">{ICON["wa"]} וואטסאפ</a>
      <a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>
    </div>
  </div>
</section>

{proof_strip()}
{gov_shows()}

<section id="packages">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">לאירוע הגדול של השנה</div>
      <h2>התושבים שלכם הם הכוכבים</h2>
      <p>אפשר להזמין את המופע לבד, או להפוך אותו לערב שלם.</p>
    </div>
    <div class="packages" style="grid-template-columns:1fr; max-width:520px; margin:0 auto">
      <article class="pkg reveal">
        <div class="pkg-tag latin">A NIGHT OF STARS</div>
        <h3>לילה של כוכבים</h3>
        <p class="pkg-for">לחנוכה בקהילה, לערב הוקרה למתנדבים או לאירוע השנתי של היישוב</p>
        <ul>
          <li>המופע המלא</li>
          <li>חצי שעת מסיבה אחרי ההכרזה</li>
          <li>5 תוספות לבחירה, כמו שטיח אדום, פסלוני זהב ופופקורן</li>
          <li>הנחה על התוספות ועל המסיבה</li>
        </ul>
      </article>
    </div>
  </div>
</section>

{mechanism_block(note=NOTE_NO_SCREEN, head="ככה מוכרע הקרב")}
{spec_block(GOV_SPEC, title="איך עובדים איתנו")}
{contact_band("רוצים את הקרב הזה אצלכם?",
              "ספרו לנו על האירוע: תאריך, מקום וגודל קהל משוער, ונחזור אליכם עם הצעה מסודרת.",
              '<a class="btn btn-outline" href="contact.html">לטופס ההזמנה</a>')}
"""
page("authorities.html", "Soundclash לרשויות ומחלקות תרבות — קרב מוזיקלי שהתושבים מכריעים",
     "מופע קרב מוזיקלי חי לרשויות, מועצות ומחלקות תרבות: מסיבה ישראלית, סדרות נגד סרטים וניינטיז. שישה נגנים, והתושבים מצביעים מהטלפון. לבמת חוץ, לחגים ולהיכל. 054-6738192.",
     gov_body, "authorities", theme="theme-il", og_img=OG["israel"])

# Y2K הוקפא (10.2026): הכתובת הישנה מפנה לדף הקרב הישראלי, כדי שקישורים ישנים לא יישברו
with open(os.path.join(OUT, "y2k.html"), "w", encoding="utf-8") as fh:
    fh.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">'
             '<meta http-equiv="refresh" content="0; url=israel.html"><link rel="canonical" href="https://soundclash.co.il/israel.html">'
             '<meta name="robots" content="noindex"><title>Soundclash</title></head>'
             '<body><p><a href="israel.html">לדף המופעים של Soundclash</a></p></body></html>')

print("נבנו הדפים:", ", ".join(sorted(f for f in os.listdir(OUT) if f.endswith(".html"))))

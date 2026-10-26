/* =========================================================================
   SOUNDCLASH · סדרות נגד סרטים — הגדרות
   זה הקובץ היחיד שצריך לערוך כדי לחבר את האפליקציה לשרת ההצבעות.
   ========================================================================= */
window.SC_CONFIG = {
  /* מזהה המופע. מופע חדש = מזהה חדש, וכל ההצבעות מתחילות מאפס.
     אפשר להשאיר קבוע ולאפס מתוך מסך האדמין. */
  SHOW_ID: "tv-vs-film",
  /* המופע שנפתח אם האדמין עוד לא בחר. הבחירה עצמה נעשית בראש מסך האדמין. */
  DEFAULT_SHOW: "tv-vs-film",

  /* חיבור ל-Firebase. כל עוד הערך ריק (null) האפליקציה רצה במצב הדגמה:
     הכל עובד בתוך הדפדפן הזה בלבד, עם "קהל וירטואלי" לחזרות.
     את הערכים מעתיקים מ-Firebase Console ← Project settings ← Your apps. */
  FIREBASE: {
    apiKey: "AIzaSyAanjQEqa4XIlRoj6aVNusM5cJja2tcVKU",
    authDomain: "soundclash-live.firebaseapp.com",
    projectId: "soundclash-live",
    storageBucket: "soundclash-live.firebasestorage.app",
    messagingSenderId: "1051896019803",
    appId: "1:1051896019803:web:eb50024d7f4908d04db87e"
  },
  /* דוגמה:
  FIREBASE: {
    apiKey: "AIza...",
    authDomain: "soundclash-live.firebaseapp.com",
    projectId: "soundclash-live",
    appId: "1:1234567890:web:abcdef"
  },
  */

  /* הכתובת שהקהל סורק ב-QR. ריק = הכתובת שממנה נפתח מסך הבמה, בלי /screen. */
  AUDIENCE_URL: "",

  /* תיקייה או כתובת שממנה נטענים סרטוני ה-AI, אם לא טוענים אותם מהמחשב.
     הקבצים נקראים לפי הקוד שמופיע ליד כל שיר באדמין, למשל 03-tv.mp4 */
  VIDEO_BASE_URL: "",
  VIDEO_EXT: "mp4",

  /* תמונות אווירה לכל שיר (מופיעות בטלפונים ובמסך ההצבעה). ריק = האיורים המובנים.
     אם מעלים תמונות AI משלכם לתיקייה באתר, שמים כאן את הכתובת שלה. שמות הקבצים כמו הסרטונים: 03-tv.jpg */
  ART_BASE_URL: "",
  ART_EXT: "jpg",

  /* ברירות מחדל לניהול */
  VOTE_SECONDS: 20,          /* במופע יש כ-20 שניות לכל היותר בין שירים */
  SHOW_LIVE_BARS: true,

  /* קוד כניסה לאדמין במצב הדגמה בלבד. במצב חי הכניסה היא עם המשתמש ב-Firebase. */
  DEMO_ADMIN_PIN: "",

  /* פרטי קשר שמופיעים לקהל בסוף המופע ובתפריט */
  CONTACT: {
    phoneYinon: "054-6738192",
    phoneNaama: "054-6589303",
    whatsapp: "https://wa.me/972546738192",
    site: "https://soundclash.co.il",
    instagram: "https://www.instagram.com/soundclash_rock_battle/",
    facebook: "https://www.facebook.com/profile.php?id=61589041324979",
    youtube: "https://www.youtube.com/@SoundclashmusicBattle"
  }
};

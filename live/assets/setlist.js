/* =========================================================================
   הסטליסט — גרסה 3 (23.10.2026): 10 דו־קרבות, סדרה מול סרט.
   first: מי מנוגן ראשון ("tv" או "film"). אפשר להחליף גם מתוך האדמין.
   scene: איפה השיר מופיע בסדרה או בסרט (מוצג לקהל בלחיצה על השיר)
   fact:  טריוויה קצרה
   art:   איור האווירה (art.js)
   singer: הערה פנימית לאדמין בלבד
   ========================================================================= */
window.SC_SETLIST = [
  {
    theme: "פתיחה בדואט", first: "tv", singer: "דואט",
    tv:   { title: "Don't Stop Believin'", artist: "Glee Cast", source: "גלי", sourceEn: "Glee", year: 2009, art: "glee",
            scene: "השיר שסוגר את פרק הפיילוט: מקהלת התיכון עולה לבמה בפעם הראשונה ומוכיחה שיש לה סיכוי.",
            fact: "המקור של Journey יצא ב-1981. הגרסה של גלי החזירה אותו למצעדים כמעט שלושים שנה אחר כך." },
    film: { title: "(I've Had) The Time of My Life", artist: "Bill Medley & Jennifer Warnes", source: "ריקוד מושחת", sourceEn: "Dirty Dancing", year: 1987, art: "dirtydancing",
            scene: "הריקוד הגדול בסוף הסרט, בערב הסיום של עונת הקיץ במלון.",
            fact: "השיר זכה באוסקר ובגלובוס הזהב לשיר המקורי הטוב ביותר." }
  },
  {
    theme: "הריקוד", first: "tv", singer: "הזמרת מול ינון",
    tv:   { title: "Fame", artist: "Irene Cara", source: "תהילה", sourceEn: "Fame (TV)", year: 1982, art: "fame",
            scene: "שיר הפתיחה של הסדרה על התלמידים של בית ספר לאמנויות הבמה בניו יורק.",
            fact: "השיר זכה באוסקר דווקא על הסרט מ-1980, אבל בישראל זוכרים אותו מהפתיח של הסדרה." },
    film: { title: "Stayin' Alive", artist: "Bee Gees", source: "קדחת מוצאי שבת", sourceEn: "Saturday Night Fever", year: 1977, art: "disco",
            scene: "סצנת הפתיחה: ג'ון טרבולטה צועד ברחוב בברוקלין בקצב של השיר.",
            fact: "הקצב של השיר קרוב לקצב העיסויים המומלץ בהחייאה, ולכן מדריכי עזרה ראשונה משתמשים בו כבר שנים." }
  },
  {
    theme: "נשיקה מרוז", first: "tv", singer: "ינון מול הזמרת",
    tv:   { title: "Kiss from a Rose", artist: "Seal", source: "קומיוניטי", sourceEn: "Community", year: 2009, art: "rose",
            scene: "סצנת הקריוקי של הדיקן וג'ף, אחד הרגעים המצחיקים בסדרה.",
            fact: "השיר של סיל הפך ללהיט עולמי אחרי שנכנס לפסקול של באטמן לנצח, וזכה בגראמי לשיר השנה." },
    film: { title: "My Heart Will Go On", artist: "Céline Dion", source: "טיטאניק", sourceEn: "Titanic", year: 1997, art: "titanic",
            scene: "שיר הנושא של הסרט, שמתנגן בסוף, כשהסיפור של ג'ק ורוז נסגר.",
            fact: "ג'יימס קמרון לא רצה שיר עם מילים בסרט. המלחין ג'יימס הורנר הקליט בשקט דמו עם סלין דיון, והשיר זכה באוסקר." }
  },
  {
    theme: "להיות הכי טוב", first: "film", singer: "ינון",
    tv:   { title: "Pokémon Theme", artist: "Jason Paige", source: "פוקימון", sourceEn: "Pokémon", year: 1998, art: "pokemon",
            scene: "שיר הפתיחה של הסדרה. אצלנו הפזמון האחרון בעברית, כמו בגרסה הישראלית.",
            fact: "את הפתיח באנגלית שר ג'ייסון פייג', והוא נשאר אחד משירי הפתיחה המוכרים בעולם." },
    film: { title: "Eye of the Tiger", artist: "Survivor", source: "רוקי 3", sourceEn: "Rocky III", year: 1982, art: "rocky",
            scene: "השיר שמלווה את רוקי באימונים ובקרבות של הסרט.",
            fact: "סטאלון פנה ל-Survivor אחרי שלא קיבל אישור להשתמש ב-\"Another One Bites the Dust\" של קווין." }
  },
  {
    theme: "אמא", first: "film", singer: "הזמרת מול ינון",
    tv:   { title: "500 Miles (I'm Gonna Be)", artist: "The Proclaimers", source: "איך פגשתי את אמא", sourceEn: "How I Met Your Mother", year: 2005, art: "road",
            scene: "השיר שמרשל וטד שרים בנסיעות ארוכות, ושהפך לשיר הדרך של החבורה.",
            fact: "The Proclaimers הם צמד אחים תאומים מסקוטלנד, והשיר יצא ב-1988." },
    film: { title: "Mamma Mia", artist: "ABBA", source: "ממה מיה!", sourceEn: "Mamma Mia!", year: 2008, art: "greece",
            scene: "השיר שדונה שרה כשהיא מגלה ששלושת הגברים מהעבר שלה הגיעו לאי.",
            fact: "אבבא הוציאו את השיר ב-1975. המחזמר עלה בלונדון ב-1999, והסרט עם מריל סטריפ יצא ב-2008." }
  },
  {
    theme: "קרב האגדות", first: "tv", singer: "הזמרת",
    tv:   { title: "מחרוזת אילנית", artist: "אילנית", source: "הקוסם מארץ עוץ · הלב", sourceEn: "פתיחי הטלוויזיה החינוכית", year: null, hebrew: true, art: "rainbow",
            medley: ["הקוסם מארץ עוץ", "הלב"],
            scene: "שני שירי פתיחה של סדרות שליוו ילדות שלמה בטלוויזיה החינוכית.",
            fact: "שני פתיחים שכל ילד ישראלי ידע בעל פה, בקולה של אילנית, ברצף אחד." },
    film: { title: "Holding Out for a Hero", artist: "Bonnie Tyler", source: "פוטלוס", sourceEn: "Footloose", year: 1984, art: "hero",
            scene: "בפוטלוס הוא מלווה את תחרות הטרקטורים, ובשרק 2 הפיה הסנדקית שרה אותו בשיא הסרט.",
            fact: "ג'ים סטיינמן ודין פיצ'פורד כתבו את השיר במיוחד לפוטלוס." }
  },
  {
    theme: "סוף הניינטיז", first: "tv", singer: "ינון",
    tv:   { title: "I Want It That Way", artist: "Backstreet Boys", source: "ברוקלין 99", sourceEn: "Brooklyn Nine-Nine", year: 2013, art: "lineup",
            scene: "סצנת המסדר: החשודים מתבקשים לומר משפט מהשיר, ובסוף שרים אותו יחד.",
            fact: "השיר של הבקסטריט בויז יצא ב-1999 והגיע למקום הראשון ביותר מעשרים מדינות." },
    film: { title: "I Don't Want to Miss a Thing", artist: "Aerosmith", source: "ארמגדון", sourceEn: "Armageddon", year: 1998, art: "space",
            scene: "שיר האהבה של הסרט, שמלווה את הסיפור של הזוג על רקע המשימה להציל את כדור הארץ.",
            fact: "את השיר כתבה דיאן וורן, והוא נכנס ישר למקום הראשון בארה\"ב. בסרט משחקת ליב טיילר, הבת של סטיבן טיילר." }
  },
  {
    theme: "תל אביב מול תל אביב", first: "film", singer: "הזמרת מול ינון",
    tv:   { title: "מכה אפורה", artist: "מוניקה סקס", source: "פלורנטין", sourceEn: "Florentin", year: 1997, hebrew: true, art: "rooftops",
            scene: "השיר שמזוהה עם פלורנטין, הסדרה על חבורת צעירים בשכונה התל אביבית.",
            fact: "פלורנטין של איתן פוקס הפכה לסדרת הפולחן של תל אביב של סוף שנות ה-90." },
    film: { title: "לגור איתו", artist: "ריקי גל", source: "דיזנגוף 99", sourceEn: "Dizengoff 99", year: 1979, hebrew: true, art: "bauhaus",
            scene: "מתוך הפסקול של הסרט על שלושה צעירים שחולקים דירה ברחוב דיזנגוף.",
            fact: "דיזנגוף 99 של אבי נשר הוא אחד מסרטי הפולחן של הקולנוע הישראלי." }
  },
  {
    theme: "מסיבת ריקודים", first: "tv", singer: "הזמרת",
    tv:   { title: "Bad Romance", artist: "Lady Gaga", source: "גוסיפ גירל", sourceEn: "Gossip Girl", year: 2009, art: "gaga",
            scene: "בעונה 3, פרק 10, ליידי גאגה מופיעה בעצמה בסדרה ושרה את השיר.",
            fact: "הקליפ של Bad Romance היה בזמנו אחד הסרטונים הנצפים ביותר ביוטיוב." },
    film: { title: "It's Raining Men", artist: "Geri Halliwell", source: "היומן של ברידג'ט ג'ונס", sourceEn: "Bridget Jones's Diary", year: 2001, art: "rain",
            scene: "הגרסה של ג'רי האליוול נכנסה לפסקול של הסרט והגיעה למקום הראשון בבריטניה.",
            fact: "המקור של The Weather Girls יצא ב-1982. אחד הכותבים היה פול שייפר, מנהל הלהקה של דייוויד לטרמן." }
  },
  {
    theme: "הדרן: חברים", first: "tv", singer: "ינון",
    tv:   { title: "I'll Be There for You", artist: "The Rembrandts", source: "חברים", sourceEn: "Friends", year: 1994, art: "friends",
            scene: "שיר הפתיחה של הסדרה, עם הריקוד של ששת החברים.",
            fact: "בהתחלה היה רק פתיח של פחות מדקה. תחנת רדיו אמריקאית שידרה אותו בלופ, והביקוש הכריח את הלהקה להקליט שיר מלא." },
    film: { title: "I'm a Believer", artist: "Smash Mouth", source: "שרק", sourceEn: "Shrek", year: 2001, art: "swamp",
            scene: "המסיבה שסוגרת את הסרט, וגם אצלנו היא סוגרת את המופע.",
            fact: "ניל דיימונד כתב את השיר, והמונקיז הפכו אותו ללהיט ב-1966." }
  }
];

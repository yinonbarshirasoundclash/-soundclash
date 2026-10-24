/* =========================================================================
   הסטליסט: 10 דו־קרבות, סדרה מול סרט.
   first: מי מנוגן ראשון בדו־קרב ("tv" או "film"). אפשר להחליף גם מתוך האדמין.
   fact: הטריוויה שמופיעה לקהל מתחת ל-💡
   singer: הערה פנימית לאדמין בלבד
   ========================================================================= */
window.SC_SETLIST = [
  {
    theme: "פתיחה בדואט", first: "tv", singer: "דואט",
    tv:   { title: "Don't Stop Believin'", artist: "Glee Cast", source: "גלי", sourceEn: "Glee", year: 2009,
            fact: "Journey הוציאו את השיר ב-1981. השחקנים של גלי סגרו איתו את פרק הפיילוט, והוא הפך לשיר המזוהה ביותר עם הסדרה." },
    film: { title: "(I've Had) The Time of My Life", artist: "Bill Medley & Jennifer Warnes", source: "ריקוד מושחת", sourceEn: "Dirty Dancing", year: 1987,
            fact: "השיר מהסצנה האחרונה, עם ההרמה המפורסמת, זכה באוסקר ובגלובוס הזהב לשיר המקורי הטוב ביותר." }
  },
  {
    theme: "הריקוד", first: "tv", singer: "ינון",
    tv:   { title: "It's Not Unusual", artist: "Tom Jones", source: "הנסיך המדליק", sourceEn: "The Fresh Prince of Bel-Air", year: 1990,
            fact: "ריקוד קרלטון נולד על השיר הזה. אלפונסו ריביירו סיפר שהוא שאב השראה מהקליפ \"Dancing in the Dark\" של ברוס ספרינגסטין." },
    film: { title: "Stayin' Alive", artist: "Bee Gees", source: "קדחת מוצאי שבת", sourceEn: "Saturday Night Fever", year: 1977,
            fact: "הקצב של השיר קרוב לקצב העיסויים המומלץ בהחייאה, ולכן מדריכי עזרה ראשונה משתמשים בו כבר שנים." }
  },
  {
    theme: "להציל חיים", first: "film", singer: "ינון מול הזמרת",
    tv:   { title: "How to Save a Life", artist: "The Fray", source: "האנטומיה של גריי", sourceEn: "Grey's Anatomy", year: 2005,
            fact: "הסולן אייזק סלייד כתב את השיר אחרי שליווה כמנטור נער במצוקה. בזכות האנטומיה של גריי הוא הפך ללהיט עולמי." },
    film: { title: "My Heart Will Go On", artist: "Céline Dion", source: "טיטאניק", sourceEn: "Titanic", year: 1997,
            fact: "ג'יימס קמרון לא רצה שיר עם מילים בסרט. המלחין ג'יימס הורנר הקליט בשקט דמו עם סלין דיון, והשיר זכה באוסקר." }
  },
  {
    theme: "להיות הכי טוב", first: "tv", singer: "ינון",
    tv:   { title: "Pokémon Theme", artist: "Jason Paige", source: "פוקימון", sourceEn: "Pokémon", year: 1998,
            fact: "את הפתיח באנגלית שר ג'ייסון פייג'. אצלנו הפזמון האחרון בעברית, כמו בגרסה הישראלית." },
    film: { title: "Eye of the Tiger", artist: "Survivor", source: "רוקי 3", sourceEn: "Rocky III", year: 1982,
            fact: "סטאלון פנה ל-Survivor אחרי שלא קיבל אישור להשתמש ב-\"Another One Bites the Dust\" של קווין." }
  },
  {
    theme: "לא נכנעים", first: "tv", singer: "ינון מול הזמרת",
    tv:   { title: "Bella Ciao", artist: "La Casa de Papel", source: "בית הנייר", sourceEn: "Money Heist", year: 2017,
            fact: "שיר הפרטיזנים האיטלקי ממלחמת העולם השנייה. בית הנייר החזיר אותו למצעדים בכל העולם." },
    film: { title: "This Is Me", artist: "Keala Settle", source: "הגדול מכולם", sourceEn: "The Greatest Showman", year: 2017,
            fact: "את השיר כתבו פסק ופול, צמד הכותבים של לה לה לנד. הוא זכה בגלובוס הזהב והיה מועמד לאוסקר." }
  },
  {
    theme: "סוף הניינטיז", first: "tv", singer: "ינון",
    tv:   { title: "I Want It That Way", artist: "Backstreet Boys", source: "ברוקלין 99", sourceEn: "Brooklyn Nine-Nine", year: 2013,
            fact: "בסצנת המסדר החשודים מתבקשים לומר משפט מהשיר, ובסוף שרים אותו יחד. אחת הסצנות הכי מצוטטות בסדרה." },
    film: { title: "I Don't Want to Miss a Thing", artist: "Aerosmith", source: "ארמגדון", sourceEn: "Armageddon", year: 1998,
            fact: "את השיר כתבה דיאן וורן, והוא נכנס ישר למקום הראשון בארה\"ב. בסרט משחקת ליב טיילר, הבת של סטיבן טיילר." }
  },
  {
    theme: "קרב האגדות", first: "tv", singer: "הזמרת מול ינון",
    tv:   { title: "מחרוזת אילנית", artist: "אילנית", source: "הקוסם מארץ עוץ · הלב", sourceEn: "פתיחי הטלוויזיה החינוכית", year: null, hebrew: true,
            medley: ["הקוסם מארץ עוץ", "הלב"],
            fact: "שני פתיחים שכל ילד ישראלי ידע בעל פה, בקולה של אילנית, ברצף אחד." },
    film: { title: "I'm a Believer", artist: "Smash Mouth", source: "שרק", sourceEn: "Shrek", year: 2001,
            fact: "ניל דיימונד כתב את השיר, והמונקיז הפכו אותו ללהיט ב-1966. Smash Mouth הקליטו אותו מחדש לשרק." }
  },
  {
    theme: "מישהו שיהיה שם", first: "tv", singer: "ינון מול הזמרת",
    tv:   { title: "I'll Be There for You", artist: "The Rembrandts", source: "חברים", sourceEn: "Friends", year: 1994,
            fact: "בהתחלה היה רק פתיח של פחות מדקה. תחנת רדיו אמריקאית שידרה אותו בלופ, והביקוש הכריח את הלהקה להקליט שיר מלא." },
    film: { title: "Holding Out for a Hero", artist: "Bonnie Tyler", source: "פוטלוס", sourceEn: "Footloose", year: 1984,
            fact: "ג'ים סטיינמן ודין פיצ'פורד כתבו את השיר במיוחד לפוטלוס. עשרים שנה אחר כך הוא חזר בשרק 2." }
  },
  {
    theme: "תל אביב מול תל אביב", first: "tv", singer: "ינון מול הזמרת",
    tv:   { title: "מכה אפורה", artist: "מוניקה סקס", source: "פלורנטין", sourceEn: "Florentin", year: 1997, hebrew: true,
            fact: "פלורנטין של איתן פוקס הפכה לסדרת הפולחן של תל אביב של סוף שנות ה-90." },
    film: { title: "לגור איתו", artist: "ריקי גל", source: "דיזנגוף 99", sourceEn: "Dizengoff 99", year: 1979, hebrew: true,
            fact: "דיזנגוף 99 של אבי נשר הוא אחד מסרטי הפולחן של הקולנוע הישראלי, והפסקול שלו ליווה דור שלם." }
  },
  {
    theme: "המנונים לרחבה", first: "tv", singer: "הזמרת",
    tv:   { title: "Fame", artist: "Irene Cara", source: "תהילה", sourceEn: "Fame (TV)", year: 1982,
            fact: "השיר זכה באוסקר דווקא על הסרט מ-1980, אבל בישראל זוכרים אותו מהפתיח של הסדרה." },
    film: { title: "It's Raining Men", artist: "Geri Halliwell", source: "היומן של ברידג'ט ג'ונס", sourceEn: "Bridget Jones's Diary", year: 2001,
            fact: "המקור של The Weather Girls יצא ב-1982. אחד הכותבים היה פול שייפר, מנהל הלהקה של דייוויד לטרמן." }
  }
];

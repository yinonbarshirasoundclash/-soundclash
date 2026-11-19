# -*- coding: utf-8 -*-
"""הורדה חד-פעמית של תמונות הבמה מוויקס אל המאגר (19.11.2026).
רץ ב-GitHub Actions. יוצר assets/img/stage/<id>-800.webp, -1600.webp ו-<id>-og.jpg (1200x630)."""
import os, re, io, urllib.request
from PIL import Image
OUT = "assets/img/stage"
os.makedirs(OUT, exist_ok=True)
src = open("build.py", encoding="utf-8").read()
ids = re.findall(r'6340ee_([0-9a-f]+)~mv2\.jpg', src)
seen = []
for i in ids:
    if i not in seen: seen.append(i)
for i in seen:
    url = f"https://static.wixstatic.com/media/6340ee_{i}~mv2.jpg"
    data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read()
    im = Image.open(io.BytesIO(data)).convert("RGB")
    short = i[:8]
    for w in (800, 1600):
        r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(f"{OUT}/{short}-{w}.webp", "WEBP", quality=80, method=6)
    # גרסת שיתוף 1200x630, חתוכה למרכז
    tw, th = 1200, 630
    s = max(tw / im.width, th / im.height)
    r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (r.width - tw) // 2, (r.height - th) // 3
    r.crop((l, t, l + tw, t + th)).save(f"{OUT}/{short}-og.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    open(f"{OUT}/{short}.size", "w").write(f"{im.width}x{im.height}")
    print(i, im.size, len(data))

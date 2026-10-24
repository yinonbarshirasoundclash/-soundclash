/* =========================================================================
   ART — original atmosphere illustrations, one per song, drawn in code.
   No characters, faces, logos or recreated scenes: mood only.
   Your own AI stills override these: name them like the video keys
   (03-tv.jpg, 03-film.png …) and load them on the screen, or host them at ART_BASE_URL.
   ========================================================================= */
(function () {
  "use strict";
  const W = 960, H = 540;
  const cache = {};
  const overrides = {};   // key -> url (filled by the stage screen from a local folder)

  function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function lin(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function rad(ctx, x, y, r0, r1, stops) { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function fill(ctx, style) { ctx.fillStyle = style; ctx.fillRect(0, 0, W, H); }
  function stars(ctx, r, n, color, maxY) { ctx.fillStyle = color || "#fff"; for (let i = 0; i < n; i++) { const s = r() * 2 + .4; ctx.globalAlpha = .3 + r() * .7; ctx.fillRect(r() * W, r() * (maxY || H), s, s); } ctx.globalAlpha = 1; }
  function glow(ctx, x, y, rr, color, a) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = rad(ctx, x, y, 0, rr, [[0, color], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); ctx.restore(); }
  function beam(ctx, x, y, ang, spread, len, color, a) {
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a || .35;
    const x1 = x + Math.cos(ang - spread) * len, y1 = y + Math.sin(ang - spread) * len, x2 = x + Math.cos(ang + spread) * len, y2 = y + Math.sin(ang + spread) * len;
    ctx.fillStyle = lin(ctx, x, y, (x1 + x2) / 2, (y1 + y2) / 2, [[0, color], [1, "rgba(0,0,0,0)"]]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function poly(ctx, pts, style) { ctx.fillStyle = style; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); }
  function heart(ctx, x, y, s, style) {
    ctx.fillStyle = style; ctx.beginPath(); ctx.moveTo(x, y + s * .3);
    ctx.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3); ctx.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s);
    ctx.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3); ctx.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); ctx.fill();
  }
  function skyline(ctx, r, base, minH, maxH, color, winColor, winP) {
    let x = -10;
    while (x < W + 10) {
      const w = 30 + r() * 70, hh = minH + r() * (maxH - minH);
      ctx.fillStyle = color; ctx.fillRect(x, base - hh, w, hh + 2);
      if (winColor) { ctx.fillStyle = winColor; for (let wy = base - hh + 8; wy < base - 6; wy += 12) for (let wx = x + 6; wx < x + w - 6; wx += 10) if (r() < (winP || .25)) ctx.fillRect(wx, wy, 4, 6); }
      x += w + r() * 6;
    }
  }
  function finish(ctx, r) {
    // grain + vignette, so every piece reads as one family
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = rad(ctx, W / 2, H / 2, H * .35, W * .75, [[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.6)"]]); ctx.fillRect(0, 0, W, H);
  }

  const P = {
    /* 01 · פתיחה בדואט */
    "01-tv"(c, r) { // show-choir stage: curtains, spotlights, a lone mic
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1a0612"], [1, "#3b0a1e"]]));
      for (let i = 0; i < 14; i++) { const x = i < 7 ? i * 28 : W - (i - 7) * 28 - 28; c.fillStyle = lin(c, x, 0, x + 28, 0, [[0, "#5e0f24"], [.5, "#a3203d"], [1, "#4a0b1c"]]); c.fillRect(x, 0, 30, H); }
      beam(c, W * .35, -40, Math.PI * .58, .16, 700, "#ffe6b8", .45); beam(c, W * .65, -40, Math.PI * .42, .16, 700, "#ffd4f0", .4); beam(c, W * .5, -60, Math.PI / 2, .12, 700, "#fff3d6", .5);
      c.fillStyle = rad(c, W / 2, H * .9, 10, 300, [[0, "rgba(255,230,190,.55)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(0, H * .6, W, H * .4);
      c.fillStyle = "#0b0507"; c.fillRect(W / 2 - 3, H * .42, 6, H * .5); c.fillRect(W / 2 - 40, H * .9, 80, 8);
      c.beginPath(); c.ellipse(W / 2, H * .4, 14, 22, 0, 0, 7); c.fill(); glow(c, W / 2, H * .38, 60, "rgba(255,240,210,.7)");
      stars(c, r, 60, "#ffe9c9", H * .5);
    },
    "01-film"(c, r) { // summer-camp dance night: string lights over a lake at dusk
      fill(c, lin(c, 0, 0, 0, H, [[0, "#13233d"], [.55, "#c86a45"], [.62, "#e89a5c"], [1, "#2a1a1f"]]));
      c.fillStyle = "#1d2433"; c.beginPath(); c.moveTo(0, H * .6); for (let x = 0; x <= W; x += 40) c.lineTo(x, H * .6 - 40 - Math.sin(x / 120) * 30 - r() * 20); c.lineTo(W, H * .62); c.lineTo(0, H * .62); c.fill();
      c.fillStyle = lin(c, 0, H * .62, 0, H, [[0, "#d98a56"], [1, "#1b1418"]]); c.fillRect(0, H * .62, W, H);
      for (let y = H * .64; y < H; y += 8) { c.fillStyle = "rgba(255,210,160," + (.25 * (1 - (y - H * .64) / (H * .36))) + ")"; c.fillRect(W * .3 + r() * 80, y, 200 + r() * 160, 2); }
      [[-.1, .1], [0.15, .22], [.5, .08]].forEach(([o, sag]) => {
        for (let i = 0; i <= 24; i++) { const t = i / 24, x = W * (o + t * 1.1), y = H * (sag + Math.sin(t * Math.PI) * .16); glow(c, x, y, 18, "rgba(255,214,140,.9)"); c.fillStyle = "#fff1cf"; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
      });
      stars(c, r, 40, "#fff", H * .3);
    },
    /* 02 · הריקוד */
    "02-tv"(c, r) { // sixties lounge: sunburst + spinning vinyl
      fill(c, "#0f2a2e");
      for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; c.fillStyle = i % 2 ? "#e8813a" : "#f2b04a"; c.beginPath(); c.moveTo(W * .3, H * .55); c.arc(W * .3, H * .55, 900, a, a + Math.PI / 36); c.fill(); }
      c.fillStyle = rad(c, W * .3, H * .55, 0, 700, [[0, "rgba(15,42,46,0)"], [1, "rgba(15,42,46,.9)"]]); fill(c, c.fillStyle);
      c.fillStyle = "#0a0a0a"; c.beginPath(); c.arc(W * .68, H * .55, 190, 0, 7); c.fill();
      c.strokeStyle = "rgba(255,255,255,.07)"; for (let rr = 70; rr < 188; rr += 6) { c.beginPath(); c.arc(W * .68, H * .55, rr, 0, 7); c.stroke(); }
      c.fillStyle = "#e24b3b"; c.beginPath(); c.arc(W * .68, H * .55, 60, 0, 7); c.fill(); c.fillStyle = "#0a0a0a"; c.beginPath(); c.arc(W * .68, H * .55, 6, 0, 7); c.fill();
      c.fillStyle = "rgba(255,255,255,.12)"; c.beginPath(); c.moveTo(W * .68, H * .55); c.arc(W * .68, H * .55, 188, -1.2, -.7); c.fill();
    },
    "02-film"(c, r) { // lit-up disco floor in perspective + mirror ball
      fill(c, "#07030c");
      const cols = ["#ff3d7f", "#ffd23d", "#3dd6ff", "#a04dff", "#ff8a3d", "#5dff9a"];
      for (let row = 0; row < 9; row++) for (let col = -8; col < 9; col++) {
        const z0 = 1 + row * .55, z1 = z0 + .55, y0 = H * .45 + 260 / z0 - 40, y1 = H * .45 + 260 / z1 - 40;
        const xa = W / 2 + col * 120 / z0, xb = W / 2 + (col + 1) * 120 / z0, xc = W / 2 + (col + 1) * 120 / z1, xd = W / 2 + col * 120 / z1;
        c.globalAlpha = .35 + r() * .6 * (1 - row / 10); poly(c, [[xa, y0], [xb, y0], [xc, y1], [xd, y1]], cols[Math.floor(r() * cols.length)]);
      }
      c.globalAlpha = 1; c.fillStyle = lin(c, 0, 0, 0, H * .6, [[0, "#140822"], [1, "rgba(7,3,12,0)"]]); c.fillRect(0, 0, W, H * .6);
      const bx = W / 2, by = H * .2, br = 70;
      c.fillStyle = "#c9c9d6"; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill();
      for (let i = 0; i < 160; i++) { const a = r() * 7, d = Math.sqrt(r()) * br * .95; c.fillStyle = r() < .2 ? "#fff" : "rgba(80,80,100," + r() + ")"; c.fillRect(bx + Math.cos(a) * d - 4, by + Math.sin(a) * d - 4, 8, 8); }
      c.fillStyle = "#888"; c.fillRect(bx - 1, 0, 2, by - br);
      for (let i = 0; i < 14; i++) beam(c, bx, by, r() * Math.PI * 2, .02, 600, cols[i % cols.length], .25);
      glow(c, bx - 20, by - 25, 40, "rgba(255,255,255,.9)");
    },
    /* 03 · להציל חיים */
    "03-tv"(c, r) { // hospital at night: a glowing heartbeat line across lit windows
      fill(c, lin(c, 0, 0, 0, H, [[0, "#06121f"], [1, "#0d2236"]]));
      for (let y = 40; y < H; y += 54) for (let x = 20; x < W; x += 74) { c.fillStyle = r() < .35 ? "rgba(140,200,255," + (.15 + r() * .35) + ")" : "rgba(255,255,255,.04)"; c.fillRect(x, y, 56, 36); }
      c.save(); c.globalCompositeOperation = "lighter";
      const line = (lw, col) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); let x = 0; c.moveTo(0, H * .55);
        while (x < W) { c.lineTo(x += 90, H * .55); c.lineTo(x += 14, H * .5); c.lineTo(x += 14, H * .55); c.lineTo(x += 12, H * .3); c.lineTo(x += 16, H * .72); c.lineTo(x += 12, H * .55); c.lineTo(x += 30, H * .55); c.lineTo(x += 16, H * .48); c.lineTo(x += 16, H * .55); }
        c.stroke(); };
      line(18, "rgba(80,255,190,.12)"); line(8, "rgba(80,255,190,.3)"); line(3, "#b8ffe4"); c.restore();
      glow(c, W * .82, H * .2, 90, "rgba(255,80,80,.35)"); c.fillStyle = "rgba(255,120,120,.85)"; c.fillRect(W * .82 - 8, H * .2 - 26, 16, 52); c.fillRect(W * .82 - 26, H * .2 - 8, 52, 16);
    },
    "03-film"(c, r) { // open ocean at sunset, a distant liner glowing on the horizon
      fill(c, lin(c, 0, 0, 0, H * .58, [[0, "#1d1440"], [.6, "#d4566b"], [1, "#ffb36b"]]));
      glow(c, W * .7, H * .56, 220, "rgba(255,200,120,.8)"); c.fillStyle = "#ffe2a8"; c.beginPath(); c.arc(W * .7, H * .56, 46, Math.PI, 0); c.fill();
      c.fillStyle = lin(c, 0, H * .58, 0, H, [[0, "#ef8a6a"], [.3, "#3a2a55"], [1, "#0c0b1c"]]); c.fillRect(0, H * .58, W, H);
      for (let y = H * .6; y < H; y += 6) { c.fillStyle = "rgba(255,200,140," + (.5 * (1 - (y - H * .6) / (H * .4))) + ")"; const w = 40 + r() * 140; c.fillRect(W * .7 - w / 2 + (r() - .5) * 60, y, w, 2); }
      c.fillStyle = "#120c1c"; const sx = W * .22, sy = H * .58; poly(c, [[sx - 120, sy - 4], [sx + 120, sy - 4], [sx + 100, sy + 10], [sx - 110, sy + 10]], "#120c1c"); c.fillRect(sx - 70, sy - 20, 140, 16);
      [-40, -5, 30, 65].forEach(dx => { c.fillStyle = "#120c1c"; c.fillRect(sx + dx - 7, sy - 44, 14, 26); });
      for (let i = 0; i < 22; i++) { c.fillStyle = "rgba(255,226,160,.9)"; c.fillRect(sx - 100 + i * 9, sy - 1, 3, 2); }
      stars(c, r, 50, "#fff", H * .3);
    },
    /* 04 · להיות הכי טוב */
    "04-tv"(c, r) { // bright adventure: lightning, rays and rolling green hills
      fill(c, lin(c, 0, 0, 0, H, [[0, "#3aa0ff"], [1, "#bfe7ff"]]));
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; c.fillStyle = "rgba(255,255,255,.14)"; c.beginPath(); c.moveTo(W * .5, H * .4); c.arc(W * .5, H * .4, 900, a, a + .12); c.fill(); }
      glow(c, W * .5, H * .4, 260, "rgba(255,240,120,.8)");
      poly(c, [[W * .53, H * .05], [W * .42, H * .45], [W * .5, H * .45], [W * .45, H * .8], [W * .6, H * .33], [W * .52, H * .33], [W * .58, H * .05]], "#ffd21e");
      c.strokeStyle = "#e08f00"; c.lineWidth = 5; c.stroke();
      [["#58c24a", .72, 50], ["#3fa83a", .8, 40], ["#2f8f31", .9, 30]].forEach(([col, base, amp]) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * base - Math.sin(x / 140 + base * 9) * amp); c.lineTo(W, H); c.fill(); });
      for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(255,255,255,.9)"; const x = r() * W, y = r() * H * .6, s = 2 + r() * 4; c.fillRect(x - s, y, s * 2, 1.5); c.fillRect(x, y - s, 1.5, s * 2); }
    },
    "04-film"(c, r) { // the ring at night: ropes, one hard spotlight, tiger stripes at the edges
      fill(c, "#0b0605");
      beam(c, W / 2, -80, Math.PI / 2, .3, 700, "#fff2d6", .5);
      c.fillStyle = rad(c, W / 2, H * .82, 10, 420, [[0, "rgba(255,236,200,.5)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(0, H * .5, W, H * .5);
      ["#d42b1e", "#f2efe8", "#2246b3"].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 7; c.beginPath(); c.moveTo(-20, H * (.52 + i * .1)); c.quadraticCurveTo(W / 2, H * (.56 + i * .1), W + 20, H * (.52 + i * .1)); c.stroke(); });
      c.fillStyle = "#1a1a1a"; c.fillRect(W * .08, H * .45, 16, H * .5); c.fillRect(W * .9, H * .45, 16, H * .5);
      // tiger stripes framing both edges
      [0, 1].forEach(side => {
        const x0 = side ? W : 0, dir = side ? -1 : 1;
        c.fillStyle = lin(c, x0, 0, x0 + dir * 170, 0, [[0, "rgba(232,137,28,.95)"], [1, "rgba(232,137,28,0)"]]); c.fillRect(side ? W - 170 : 0, 0, 170, H);
        c.fillStyle = "#0b0605";
        for (let k = 0; k < 9; k++) { const y = 20 + k * 62 + r() * 14, len = 90 + r() * 70, th = 12 + r() * 10;
          c.beginPath(); c.moveTo(x0, y - th); c.quadraticCurveTo(x0 + dir * len * .6, y - th * .6 + 14, x0 + dir * len, y + 18); c.quadraticCurveTo(x0 + dir * len * .5, y + th * .3 + 10, x0, y + th); c.fill(); }
      });
      glow(c, W / 2, H * .1, 80, "rgba(255,255,255,.7)");
    },
    /* 05 · לא נכנעים */
    "05-tv"(c, r) { // the vault: red light, a heavy round door, bills in the air
      fill(c, lin(c, 0, 0, W, H, [[0, "#2a0505"], [1, "#0c0202"]]));
      glow(c, W * .62, H * .5, 380, "rgba(220,30,30,.55)");
      const vx = W * .62, vy = H * .52;
      for (let rr = 230; rr > 40; rr -= 30) { c.strokeStyle = "rgba(255,120,110," + (.12 + (230 - rr) / 900) + ")"; c.lineWidth = 10; c.beginPath(); c.arc(vx, vy, rr, 0, 7); c.stroke(); }
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.strokeStyle = "rgba(255,170,160,.5)"; c.lineWidth = 12; c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx + Math.cos(a) * 110, vy + Math.sin(a) * 110); c.stroke(); }
      c.fillStyle = "#4d0a0a"; c.beginPath(); c.arc(vx, vy, 36, 0, 7); c.fill();
      for (let i = 0; i < 26; i++) { c.save(); c.translate(r() * W * .55, r() * H); c.rotate(r() * 3); c.fillStyle = "rgba(170,210,160," + (.35 + r() * .4) + ")"; c.fillRect(-34, -16, 68, 32); c.strokeStyle = "rgba(255,255,255,.3)"; c.strokeRect(-28, -11, 56, 22); c.restore(); }
    },
    "05-film"(c, r) { // the big top: striped tent, spotlights, gold confetti
      fill(c, "#12060a");
      for (let i = -10; i < 11; i++) { c.fillStyle = i % 2 ? "#b3172c" : "#f1e6d2"; c.beginPath(); c.moveTo(W / 2, -40); c.lineTo(W / 2 + i * 70, H); c.lineTo(W / 2 + (i + 1) * 70, H); c.closePath(); c.fill(); }
      c.fillStyle = rad(c, W / 2, H * .3, 40, 620, [[0, "rgba(18,6,10,.0)"], [1, "rgba(18,6,10,.92)"]]); fill(c, c.fillStyle);
      beam(c, W * .2, H, -Math.PI * .38, .09, 700, "#fff0c4", .4); beam(c, W * .8, H, -Math.PI * .62, .09, 700, "#fff0c4", .4);
      glow(c, W / 2, H * .45, 160, "rgba(255,220,150,.6)");
      for (let i = 0; i < 160; i++) { c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 3); c.fillStyle = r() < .7 ? "#f5c451" : "#fff"; c.globalAlpha = .5 + r() * .5; c.fillRect(-4, -2, 8, 4); c.restore(); }
    },
    /* 06 · סוף הניינטיז */
    "06-tv"(c, r) { // the lineup wall: height lines and five pools of light
      fill(c, lin(c, 0, 0, 0, H, [[0, "#14262c"], [1, "#1d1a16"]]));
      c.strokeStyle = "rgba(220,235,245,.35)"; c.lineWidth = 2;
      for (let i = 0; i < 12; i++) { const y = 60 + i * 34; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); c.lineWidth = i % 2 ? 1 : 3; }
      for (let x = 0; x < W; x += 24) { c.fillStyle = "rgba(220,235,245,.25)"; c.fillRect(x, 60, 2, 8); }
      for (let i = 0; i < 5; i++) { const x = W * (.14 + i * .18); beam(c, x, -30, Math.PI / 2, .14, 620, "#d8f0ff", .28); c.fillStyle = rad(c, x, H * .92, 5, 120, [[0, "rgba(216,240,255,.35)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(x - 120, H * .7, 240, H * .3); }
      c.fillStyle = "rgba(10,14,18,.8)"; c.fillRect(0, H * .86, W, H * .14);
      glow(c, W * .9, H * .1, 70, "rgba(120,190,255,.4)");
    },
    "06-film"(c, r) { // deep space: the earth's edge, a burning asteroid, sunrise flare
      fill(c, "#020309"); stars(c, r, 380, "#fff");
      c.fillStyle = rad(c, W * .5, H * 2.25, H * 1.6, H * 1.85, [[0, "#1d4f9e"], [.92, "#4aa0ff"], [1, "rgba(80,160,255,0)"]]); c.beginPath(); c.arc(W * .5, H * 2.25, H * 1.85, 0, 7); c.fill();
      glow(c, W * .14, H * .74, 220, "rgba(255,220,170,.9)");
      const ax = W * .66, ay = H * .3;
      c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = lin(c, ax, ay, ax + 260, ay - 160, [[0, "rgba(255,140,60,.8)"], [1, "rgba(255,80,0,0)"]]);
      c.beginPath(); c.moveTo(ax - 40, ay - 20); c.lineTo(ax + 320, ay - 200); c.lineTo(ax + 40, ay + 30); c.fill(); c.restore();
      c.fillStyle = "#3b2f2a"; c.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2, d = 58 + r() * 18; i ? c.lineTo(ax + Math.cos(a) * d, ay + Math.sin(a) * d) : c.moveTo(ax + Math.cos(a) * d, ay + Math.sin(a) * d); } c.fill();
      c.fillStyle = "rgba(255,170,90,.55)"; c.beginPath(); c.arc(ax - 18, ay + 16, 40, 0, 7); c.fill();
    },
    /* 07 · קרב האגדות */
    "07-tv"(c, r) { // fairy-tale road: a rainbow, an emerald glow on the horizon, a heart-shaped cloud
      fill(c, lin(c, 0, 0, 0, H, [[0, "#6fb7ff"], [.6, "#ffd9f2"], [1, "#9ad07a"]]));
      ["#ff4d4d", "#ff9f3d", "#ffe14d", "#57d65b", "#4da6ff", "#8a5bff"].forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = .7; c.lineWidth = 18; c.beginPath(); c.arc(W * .5, H * .78, 400 - i * 18, Math.PI, 0); c.stroke(); });
      c.globalAlpha = 1;
      glow(c, W * .5, H * .58, 140, "rgba(80,255,150,.8)"); skyline(c, r, H * .6, 14, 60, "#1f9d5a");
      c.fillStyle = "#6cbf55"; c.fillRect(0, H * .6, W, H * .4);
      for (let row = 0; row < 12; row++) { const t = row / 12, y0 = H * .6 + Math.pow(t, 1.6) * H * .4, y1 = H * .6 + Math.pow((row + 1) / 12, 1.6) * H * .4, w0 = 20 + t * 520, w1 = 20 + (row + 1) / 12 * 520;
        for (let k = 0; k < 4; k++) poly(c, [[W / 2 - w0 / 2 + k * w0 / 4, y0], [W / 2 - w0 / 2 + (k + 1) * w0 / 4, y0], [W / 2 - w1 / 2 + (k + 1) * w1 / 4, y1], [W / 2 - w1 / 2 + k * w1 / 4, y1]], (row + k) % 2 ? "#f2c230" : "#ffd84d"); }
      c.globalAlpha = .85; heart(c, W * .8, H * .1, 90, "#fff"); heart(c, W * .8, H * .12, 70, "#ffeaf6"); c.globalAlpha = 1;
    },
    "07-film"(c, r) { // misty swamp at night, a far-off fairy-tale castle, fireflies
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0f2412"], [.6, "#2c4a1f"], [1, "#0c160a"]]));
      glow(c, W * .7, H * .25, 120, "rgba(230,255,200,.5)"); c.fillStyle = "#f2ffd8"; c.beginPath(); c.arc(W * .7, H * .25, 34, 0, 7); c.fill();
      c.fillStyle = "#1a2c14"; [[W * .18, 90], [W * .22, 130], [W * .26, 80], [W * .3, 110]].forEach(([x, hh]) => { c.fillRect(x - 12, H * .55 - hh, 24, hh); poly(c, [[x - 18, H * .55 - hh], [x, H * .55 - hh - 40], [x + 18, H * .55 - hh]], "#1a2c14"); });
      c.fillRect(W * .16, H * .5, W * .16, 40);
      for (let i = 0; i < 5; i++) { c.fillStyle = "rgba(200,230,180," + (.06 + i * .02) + ")"; c.fillRect(0, H * (.5 + i * .06), W, 26); }
      c.fillStyle = "#0a1408"; for (let i = 0; i < 70; i++) { const x = r() * W, hh = 40 + r() * 120; c.fillRect(x, H - hh, 3, hh); c.beginPath(); c.ellipse(x + 1, H - hh, 4, 12, 0, 0, 7); c.fill(); }
      for (let i = 0; i < 40; i++) glow(c, r() * W, H * .35 + r() * H * .6, 10 + r() * 8, "rgba(220,255,120,.9)");
    },
    /* 08 · מישהו שיהיה שם */
    "08-tv"(c, r) { // big-city friends: dusk skyline through a café window, a steaming mug
      fill(c, lin(c, 0, 0, 0, H, [[0, "#2b2a5a"], [.6, "#f08a5d"], [1, "#2a1c1c"]]));
      skyline(c, r, H * .72, 60, 260, "#1c1830", "rgba(255,214,140,.85)", .3);
      c.fillStyle = "#3b2418"; c.fillRect(0, H * .72, W, H * .28);
      c.strokeStyle = "#2a1a12"; c.lineWidth = 26; c.strokeRect(13, 13, W - 26, H * .72 - 13); c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H * .72); c.stroke();
      const mx = W * .72, my = H * .78;
      c.fillStyle = "#f2e6d0"; c.fillRect(mx - 60, my, 120, 110); c.beginPath(); c.ellipse(mx, my, 60, 14, 0, 0, 7); c.fill();
      c.strokeStyle = "#f2e6d0"; c.lineWidth = 14; c.beginPath(); c.arc(mx + 64, my + 50, 26, -1.4, 1.4); c.stroke();
      c.fillStyle = "#6b3a20"; c.beginPath(); c.ellipse(mx, my, 52, 10, 0, 0, 7); c.fill();
      c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 6; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(mx + i * 22, my - 10); c.bezierCurveTo(mx + i * 22 - 20, my - 50, mx + i * 22 + 20, my - 70, mx + i * 22, my - 110); c.stroke(); }
    },
    "08-film"(c, r) { // eighties hero night: neon sun, grid horizon, a lightning storm
      fill(c, lin(c, 0, 0, 0, H * .62, [[0, "#0a0420"], [1, "#5b0f5e"]]));
      c.save(); c.beginPath(); c.arc(W / 2, H * .62, 170, Math.PI, 0); c.clip();
      c.fillStyle = lin(c, 0, H * .62 - 170, 0, H * .62, [[0, "#ffe14d"], [1, "#ff2e88"]]); c.fillRect(0, 0, W, H);
      for (let i = 0; i < 7; i++) { c.fillStyle = "#3a0b44"; c.fillRect(0, H * .62 - 90 + i * 14, W, 4 + i); } c.restore();
      c.fillStyle = "#0a0420"; c.fillRect(0, H * .62, W, H);
      c.strokeStyle = "#ff2e88"; c.lineWidth = 2;
      for (let i = 0; i < 10; i++) { const y = H * .62 + Math.pow(i / 10, 2) * H * .38; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(W / 2 + i * 12, H * .62); c.lineTo(W / 2 + i * 120, H); c.stroke(); }
      c.save(); c.globalCompositeOperation = "lighter";
      [[W * .2, 0], [W * .82, 0]].forEach(([x0]) => { c.strokeStyle = "rgba(190,220,255,.9)"; c.lineWidth = 4; c.beginPath(); let x = x0, y = 0; c.moveTo(x, y); while (y < H * .5) { x += (r() - .5) * 70; y += 30 + r() * 30; c.lineTo(x, y); } c.stroke(); glow(c, x0, 40, 140, "rgba(160,200,255,.4)"); });
      c.restore();
    },
    /* 09 · תל אביב מול תל אביב */
    "09-tv"(c, r) { // Tel Aviv rooftops at night: water heaters, antennas, a laundry line
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1b1a2e"], [1, "#4a3e5c"]]));
      glow(c, W * .2, H * .2, 160, "rgba(255,190,140,.25)");
      skyline(c, r, H * .8, 40, 120, "#2a2536", "rgba(255,210,150,.6)", .18);
      c.fillStyle = "#16131f"; c.fillRect(0, H * .8, W, H * .2);
      for (let i = 0; i < 7; i++) { const x = 60 + i * 135 + r() * 30, y = H * .8;
        c.fillStyle = "#cfc7bf"; c.beginPath(); c.ellipse(x, y - 64, 34, 22, 0, 0, 7); c.fill(); c.fillRect(x - 34, y - 64, 68, 22); c.fillStyle = "#9a918a"; c.fillRect(x - 24, y - 42, 6, 42); c.fillRect(x + 18, y - 42, 6, 42);
        c.fillStyle = "#3a4c6e"; poly(c, [[x + 50, y], [x + 110, y], [x + 96, y - 44], [x + 40, y - 44]], "#3a4c6e"); c.strokeStyle = "rgba(160,190,230,.4)"; c.lineWidth = 1; c.stroke(); }
      c.strokeStyle = "#0d0b12"; c.lineWidth = 3; for (let i = 0; i < 5; i++) { const x = r() * W; c.beginPath(); c.moveTo(x, H * .8); c.lineTo(x, H * .38); c.moveTo(x - 30, H * .45); c.lineTo(x + 30, H * .45); c.moveTo(x - 20, H * .52); c.lineTo(x + 20, H * .52); c.stroke(); }
      c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, H * .55); c.quadraticCurveTo(W * .5, H * .62, W, H * .52); c.stroke();
      ["#e24b3b", "#f2c230", "#5d8fd6", "#f4efe6", "#7fd49b"].forEach((col, i) => { const x = 120 + i * 160; c.fillStyle = col; c.globalAlpha = .8; c.fillRect(x, H * .56 + Math.sin(i) * 6, 40, 52); }); c.globalAlpha = 1;
      stars(c, r, 30, "#fff", H * .3);
    },
    "09-film"(c, r) { // late-seventies Tel Aviv: rounded Bauhaus balconies, a palm, orange evening
      fill(c, lin(c, 0, 0, 0, H, [[0, "#f39a4a"], [.7, "#ffd9a0"], [1, "#c97a3c"]]));
      glow(c, W * .82, H * .3, 200, "rgba(255,240,200,.7)");
      c.fillStyle = "#efe2c8"; c.fillRect(W * .08, H * .12, W * .56, H * .88);
      c.fillStyle = "#e3d3b4"; c.fillRect(W * .58, H * .12, W * .06, H * .88);
      for (let f = 0; f < 5; f++) { const y = H * .2 + f * 86;
        c.fillStyle = "#f8efdb"; c.beginPath(); c.moveTo(W * .08, y); c.lineTo(W * .6, y); c.arc(W * .6, y + 18, 18, -Math.PI / 2, Math.PI / 2); c.lineTo(W * .08, y + 36); c.fill();
        c.fillStyle = "rgba(120,80,40,.25)"; c.fillRect(W * .08, y + 36, W * .52, 6);
        c.fillStyle = "rgba(60,90,110,.55)"; for (let k = 0; k < 5; k++) c.fillRect(W * .12 + k * 96, y - 40, 46, 34); }
      c.strokeStyle = "#5a3a1e"; c.lineWidth = 14; c.beginPath(); c.moveTo(W * .82, H); c.quadraticCurveTo(W * .8, H * .6, W * .84, H * .34); c.stroke();
      c.fillStyle = "#2f5a2a"; for (let i = 0; i < 9; i++) { const a = -Math.PI + i / 8 * Math.PI; c.save(); c.translate(W * .84, H * .34); c.rotate(a); c.beginPath(); c.ellipse(70, 0, 80, 12, .3, 0, 7); c.fill(); c.restore(); }
    },
    /* 10 · המנונים לרחבה */
    "10-tv"(c, r) { // the dance studio: mirror wall, barre, neon stars and spotlights
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1a0b2e"], [1, "#2e0f3a"]]));
      for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(180,200,255,.06)"; c.fillRect(30 + i * 158, 40, 148, H * .55); c.strokeStyle = "rgba(255,255,255,.15)"; c.strokeRect(30 + i * 158, 40, 148, H * .55); }
      c.fillStyle = "#c9a86a"; c.fillRect(0, H * .5, W, 8);
      c.fillStyle = lin(c, 0, H * .62, 0, H, [[0, "#6b3a2a"], [1, "#2a140f"]]); c.fillRect(0, H * .62, W, H);
      for (let x = 0; x < W; x += 60) { c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(x, H * .62, 2, H); }
      beam(c, W * .3, -20, Math.PI * .55, .12, 700, "#ff5ec8", .35); beam(c, W * .7, -20, Math.PI * .45, .12, 700, "#ffe14d", .35);
      const star = (x, y, s, col) => { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, d = i % 2 ? s * .42 : s; c.lineTo(Math.cos(a) * d, Math.sin(a) * d); } c.fill(); c.restore(); glow(c, x, y, s * 2.2, col, .5); };
      star(W * .5, H * .3, 70, "#ffe14d"); star(W * .2, H * .2, 30, "#ff5ec8"); star(W * .82, H * .24, 38, "#5de0ff");
    },
    "10-film"(c, r) { // a pink city night in the rain: bokeh, streaks and falling hearts
      fill(c, lin(c, 0, 0, 0, H, [[0, "#2a0b2a"], [1, "#5c1340"]]));
      for (let i = 0; i < 45; i++) glow(c, r() * W, r() * H, 20 + r() * 60, ["rgba(255,90,170,.5)", "rgba(255,200,120,.45)", "rgba(140,170,255,.4)"][i % 3]);
      c.strokeStyle = "rgba(255,230,240,.45)"; c.lineWidth = 1.4;
      for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 14 + r() * 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x - l * .25, y + l); c.stroke(); }
      for (let i = 0; i < 26; i++) { const s = 18 + r() * 34; c.globalAlpha = .55 + r() * .4; heart(c, r() * W, r() * H, s, r() < .5 ? "#ff3d8b" : "#ffb3d1"); }
      c.globalAlpha = 1;
    }
  };

  function generate(key) {
    if (cache[key]) return cache[key];
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d"), r = rng(key);
    try { (P[key] || P["01-tv"])(c, r); finish(c, r); } catch (e) { c.fillStyle = "#14110e"; c.fillRect(0, 0, W, H); }
    let url = ""; try { url = cv.toDataURL("image/jpeg", 0.84); } catch (e) { url = ""; }
    cache[key] = url; return url;
  }
  function hostedUrl(key) {
    const C = window.SC_CONFIG || {};
    return C.ART_BASE_URL ? C.ART_BASE_URL.replace(/\/$/, "") + "/" + key + "." + (C.ART_EXT || "jpg") : "";
  }
  /* an <img> showing the best available art for a song key */
  function img(key, cls) {
    const el = document.createElement("img");
    el.className = "art " + (cls || ""); el.alt = ""; el.decoding = "async"; el.loading = "eager"; el.draggable = false;
    const local = overrides[key], hosted = hostedUrl(key);
    el.src = local || hosted || generate(key);
    if (!local && hosted) el.onerror = () => { el.onerror = null; el.src = generate(key); };
    return el;
  }
  window.SCArt = { img, generate, overrides, keys: Object.keys(P) };
})();

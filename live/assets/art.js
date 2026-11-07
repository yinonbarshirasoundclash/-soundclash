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
    glee(c, r) { // show-choir stage: curtains, spotlights, a lone mic
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1a0612"], [1, "#3b0a1e"]]));
      for (let i = 0; i < 14; i++) { const x = i < 7 ? i * 28 : W - (i - 7) * 28 - 28; c.fillStyle = lin(c, x, 0, x + 28, 0, [[0, "#5e0f24"], [.5, "#a3203d"], [1, "#4a0b1c"]]); c.fillRect(x, 0, 30, H); }
      beam(c, W * .35, -40, Math.PI * .58, .16, 700, "#ffe6b8", .45); beam(c, W * .65, -40, Math.PI * .42, .16, 700, "#ffd4f0", .4); beam(c, W * .5, -60, Math.PI / 2, .12, 700, "#fff3d6", .5);
      c.fillStyle = rad(c, W / 2, H * .9, 10, 300, [[0, "rgba(255,230,190,.55)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(0, H * .6, W, H * .4);
      c.fillStyle = "#0b0507"; c.fillRect(W / 2 - 3, H * .42, 6, H * .5); c.fillRect(W / 2 - 40, H * .9, 80, 8);
      c.beginPath(); c.ellipse(W / 2, H * .4, 14, 22, 0, 0, 7); c.fill(); glow(c, W / 2, H * .38, 60, "rgba(255,240,210,.7)");
      stars(c, r, 60, "#ffe9c9", H * .5);
    },
    dirtydancing(c, r) { // summer-camp dance night: string lights over a lake at dusk
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
    vinyl(c, r) { // sixties lounge: sunburst + spinning vinyl
      fill(c, "#0f2a2e");
      for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; c.fillStyle = i % 2 ? "#e8813a" : "#f2b04a"; c.beginPath(); c.moveTo(W * .3, H * .55); c.arc(W * .3, H * .55, 900, a, a + Math.PI / 36); c.fill(); }
      c.fillStyle = rad(c, W * .3, H * .55, 0, 700, [[0, "rgba(15,42,46,0)"], [1, "rgba(15,42,46,.9)"]]); fill(c, c.fillStyle);
      c.fillStyle = "#0a0a0a"; c.beginPath(); c.arc(W * .68, H * .55, 190, 0, 7); c.fill();
      c.strokeStyle = "rgba(255,255,255,.07)"; for (let rr = 70; rr < 188; rr += 6) { c.beginPath(); c.arc(W * .68, H * .55, rr, 0, 7); c.stroke(); }
      c.fillStyle = "#e24b3b"; c.beginPath(); c.arc(W * .68, H * .55, 60, 0, 7); c.fill(); c.fillStyle = "#0a0a0a"; c.beginPath(); c.arc(W * .68, H * .55, 6, 0, 7); c.fill();
      c.fillStyle = "rgba(255,255,255,.12)"; c.beginPath(); c.moveTo(W * .68, H * .55); c.arc(W * .68, H * .55, 188, -1.2, -.7); c.fill();
    },
    disco(c, r) { // lit-up disco floor in perspective + mirror ball
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
    ecg(c, r) { // hospital at night: a glowing heartbeat line across lit windows
      fill(c, lin(c, 0, 0, 0, H, [[0, "#06121f"], [1, "#0d2236"]]));
      for (let y = 40; y < H; y += 54) for (let x = 20; x < W; x += 74) { c.fillStyle = r() < .35 ? "rgba(140,200,255," + (.15 + r() * .35) + ")" : "rgba(255,255,255,.04)"; c.fillRect(x, y, 56, 36); }
      c.save(); c.globalCompositeOperation = "lighter";
      const line = (lw, col) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); let x = 0; c.moveTo(0, H * .55);
        while (x < W) { c.lineTo(x += 90, H * .55); c.lineTo(x += 14, H * .5); c.lineTo(x += 14, H * .55); c.lineTo(x += 12, H * .3); c.lineTo(x += 16, H * .72); c.lineTo(x += 12, H * .55); c.lineTo(x += 30, H * .55); c.lineTo(x += 16, H * .48); c.lineTo(x += 16, H * .55); }
        c.stroke(); };
      line(18, "rgba(80,255,190,.12)"); line(8, "rgba(80,255,190,.3)"); line(3, "#b8ffe4"); c.restore();
      glow(c, W * .82, H * .2, 90, "rgba(255,80,80,.35)"); c.fillStyle = "rgba(255,120,120,.85)"; c.fillRect(W * .82 - 8, H * .2 - 26, 16, 52); c.fillRect(W * .82 - 26, H * .2 - 8, 52, 16);
    },
    titanic(c, r) { // open ocean at sunset, a distant liner glowing on the horizon
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
    pokemon(c, r) { // bright adventure: lightning, rays and rolling green hills
      fill(c, lin(c, 0, 0, 0, H, [[0, "#3aa0ff"], [1, "#bfe7ff"]]));
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; c.fillStyle = "rgba(255,255,255,.14)"; c.beginPath(); c.moveTo(W * .5, H * .4); c.arc(W * .5, H * .4, 900, a, a + .12); c.fill(); }
      glow(c, W * .5, H * .4, 260, "rgba(255,240,120,.8)");
      poly(c, [[W * .53, H * .05], [W * .42, H * .45], [W * .5, H * .45], [W * .45, H * .8], [W * .6, H * .33], [W * .52, H * .33], [W * .58, H * .05]], "#ffd21e");
      c.strokeStyle = "#e08f00"; c.lineWidth = 5; c.stroke();
      [["#58c24a", .72, 50], ["#3fa83a", .8, 40], ["#2f8f31", .9, 30]].forEach(([col, base, amp]) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * base - Math.sin(x / 140 + base * 9) * amp); c.lineTo(W, H); c.fill(); });
      for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(255,255,255,.9)"; const x = r() * W, y = r() * H * .6, s = 2 + r() * 4; c.fillRect(x - s, y, s * 2, 1.5); c.fillRect(x, y - s, 1.5, s * 2); }
    },
    rocky(c, r) { // the ring at night: ropes, one hard spotlight, tiger stripes at the edges
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
    vault(c, r) { // the vault: red light, a heavy round door, bills in the air
      fill(c, lin(c, 0, 0, W, H, [[0, "#2a0505"], [1, "#0c0202"]]));
      glow(c, W * .62, H * .5, 380, "rgba(220,30,30,.55)");
      const vx = W * .62, vy = H * .52;
      for (let rr = 230; rr > 40; rr -= 30) { c.strokeStyle = "rgba(255,120,110," + (.12 + (230 - rr) / 900) + ")"; c.lineWidth = 10; c.beginPath(); c.arc(vx, vy, rr, 0, 7); c.stroke(); }
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.strokeStyle = "rgba(255,170,160,.5)"; c.lineWidth = 12; c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx + Math.cos(a) * 110, vy + Math.sin(a) * 110); c.stroke(); }
      c.fillStyle = "#4d0a0a"; c.beginPath(); c.arc(vx, vy, 36, 0, 7); c.fill();
      for (let i = 0; i < 26; i++) { c.save(); c.translate(r() * W * .55, r() * H); c.rotate(r() * 3); c.fillStyle = "rgba(170,210,160," + (.35 + r() * .4) + ")"; c.fillRect(-34, -16, 68, 32); c.strokeStyle = "rgba(255,255,255,.3)"; c.strokeRect(-28, -11, 56, 22); c.restore(); }
    },
    circus(c, r) { // the big top: striped tent, spotlights, gold confetti
      fill(c, "#12060a");
      for (let i = -10; i < 11; i++) { c.fillStyle = i % 2 ? "#b3172c" : "#f1e6d2"; c.beginPath(); c.moveTo(W / 2, -40); c.lineTo(W / 2 + i * 70, H); c.lineTo(W / 2 + (i + 1) * 70, H); c.closePath(); c.fill(); }
      c.fillStyle = rad(c, W / 2, H * .3, 40, 620, [[0, "rgba(18,6,10,.0)"], [1, "rgba(18,6,10,.92)"]]); fill(c, c.fillStyle);
      beam(c, W * .2, H, -Math.PI * .38, .09, 700, "#fff0c4", .4); beam(c, W * .8, H, -Math.PI * .62, .09, 700, "#fff0c4", .4);
      glow(c, W / 2, H * .45, 160, "rgba(255,220,150,.6)");
      for (let i = 0; i < 160; i++) { c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 3); c.fillStyle = r() < .7 ? "#f5c451" : "#fff"; c.globalAlpha = .5 + r() * .5; c.fillRect(-4, -2, 8, 4); c.restore(); }
    },
    /* 06 · סוף הניינטיז */
    lineup(c, r) { // the lineup wall: height lines and five pools of light
      fill(c, lin(c, 0, 0, 0, H, [[0, "#14262c"], [1, "#1d1a16"]]));
      c.strokeStyle = "rgba(220,235,245,.35)"; c.lineWidth = 2;
      for (let i = 0; i < 12; i++) { const y = 60 + i * 34; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); c.lineWidth = i % 2 ? 1 : 3; }
      for (let x = 0; x < W; x += 24) { c.fillStyle = "rgba(220,235,245,.25)"; c.fillRect(x, 60, 2, 8); }
      for (let i = 0; i < 5; i++) { const x = W * (.14 + i * .18); beam(c, x, -30, Math.PI / 2, .14, 620, "#d8f0ff", .28); c.fillStyle = rad(c, x, H * .92, 5, 120, [[0, "rgba(216,240,255,.35)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(x - 120, H * .7, 240, H * .3); }
      c.fillStyle = "rgba(10,14,18,.8)"; c.fillRect(0, H * .86, W, H * .14);
      glow(c, W * .9, H * .1, 70, "rgba(120,190,255,.4)");
    },
    space(c, r) { // deep space: the earth's edge, a burning asteroid, sunrise flare
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
    rainbow(c, r) { // fairy-tale road: a rainbow, an emerald glow on the horizon, a heart-shaped cloud
      fill(c, lin(c, 0, 0, 0, H, [[0, "#6fb7ff"], [.6, "#ffd9f2"], [1, "#9ad07a"]]));
      ["#ff4d4d", "#ff9f3d", "#ffe14d", "#57d65b", "#4da6ff", "#8a5bff"].forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = .7; c.lineWidth = 18; c.beginPath(); c.arc(W * .5, H * .78, 400 - i * 18, Math.PI, 0); c.stroke(); });
      c.globalAlpha = 1;
      glow(c, W * .5, H * .58, 140, "rgba(80,255,150,.8)"); skyline(c, r, H * .6, 14, 60, "#1f9d5a");
      c.fillStyle = "#6cbf55"; c.fillRect(0, H * .6, W, H * .4);
      for (let row = 0; row < 12; row++) { const t = row / 12, y0 = H * .6 + Math.pow(t, 1.6) * H * .4, y1 = H * .6 + Math.pow((row + 1) / 12, 1.6) * H * .4, w0 = 20 + t * 520, w1 = 20 + (row + 1) / 12 * 520;
        for (let k = 0; k < 4; k++) poly(c, [[W / 2 - w0 / 2 + k * w0 / 4, y0], [W / 2 - w0 / 2 + (k + 1) * w0 / 4, y0], [W / 2 - w1 / 2 + (k + 1) * w1 / 4, y1], [W / 2 - w1 / 2 + k * w1 / 4, y1]], (row + k) % 2 ? "#f2c230" : "#ffd84d"); }
      c.globalAlpha = .85; heart(c, W * .8, H * .1, 90, "#fff"); heart(c, W * .8, H * .12, 70, "#ffeaf6"); c.globalAlpha = 1;
    },
    swamp(c, r) { // misty swamp at night, a far-off fairy-tale castle, fireflies
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0f2412"], [.6, "#2c4a1f"], [1, "#0c160a"]]));
      glow(c, W * .7, H * .25, 120, "rgba(230,255,200,.5)"); c.fillStyle = "#f2ffd8"; c.beginPath(); c.arc(W * .7, H * .25, 34, 0, 7); c.fill();
      c.fillStyle = "#1a2c14"; [[W * .18, 90], [W * .22, 130], [W * .26, 80], [W * .3, 110]].forEach(([x, hh]) => { c.fillRect(x - 12, H * .55 - hh, 24, hh); poly(c, [[x - 18, H * .55 - hh], [x, H * .55 - hh - 40], [x + 18, H * .55 - hh]], "#1a2c14"); });
      c.fillRect(W * .16, H * .5, W * .16, 40);
      for (let i = 0; i < 5; i++) { c.fillStyle = "rgba(200,230,180," + (.06 + i * .02) + ")"; c.fillRect(0, H * (.5 + i * .06), W, 26); }
      c.fillStyle = "#0a1408"; for (let i = 0; i < 70; i++) { const x = r() * W, hh = 40 + r() * 120; c.fillRect(x, H - hh, 3, hh); c.beginPath(); c.ellipse(x + 1, H - hh, 4, 12, 0, 0, 7); c.fill(); }
      for (let i = 0; i < 40; i++) glow(c, r() * W, H * .35 + r() * H * .6, 10 + r() * 8, "rgba(220,255,120,.9)");
    },
    /* 08 · מישהו שיהיה שם */
    friends(c, r) { // big-city friends: dusk skyline through a café window, a steaming mug
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
    hero(c, r) { // eighties hero night: neon sun, grid horizon, a lightning storm
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
    rooftops(c, r) { // Tel Aviv rooftops at night: water heaters, antennas, a laundry line
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
    bauhaus(c, r) { // late-seventies Tel Aviv: rounded Bauhaus balconies, a palm, orange evening
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
    fame(c, r) { // the dance studio: mirror wall, barre, neon stars and spotlights
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1a0b2e"], [1, "#2e0f3a"]]));
      for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(180,200,255,.06)"; c.fillRect(30 + i * 158, 40, 148, H * .55); c.strokeStyle = "rgba(255,255,255,.15)"; c.strokeRect(30 + i * 158, 40, 148, H * .55); }
      c.fillStyle = "#c9a86a"; c.fillRect(0, H * .5, W, 8);
      c.fillStyle = lin(c, 0, H * .62, 0, H, [[0, "#6b3a2a"], [1, "#2a140f"]]); c.fillRect(0, H * .62, W, H);
      for (let x = 0; x < W; x += 60) { c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(x, H * .62, 2, H); }
      beam(c, W * .3, -20, Math.PI * .55, .12, 700, "#ff5ec8", .35); beam(c, W * .7, -20, Math.PI * .45, .12, 700, "#ffe14d", .35);
      const star = (x, y, s, col) => { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, d = i % 2 ? s * .42 : s; c.lineTo(Math.cos(a) * d, Math.sin(a) * d); } c.fill(); c.restore(); glow(c, x, y, s * 2.2, col, .5); };
      star(W * .5, H * .3, 70, "#ffe14d"); star(W * .2, H * .2, 30, "#ff5ec8"); star(W * .82, H * .24, 38, "#5de0ff");
    },
    rain(c, r) { // a pink city night in the rain: bokeh, streaks and falling hearts
      fill(c, lin(c, 0, 0, 0, H, [[0, "#2a0b2a"], [1, "#5c1340"]]));
      for (let i = 0; i < 45; i++) glow(c, r() * W, r() * H, 20 + r() * 60, ["rgba(255,90,170,.5)", "rgba(255,200,120,.45)", "rgba(140,170,255,.4)"][i % 3]);
      c.strokeStyle = "rgba(255,230,240,.45)"; c.lineWidth = 1.4;
      for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, l = 14 + r() * 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x - l * .25, y + l); c.stroke(); }
      for (let i = 0; i < 26; i++) { const s = 18 + r() * 34; c.globalAlpha = .55 + r() * .4; heart(c, r() * W, r() * H, s, r() < .5 ? "#ff3d8b" : "#ffb3d1"); }
      c.globalAlpha = 1;
    },
    rose(c, r) { // karaoke night: a single red rose under a spotlight, lyric-screen glow behind
      fill(c, lin(c, 0, 0, 0, H, [[0, "#140812"], [1, "#2a0b18"]]));
      c.fillStyle = "rgba(90,120,255,.16)"; c.fillRect(W * .12, H * .1, W * .76, H * .5);
      for (let i = 0; i < 4; i++) { c.fillStyle = "rgba(160,190,255," + (.25 - i * .04) + ")"; c.fillRect(W * .25, H * (.22 + i * .09), W * (.5 - i * .06), 10); }
      beam(c, W / 2, -40, Math.PI / 2, .22, 700, "#ffe2ec", .4);
      c.fillStyle = rad(c, W / 2, H * .9, 10, 280, [[0, "rgba(255,200,220,.4)"], [1, "rgba(0,0,0,0)"]]); c.fillRect(0, H * .55, W, H * .45);
      const x = W / 2, y = H * .5;
      c.strokeStyle = "#2f6b2a"; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y + 40); c.quadraticCurveTo(x - 20, y + 140, x + 6, H * .98); c.stroke();
      c.fillStyle = "#2f6b2a"; c.save(); c.translate(x - 12, y + 120); c.rotate(-.7); c.beginPath(); c.ellipse(0, 0, 30, 11, 0, 0, 7); c.fill(); c.restore();
      ["#5e0a1a", "#8d1026", "#b5172f", "#d42a45", "#e9455e"].forEach((col, i) => {
        const rr = 64 - i * 11; c.fillStyle = col; c.beginPath();
        for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI * 2 + i * .55, px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * .8; k ? c.quadraticCurveTo(x + Math.cos(a - .5) * rr * 1.25, y + Math.sin(a - .5) * rr, px, py) : c.moveTo(px, py); }
        c.fill(); });
      glow(c, x, y, 120, "rgba(255,80,110,.35)");
      for (let i = 0; i < 18; i++) { c.save(); c.translate(r() * W, H * .6 + r() * H * .4); c.rotate(r() * 3); c.fillStyle = "rgba(220,40,70," + (.4 + r() * .4) + ")"; c.beginPath(); c.ellipse(0, 0, 12, 7, 0, 0, 7); c.fill(); c.restore(); }
    },
    road(c, r) { // the long drive: an open highway at golden hour, mile markers flying by
      fill(c, lin(c, 0, 0, 0, H * .55, [[0, "#2b3f7a"], [.6, "#f08a4b"], [1, "#ffd08a"]]));
      glow(c, W * .5, H * .52, 200, "rgba(255,220,150,.9)");
      c.fillStyle = "#3c2a3a"; c.beginPath(); c.moveTo(0, H * .55); for (let x = 0; x <= W; x += 30) c.lineTo(x, H * .55 - 24 - Math.sin(x / 90) * 18 - r() * 10); c.lineTo(W, H * .56); c.lineTo(0, H * .56); c.fill();
      c.fillStyle = "#5a4a3a"; c.fillRect(0, H * .55, W, H * .45);
      poly(c, [[W * .48, H * .55], [W * .52, H * .55], [W * .95, H], [W * .05, H]], "#2a2626");
      for (let i = 0; i < 9; i++) { const t0 = i / 9, t1 = t0 + .05, y0 = H * .55 + Math.pow(t0, 2) * H * .45, y1 = H * .55 + Math.pow(t1, 2) * H * .45, w0 = 2 + t0 * 14, w1 = 2 + t1 * 14;
        poly(c, [[W / 2 - w0, y0], [W / 2 + w0, y0], [W / 2 + w1, y1], [W / 2 - w1, y1]], "#ffd34d"); }
      [[W * .05, W * .48], [W * .95, W * .52]].forEach(([xb, xt]) => { c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 3; c.beginPath(); c.moveTo(xt, H * .55); c.lineTo(xb, H); c.stroke(); });
      for (let i = 0; i < 5; i++) { const t = .15 + i * .2, y = H * .55 + t * t * H * .45, x = W / 2 + (W * .5) * t * 1.05; c.fillStyle = "#e8e2d4"; c.fillRect(x, y - 40 * t, 8 * t + 3, 40 * t); c.fillStyle = "#2f6b3a"; c.fillRect(x - 10 * t, y - 52 * t, 28 * t + 4, 14 * t + 2); }
    },
    greece(c, r) { // a Greek island: whitewashed houses, blue domes, a dazzling sea
      fill(c, lin(c, 0, 0, 0, H * .5, [[0, "#1f7fd1"], [1, "#9fd6ff"]]));
      glow(c, W * .82, H * .16, 140, "rgba(255,250,220,.95)");
      c.fillStyle = lin(c, 0, H * .5, 0, H, [[0, "#1d6fbf"], [1, "#0b3a6e"]]); c.fillRect(0, H * .5, W, H * .5);
      for (let y = H * .52; y < H; y += 7) { c.fillStyle = "rgba(255,255,255," + (.25 * r()) + ")"; c.fillRect(r() * W, y, 30 + r() * 80, 2); }
      c.fillStyle = "#e9e1cf"; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * .55); c.quadraticCurveTo(W * .3, H * .48, W * .55, H * .7); c.lineTo(W * .62, H); c.fill();
      const houses = [[30, .5, 120, 90], [150, .54, 100, 70], [60, .64, 140, 80], [230, .62, 110, 90], [10, .78, 160, 110], [190, .76, 150, 100], [340, .74, 120, 120]];
      houses.forEach(([x, yf, w, hh], i) => { const y = H * yf; c.fillStyle = "#fbf8f1"; c.fillRect(x, y, w, hh); c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(x + w - 16, y, 16, hh);
        c.fillStyle = "#2d63c8"; c.fillRect(x + 18, y + 24, 16, 22); if (i % 2) c.fillRect(x + w - 44, y + 24, 16, 22); });
      [[95, .5, 34], [300, .62, 30]].forEach(([x, yf, rr]) => { c.fillStyle = "#1f56c4"; c.beginPath(); c.arc(x, H * yf, rr, Math.PI, 0); c.fill(); c.fillStyle = "#fbf8f1"; c.fillRect(x - 2, H * yf - rr - 18, 4, 18); c.fillRect(x - 8, H * yf - rr - 12, 16, 4); });
      for (let i = 0; i < 9; i++) { c.fillStyle = "#e84d8a"; c.globalAlpha = .8; c.beginPath(); c.arc(40 + i * 46 + r() * 20, H * .72 + r() * 30, 8 + r() * 6, 0, 7); c.fill(); } c.globalAlpha = 1;
    },
    gaga(c, r) { // pop-club night: shattered mirror shards, magenta strobes, a white-hot stage
      fill(c, "#0a0410");
      for (let i = 0; i < 10; i++) beam(c, W * (.1 + i * .09), H, -Math.PI / 2 + (r() - .5) * .8, .05, 700, i % 2 ? "#ff2e9a" : "#ffffff", .3);
      glow(c, W / 2, H * .7, 260, "rgba(255,60,170,.55)");
      for (let i = 0; i < 26; i++) { const cx = r() * W, cy = r() * H * .75, s = 30 + r() * 70; c.save(); c.translate(cx, cy); c.rotate(r() * 6);
        c.fillStyle = lin(c, -s, -s, s, s, [[0, "rgba(255,255,255,.55)"], [.5, "rgba(255,120,210,.25)"], [1, "rgba(120,60,255,.15)"]]);
        poly(c, [[0, -s], [s * .7, s * (.2 + r() * .5)], [-s * (.3 + r() * .5), s * .6]], c.fillStyle); c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1.5; c.stroke(); c.restore(); }
      c.fillStyle = lin(c, 0, H * .82, 0, H, [[0, "#ffffff"], [1, "#ff6bc1"]]); c.globalAlpha = .85; c.fillRect(W * .2, H * .86, W * .6, 10); c.globalAlpha = 1;
      stars(c, r, 80, "#ffd6f0", H * .7);
    },
    plaid(c, r) { // grunge: a flannel-plaid backdrop, an amp glowing red, stage smoke
      fill(c, "#1a0f0c");
      for (let x = -40; x < W; x += 120) { c.fillStyle = "rgba(170,30,30,.35)"; c.fillRect(x, 0, 60, H); c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(x + 60, 0, 14, H); }
      for (let y = -40; y < H; y += 120) { c.fillStyle = "rgba(170,30,30,.3)"; c.fillRect(0, y, W, 60); c.fillStyle = "rgba(20,10,10,.4)"; c.fillRect(0, y + 60, W, 14); }
      c.fillStyle = rad(c, W / 2, H * .5, 40, 520, [[0, "rgba(26,15,12,0)"], [1, "rgba(10,6,5,.92)"]]); fill(c, c.fillStyle);
      beam(c, W * .5, -40, Math.PI / 2, .2, 700, "#ffe0c4", .35);
      const ax = W * .5 - 130, ay = H * .52; c.fillStyle = "#121212"; c.fillRect(ax, ay, 260, 200); c.fillStyle = "#2a2a2a"; c.fillRect(ax + 12, ay + 40, 236, 148);
      c.strokeStyle = "rgba(255,255,255,.08)"; for (let y = ay + 46; y < ay + 186; y += 8) { c.beginPath(); c.moveTo(ax + 14, y); c.lineTo(ax + 246, y); c.stroke(); }
      c.fillStyle = "#c9a86a"; c.fillRect(ax + 12, ay + 12, 236, 20); for (let i = 0; i < 6; i++) { c.fillStyle = "#111"; c.beginPath(); c.arc(ax + 40 + i * 36, ay + 22, 6, 0, 7); c.fill(); }
      glow(c, ax + 230, ay + 22, 30, "rgba(255,40,40,.9)");
      for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(255,255,255," + (.04 + r() * .05) + ")"; c.beginPath(); c.ellipse(r() * W, H * (.7 + r() * .3), 200 + r() * 200, 40 + r() * 30, 0, 0, 7); c.fill(); }
    },
    starsbeach(c, r) { // a night beach under a sky full of warm yellow stars
      fill(c, lin(c, 0, 0, 0, H * .62, [[0, "#050a24"], [1, "#1c2a5e"]]));
      for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H * .6, s = r() * 2.4 + .6; c.fillStyle = r() < .6 ? "#ffd84d" : "#fff6c9"; c.globalAlpha = .5 + r() * .5; c.fillRect(x, y, s, s); }
      c.globalAlpha = 1; for (let i = 0; i < 10; i++) glow(c, r() * W, r() * H * .55, 30 + r() * 30, "rgba(255,216,77,.6)");
      c.fillStyle = lin(c, 0, H * .62, 0, H * .8, [[0, "#14204a"], [1, "#0a1330"]]); c.fillRect(0, H * .62, W, H * .2);
      for (let y = H * .64; y < H * .8; y += 5) { c.fillStyle = "rgba(255,216,77," + (.25 * r()) + ")"; c.fillRect(r() * W, y, 20 + r() * 60, 1.5); }
      c.fillStyle = lin(c, 0, H * .8, 0, H, [[0, "#3a3020"], [1, "#16120c"]]); c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * .8); c.quadraticCurveTo(W * .5, H * .76, W, H * .82); c.lineTo(W, H); c.fill();
      c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, H * .8); c.quadraticCurveTo(W * .5, H * .76, W, H * .82); c.stroke();
    },
    stadium(c, r) { // festival night: floodlights over a sea of raised hands
      fill(c, lin(c, 0, 0, 0, H, [[0, "#06080f"], [1, "#151a2c"]]));
      [[W * .15, H * .12], [W * .85, H * .12], [W * .38, H * .06], [W * .62, H * .06]].forEach(([x, y], i) => {
        beam(c, x, y, Math.PI / 2 + (x < W / 2 ? -.25 : .25), .16, 700, i % 2 ? "#cfe0ff" : "#fff1d6", .3);
        for (let k = 0; k < 6; k++) glow(c, x - 30 + (k % 3) * 30, y - 10 + Math.floor(k / 3) * 20, 18, "rgba(255,255,240,.9)");
      });
      glow(c, W / 2, H * .7, 300, "rgba(120,160,255,.25)");
      c.fillStyle = "#07080c";
      for (let i = 0; i < 90; i++) { const x = r() * W, y = H * (.7 + r() * .3), hs = 14 + r() * 10; c.beginPath(); c.arc(x, y, hs, 0, 7); c.fill();
        if (r() < .45) { c.fillRect(x + (r() < .5 ? -hs : hs * .6), y - hs * 4, 6, hs * 3.4); c.beginPath(); c.arc(x + (r() < .5 ? -hs + 3 : hs * .6 + 3), y - hs * 4, 6, 0, 7); c.fill(); } }
      c.fillRect(0, H * .9, W, H * .1);
      for (let i = 0; i < 60; i++) { c.save(); c.translate(r() * W, r() * H * .6); c.rotate(r() * 3); c.fillStyle = ["#e4473b", "#4f7fd6", "#f2c230", "#fff"][i % 4]; c.globalAlpha = .7; c.fillRect(-4, -2, 8, 4); c.restore(); }
      c.globalAlpha = 1;
    },
    roundel(c, r) { // britpop: a mod target roundel, red white and blue, with stage haze
      fill(c, lin(c, 0, 0, W, H, [[0, "#0c1630"], [1, "#060a18"]]));
      const x = W * .62, y = H * .5;
      [[230, "#1f4aa8"], [170, "#f4efe6"], [110, "#d42a2a"]].forEach(([rr, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill(); });
      c.fillStyle = "rgba(0,0,0,.18)"; for (let k = 0; k < 8; k++) { c.beginPath(); c.arc(x, y, 230 - k * 2, 0, 7); c.arc(x, y, 228 - k * 2, 0, 7, true); c.fill(); }
      glow(c, x, y, 320, "rgba(255,255,255,.12)");
      c.strokeStyle = "rgba(244,239,230,.25)"; c.lineWidth = 3;
      for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(W * .1 + i * 26, H); c.lineTo(W * .1 + i * 26 + 160, 0); c.stroke(); }
      for (let i = 0; i < 5; i++) { c.fillStyle = "rgba(255,255,255," + (.04 + r() * .05) + ")"; c.beginPath(); c.ellipse(r() * W, H * (.6 + r() * .4), 260, 50, 0, 0, 7); c.fill(); }
    },
    /* ================= מסיבה ישראלית · אייטיז נגד ניינטיז ================= */
    /* 01 · רכבת לילה לקהיר — a night train crossing the desert, pyramids under the moon */
    il_train(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#070b22"], [.55, "#24204a"], [.7, "#6b3d4a"], [1, "#1a1210"]]));
      stars(c, r, 160, "#fff", H * .55);
      glow(c, W * .78, H * .2, 120, "rgba(255,240,200,.35)"); c.fillStyle = "#fff4d6"; c.beginPath(); c.arc(W * .78, H * .2, 34, 0, 7); c.fill();
      c.fillStyle = "#3a2630"; [[W * .18, 150], [W * .32, 110], [W * .44, 70]].forEach(([x, h]) => poly(c, [[x - h * 1.1, H * .66], [x, H * .66 - h], [x + h * 1.1, H * .66]], "#3a2630"));
      c.fillStyle = "rgba(255,200,150,.12)"; [[W * .18, 150], [W * .32, 110]].forEach(([x, h]) => poly(c, [[x, H * .66 - h], [x + h * 1.1, H * .66], [x + h * .2, H * .66]], "rgba(255,200,150,.12)"));
      c.fillStyle = lin(c, 0, H * .66, 0, H, [[0, "#4a2f2a"], [1, "#120c0a"]]); c.fillRect(0, H * .66, W, H);
      c.fillStyle = "#1b1416"; c.fillRect(0, H * .745, W, 6);
      for (let x = 0; x < W; x += 22) c.fillRect(x, H * .755, 12, 4);
      // the train: carriages with lit windows, engine headlight beaming left
      const ty = H * .66;
      for (let k = 0; k < 6; k++) {
        const x = W * .3 + k * 112; c.fillStyle = "#14101a"; c.fillRect(x, ty, 104, 52);
        for (let w = 0; w < 5; w++) { c.fillStyle = r() < .85 ? "#ffcf7a" : "#3a2a1a"; c.fillRect(x + 8 + w * 19, ty + 12, 13, 14); glow(c, x + 14 + w * 19, ty + 19, 18, "rgba(255,200,110,.35)"); }
      }
      c.fillStyle = "#14101a"; c.beginPath(); c.moveTo(W * .3, ty); c.lineTo(W * .3 - 50, ty + 20); c.lineTo(W * .3 - 50, ty + 52); c.lineTo(W * .3, ty + 52); c.fill();
      beam(c, W * .3 - 50, ty + 30, Math.PI + .05, .09, 360, "#fff2c8", .55); glow(c, W * .3 - 50, ty + 30, 30, "rgba(255,240,200,.9)");
      for (let i = 0; i < 10; i++) { c.fillStyle = "rgba(220,210,230," + (.06 + i * .01) + ")"; c.beginPath(); c.ellipse(W * .3 - 20 + i * 30, ty - 20 - i * 9, 22 + i * 4, 12 + i * 2, 0, 0, 7); c.fill(); }
    },
    /* 02 · ג'סיקה — kibbutz at golden hour: water tower, cypresses, orchard rows */
    il_kibbutz(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#3c6aa8"], [.5, "#f2a35e"], [.62, "#ffd28a"], [1, "#2f3a1e"]]));
      glow(c, W * .3, H * .55, 260, "rgba(255,210,140,.8)"); c.fillStyle = "#fff0c8"; c.beginPath(); c.arc(W * .3, H * .56, 40, 0, 7); c.fill();
      c.fillStyle = lin(c, 0, H * .6, 0, H, [[0, "#6b7a34"], [1, "#1d2410"]]); c.fillRect(0, H * .6, W, H);
      for (let row = 0; row < 7; row++) { const y = H * .62 + row * row * 6 + row * 10; for (let x = -20 + (row % 2) * 20; x < W + 20; x += 34 + row * 10) { c.fillStyle = row < 2 ? "#3c4a1c" : "#2a3412"; c.beginPath(); c.arc(x, y, 8 + row * 3, 0, 7); c.fill(); if (r() < .4) { c.fillStyle = "#ff9a2e"; c.beginPath(); c.arc(x + (r() - .5) * 8, y + (r() - .5) * 6, 2 + row * .5, 0, 7); c.fill(); } } }
      c.fillStyle = "#2a2018"; const tx = W * .72; c.fillRect(tx - 6, H * .3, 12, H * .3); c.fillRect(tx - 34, H * .3, 4, H * .3); c.fillRect(tx + 30, H * .3, 4, H * .3);
      c.fillRect(tx - 44, H * .18, 88, H * .13); c.fillStyle = "#3a2c20"; c.fillRect(tx - 48, H * .17, 96, 8);
      for (let i = 0; i < 4; i++) { const x = W * .52 + i * 22 + (i > 1 ? W * .3 : 0); c.fillStyle = "#1a2410"; c.beginPath(); c.ellipse(x, H * .5, 9, 60, 0, 0, 7); c.fill(); }
      for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(255,240,200," + (.2 + r() * .3) + ")"; c.fillRect(W * .05 + r() * W * .9, H * .2 + r() * H * .25, 30 + r() * 60, 2); }
    },
    /* 03 · שביל הבריחה — 80s TV stage: a yellow spotlight and a neon road escaping into the horizon */
    il_escape(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0b0618"], [.55, "#3a0f4a"], [.58, "#ff4fa0"], [.6, "#1a0a26"], [1, "#05030a"]]));
      for (let i = 0; i < 9; i++) { c.fillStyle = "rgba(255,120,190," + (.5 - i * .05) + ")"; c.fillRect(0, H * .45 + i * 8, W, 3); }
      c.strokeStyle = "rgba(80,220,255,.55)"; c.lineWidth = 2;
      for (let i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(W / 2, H * .59); c.lineTo(W / 2 + i * 120, H); c.stroke(); }
      for (let k = 1; k < 12; k++) { const y = H * .59 + Math.pow(k / 12, 2) * H * .41; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      poly(c, [[W / 2 - 4, H * .59], [W / 2 + 4, H * .59], [W / 2 + 120, H], [W / 2 - 120, H]], "rgba(255,230,60,.55)");
      beam(c, W * .5, -30, Math.PI / 2, .18, 520, "#ffe23a", .55); glow(c, W * .5, H * .42, 90, "rgba(255,230,60,.6)");
      // a bright yellow jacket on a hanger, floating in the spotlight
      c.fillStyle = "#ffe23a"; poly(c, [[W * .5 - 70, H * .27], [W * .5 - 20, H * .22], [W * .5, H * .3], [W * .5 + 20, H * .22], [W * .5 + 70, H * .27], [W * .5 + 90, H * .45], [W * .5 + 58, H * .47], [W * .5 + 52, H * .36], [W * .5 + 50, H * .55], [W * .5 - 50, H * .55], [W * .5 - 52, H * .36], [W * .5 - 58, H * .47], [W * .5 - 90, H * .45]], "#ffe23a");
      c.strokeStyle = "#c9a400"; c.lineWidth = 3; c.beginPath(); c.moveTo(W * .5, H * .3); c.lineTo(W * .5, H * .55); c.stroke();
      c.strokeStyle = "#ddd"; c.lineWidth = 3; c.beginPath(); c.moveTo(W * .5 - 50, H * .23); c.lineTo(W * .5, H * .17); c.lineTo(W * .5 + 50, H * .23); c.stroke(); c.beginPath(); c.arc(W * .5, H * .15, 7, Math.PI * .9, Math.PI * 2.2); c.stroke();
      stars(c, r, 50, "#ffd6f0", H * .4);
    },
    /* 04 · חזקה מהרוח — a lone tree on a hill, bent but standing in a storm wind */
    il_wind(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1c2440"], [.6, "#5a6a8a"], [1, "#2a2f3a"]]));
      glow(c, W * .25, H * .3, 220, "rgba(255,210,150,.45)");
      c.strokeStyle = "rgba(230,236,255,.35)"; c.lineWidth = 2;
      for (let i = 0; i < 26; i++) { const y = r() * H * .8, x = r() * W; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 80, y - 20, x + 160, y + 20, x + 240 + r() * 120, y - 10); c.stroke(); }
      c.fillStyle = "#151a24"; c.beginPath(); c.moveTo(0, H); c.quadraticCurveTo(W * .55, H * .55, W, H * .82); c.lineTo(W, H); c.fill();
      // trunk bending with the wind, canopy streaming to the right
      c.strokeStyle = "#0e1118"; c.lineCap = "round"; c.lineWidth = 22; c.beginPath(); c.moveTo(W * .55, H * .72); c.quadraticCurveTo(W * .52, H * .5, W * .62, H * .36); c.stroke();
      c.lineWidth = 8; [[.62, .36, .78, .3], [.6, .42, .74, .44], [.58, .48, .7, .55]].forEach(([a, b, x, y]) => { c.beginPath(); c.moveTo(W * a, H * b); c.lineTo(W * x, H * y); c.stroke(); });
      for (let i = 0; i < 60; i++) { c.fillStyle = "rgba(30,60,40," + (.5 + r() * .5) + ")"; c.beginPath(); c.ellipse(W * (.6 + r() * .25), H * (.26 + r() * .26), 22 + r() * 24, 10 + r() * 10, -.3, 0, 7); c.fill(); }
      for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(120,180,110,.7)"; c.save(); c.translate(W * (.7 + r() * .3), H * (.15 + r() * .5)); c.rotate(r() * 6); c.fillRect(-5, -2, 10, 4); c.restore(); }
    },
    /* 05 · שירו של שפשף — a film within a film: projector beam, clapperboard, film strip */
    il_film(c, r) {
      fill(c, "#0c0a0e");
      beam(c, W * .92, H * .3, Math.PI + .12, .16, 900, "#fff1d0", .45);
      for (let i = 0; i < 80; i++) { c.fillStyle = "rgba(255,240,210," + r() * .5 + ")"; c.fillRect(W * (.1 + r() * .8), H * (.1 + r() * .6), 2, 2); }
      c.fillStyle = "#1c1820"; c.fillRect(W * .86, H * .22, 90, 70); c.beginPath(); c.arc(W * .86 + 20, H * .2, 26, 0, 7); c.arc(W * .86 + 70, H * .2, 26, 0, 7); c.fill();
      // film strip ribbon
      c.save(); c.translate(W * .4, H * .72); c.rotate(-.12);
      c.fillStyle = "#1a1612"; c.fillRect(-W * .5, -45, W * 1.1, 90);
      for (let x = -W * .5; x < W * .6; x += 24) { c.fillStyle = "#c9b48a"; c.fillRect(x, -40, 12, 9); c.fillRect(x, 31, 12, 9); }
      for (let x = -W * .5 + 10; x < W * .6; x += 110) { c.fillStyle = "rgba(255,200,120," + (.25 + r() * .35) + ")"; c.fillRect(x, -26, 96, 52); }
      c.restore();
      // clapperboard
      c.save(); c.translate(W * .3, H * .35); c.rotate(-.06);
      c.fillStyle = "#111"; c.fillRect(-130, -20, 260, 150); c.fillStyle = "#f2efe6"; c.fillRect(-122, 10, 244, 2); c.fillRect(-122, 60, 244, 2);
      c.save(); c.translate(-130, -20); c.rotate(-.22); c.fillStyle = "#111"; c.fillRect(0, -40, 260, 40); for (let i = 0; i < 6; i++) poly(c, [[i * 46, -40], [i * 46 + 22, -40], [i * 46 + 44, 0], [i * 46 + 22, 0]], "#f2efe6"); c.restore();
      c.restore();
    },
    /* 06 · מתי נתנשק — a neon sign of two lips above a wet night street */
    il_kiss(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0a0614"], [1, "#160818"]]));
      skyline(c, r, H * .62, 80, 220, "#110a18", "rgba(255,140,200,.35)", .2);
      c.fillStyle = lin(c, 0, H * .62, 0, H, [[0, "#1c0c22"], [1, "#06030a"]]); c.fillRect(0, H * .62, W, H);
      const lips = (dy, a, flip) => { c.save(); c.globalAlpha = a; c.translate(W / 2, H * .34 + dy); if (flip) c.scale(1, -1);
        c.lineWidth = 9; c.strokeStyle = "#ff3d8a"; c.shadowColor = "#ff3d8a"; c.shadowBlur = 40;
        c.beginPath(); c.moveTo(-130, 0); c.bezierCurveTo(-90, -60, -30, -70, 0, -38); c.bezierCurveTo(30, -70, 90, -60, 130, 0); c.bezierCurveTo(80, 70, -80, 70, -130, 0); c.stroke();
        c.beginPath(); c.moveTo(-122, 2); c.bezierCurveTo(-60, 16, 60, 16, 122, 2); c.stroke(); c.restore(); };
      lips(0, 1, false); lips(H * .56, .25, true);
      for (let i = 0; i < 70; i++) { c.strokeStyle = "rgba(200,180,255,.18)"; c.lineWidth = 1; const x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 22); c.stroke(); }
      [[W * .18, "#3dd6ff"], [W * .82, "#ffd23d"]].forEach(([x, col]) => { c.fillStyle = col; c.fillRect(x - 3, H * .2, 6, H * .42); glow(c, x, H * .2, 60, "rgba(255,255,255,.35)"); });
    },
    /* 07 · באה מאהבה — a wedding canopy under string lights, petals in the air */
    il_chuppah(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#140c22"], [.6, "#3a1f3a"], [1, "#1a1018"]]));
      for (let k = 0; k < 4; k++) for (let i = 0; i <= 30; i++) { const t = i / 30, x = W * t, y = H * (.08 + k * .07) + Math.sin(t * Math.PI) * 40; glow(c, x, y, 14, "rgba(255,214,150,.8)"); c.fillStyle = "#fff4d8"; c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); }
      c.fillStyle = "#e9dcc8"; [W * .3, W * .7].forEach(x => c.fillRect(x - 5, H * .38, 10, H * .5));
      c.fillStyle = "rgba(245,236,224,.92)"; c.beginPath(); c.moveTo(W * .26, H * .38); c.quadraticCurveTo(W * .5, H * .3, W * .74, H * .38); c.lineTo(W * .72, H * .48); c.quadraticCurveTo(W * .5, H * .44, W * .28, H * .48); c.fill();
      for (let i = 0; i < 18; i++) { const x = W * (.28 + i * .025); c.fillStyle = i % 2 ? "#e8a0b4" : "#fff"; c.beginPath(); c.arc(x, H * .38 + Math.sin(i) * 4, 9, 0, 7); c.fill(); }
      glow(c, W * .5, H * .7, 220, "rgba(255,200,170,.35)");
      for (let i = 0; i < 70; i++) { c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 6); c.fillStyle = r() < .5 ? "rgba(255,170,190,.85)" : "rgba(255,240,240,.8)"; c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fill(); c.restore(); }
      c.fillStyle = "#130b14"; c.fillRect(0, H * .88, W, H * .12);
    },
    /* 08 · קח אותי — a childhood home at night in the rain, one warm window */
    il_home(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0b1220"], [1, "#1b2434"]]));
      c.fillStyle = "#0e141e"; poly(c, [[W * .3, H * .45], [W * .5, H * .22], [W * .7, H * .45]], "#0e141e"); c.fillRect(W * .32, H * .45, W * .36, H * .45);
      c.fillStyle = "#ffcf7a"; c.fillRect(W * .38, H * .53, 90, 70); glow(c, W * .38 + 45, H * .53 + 35, 160, "rgba(255,190,110,.45)");
      c.fillStyle = "#3a2a1a"; c.fillRect(W * .38 + 43, H * .53, 4, 70); c.fillRect(W * .38, H * .53 + 33, 90, 4);
      c.fillStyle = "#1a2230"; c.fillRect(W * .58, H * .6, 50, H * .3); c.fillStyle = "rgba(255,190,110,.6)"; c.fillRect(W * .58 + 4, H * .6 + 4, 6, H * .3 - 8);
      c.fillStyle = "#121a26"; c.fillRect(0, H * .9, W, H * .1);
      c.strokeStyle = "rgba(170,200,255,.35)"; c.lineWidth = 1.2;
      for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 18); c.stroke(); }
      for (let i = 0; i < 12; i++) { c.fillStyle = "rgba(255,190,110," + (.08 + r() * .1) + ")"; c.fillRect(W * .32 + r() * W * .3, H * .91 + r() * 20, 40 + r() * 60, 2); }
    },
    /* 09 · זמנך עבר — an old school classroom: chalkboard, clock, Purim masks and confetti */
    il_school(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#2a2a22"], [1, "#16150f"]]));
      c.fillStyle = "#5a3e22"; c.fillRect(W * .12, H * .16, W * .58, H * .48); c.fillStyle = "#1f3a2c"; c.fillRect(W * .13, H * .18, W * .56, H * .44);
      c.strokeStyle = "rgba(240,240,230,.55)"; c.lineWidth = 3;
      for (let i = 0; i < 5; i++) { c.beginPath(); const y = H * (.26 + i * .07); c.moveTo(W * .18, y); for (let x = W * .18; x < W * (.3 + r() * .35); x += 14) c.lineTo(x, y + (r() - .5) * 6); c.stroke(); }
      const cx = W * .82, cy = H * .26; c.fillStyle = "#f2efe6"; c.beginPath(); c.arc(cx, cy, 52, 0, 7); c.fill(); c.strokeStyle = "#222"; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, 52, 0, 7); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + 26, cy - 18); c.moveTo(cx, cy); c.lineTo(cx - 6, cy - 38); c.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; c.fillStyle = "#222"; c.fillRect(cx + Math.cos(a) * 44 - 2, cy + Math.sin(a) * 44 - 2, 4, 4); }
      // a carnival mask on the desk
      c.fillStyle = "#3a2716"; c.fillRect(0, H * .76, W, H * .24);
      c.save(); c.translate(W * .78, H * .72); c.fillStyle = "#d8a63a"; c.beginPath(); c.ellipse(-36, 0, 40, 26, -.2, 0, 7); c.ellipse(36, 0, 40, 26, .2, 0, 7); c.fill();
      c.fillStyle = "#16150f"; c.beginPath(); c.ellipse(-34, 0, 16, 9, -.2, 0, 7); c.ellipse(34, 0, 16, 9, .2, 0, 7); c.fill(); c.restore();
      const cols = ["#ff5a5a", "#ffd23d", "#3dd6ff", "#a04dff", "#5dff9a"];
      for (let i = 0; i < 90; i++) { c.fillStyle = cols[i % 5]; c.globalAlpha = .7; c.fillRect(r() * W, r() * H, 5, 9); } c.globalAlpha = 1;
    },
    /* 10 · אין קץ לילדות — a dreamy playground at high noon: swings and a slide */
    il_playground(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#6ab0e0"], [.62, "#d9ecf2"], [.63, "#e8c88a"], [1, "#a0783e"]]));
      glow(c, W * .5, H * .05, 300, "rgba(255,255,230,.9)");
      c.strokeStyle = "#c0392b"; c.lineWidth = 10; c.lineCap = "round";
      c.beginPath(); c.moveTo(W * .1, H * .75); c.lineTo(W * .2, H * .28); c.lineTo(W * .3, H * .75); c.moveTo(W * .5, H * .75); c.lineTo(W * .4, H * .28); c.lineTo(W * .3, H * .75); c.stroke();
      c.beginPath(); c.moveTo(W * .2, H * .28); c.lineTo(W * .4, H * .28); c.stroke();
      c.strokeStyle = "#555"; c.lineWidth = 2; [[.25, .08], [.35, -.12]].forEach(([x, sw]) => { const bx = W * x + sw * 120, by = H * .62; c.beginPath(); c.moveTo(W * x - 14, H * .28); c.lineTo(bx - 14, by); c.moveTo(W * x + 14, H * .28); c.lineTo(bx + 14, by); c.stroke(); c.fillStyle = "#f2b33d"; c.fillRect(bx - 20, by, 40, 7); });
      c.fillStyle = "#2f63c4"; poly(c, [[W * .62, H * .35], [W * .66, H * .35], [W * .92, H * .75], [W * .84, H * .75]], "#2f63c4");
      c.strokeStyle = "#888"; c.lineWidth = 6; c.beginPath(); c.moveTo(W * .6, H * .75); c.lineTo(W * .6, H * .35); c.lineTo(W * .66, H * .35); c.stroke();
      for (let y = H * .42; y < H * .74; y += 26) { c.beginPath(); c.moveTo(W * .6, y); c.lineTo(W * .64, y); c.stroke(); }
      c.fillStyle = "rgba(255,255,255,.25)"; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(r() * W, H * (.1 + r() * .2), 90, 22, 0, 0, 7); c.fill(); }
      c.fillStyle = "rgba(255,250,235,.18)"; c.fillRect(0, 0, W, H);
    },
    /* 11 · דם חם — a red-hot pulse: flames rising into a heartbeat */
    il_hotblood(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#14020a"], [.6, "#4a0612"], [1, "#9a1a0c"]]));
      for (let i = 0; i < 40; i++) { const x = r() * W, h = 80 + r() * 220; c.fillStyle = lin(c, 0, H, 0, H - h, [[0, "rgba(255,150,40,.7)"], [.6, "rgba(255,60,40,.4)"], [1, "rgba(255,40,60,0)"]]); c.beginPath(); c.moveTo(x - 30, H); c.quadraticCurveTo(x + (r() - .5) * 60, H - h * .6, x, H - h); c.quadraticCurveTo(x + 10, H - h * .5, x + 30, H); c.fill(); }
      c.save(); c.globalCompositeOperation = "lighter";
      const line = (lw, col) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); let x = 0; c.moveTo(0, H * .42);
        while (x < W) { c.lineTo(x += 110, H * .42); c.lineTo(x += 14, H * .2); c.lineTo(x += 18, H * .62); c.lineTo(x += 12, H * .42); } c.stroke(); };
      line(20, "rgba(255,60,80,.18)"); line(8, "rgba(255,80,90,.4)"); line(3, "#ffd0d0"); c.restore();
      heart(c, W * .5, H * .1, 120, "rgba(255,40,70,.85)"); glow(c, W * .5, H * .2, 160, "rgba(255,60,80,.5)");
    },
    /* 12 · עד העונג הבא — witches' night: full moon, a broom streak, an electric guitar silhouette */
    il_witches(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0c0520"], [.7, "#3a1258"], [1, "#12061e"]]));
      stars(c, r, 140, "#e8d8ff", H * .7);
      glow(c, W * .66, H * .3, 220, "rgba(210,170,255,.45)"); c.fillStyle = "#efe4ff"; c.beginPath(); c.arc(W * .66, H * .3, 92, 0, 7); c.fill();
      c.fillStyle = "rgba(160,120,200,.25)"; [[-20, -18, 18], [24, 20, 12], [-30, 30, 10]].forEach(([dx, dy, rr]) => { c.beginPath(); c.arc(W * .66 + dx, H * .3 + dy, rr, 0, 7); c.fill(); });
      // broom silhouette crossing the moon
      c.save(); c.translate(W * .6, H * .32); c.rotate(-.25); c.fillStyle = "#0c0418"; c.fillRect(-150, -4, 230, 8); poly(c, [[80, -14], [140, -30], [150, 0], [140, 30], [80, 14]], "#0c0418"); c.restore();
      for (let i = 0; i < 30; i++) { c.fillStyle = "rgba(220,180,255," + (.6 - i * .02) + ")"; c.beginPath(); c.arc(W * .6 - 160 - i * 14, H * .32 + 40 + i * 3, 3 - i * .08, 0, 7); c.fill(); }
      // forest + an electric guitar standing in the foreground
      for (let x = -20; x < W + 20; x += 40) { const h = 90 + r() * 120; poly(c, [[x - 30, H], [x, H - h], [x + 30, H]], "#08030f"); }
      c.save(); c.translate(W * .2, H * .55); c.rotate(-.3); c.fillStyle = "#a01a5a"; c.beginPath(); c.ellipse(0, 70, 54, 64, 0, 0, 7); c.ellipse(0, 10, 40, 40, 0, 0, 7); c.fill();
      c.fillStyle = "#1a0a14"; c.fillRect(-7, -170, 14, 190); c.fillRect(-12, -200, 24, 34); c.fillStyle = "#e8d8ff"; c.fillRect(-30, 60, 60, 8); c.restore();
    },
    /* 13 · יום שישי — Friday at dusk over the city rooftops: boilers, solar heaters, a cassette */
    il_friday(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1d2a5a"], [.5, "#e0704a"], [.7, "#f5b46a"], [1, "#2a1a1a"]]));
      glow(c, W * .2, H * .62, 200, "rgba(255,180,100,.8)");
      skyline(c, r, H * .8, 60, 180, "#2a1c22", "rgba(255,210,140,.6)", .35);
      for (let i = 0; i < 9; i++) { const x = W * (.05 + i * .11), y = H * .8 - 90 - r() * 80; c.fillStyle = "#1a1216"; c.fillRect(x, y - 30, 26, 30); c.beginPath(); c.ellipse(x + 13, y - 30, 13, 6, 0, 0, 7); c.fill(); c.save(); c.translate(x + 30, y); c.rotate(-.5); c.fillStyle = "#3a4a6a"; c.fillRect(0, -26, 44, 26); c.restore(); }
      c.fillStyle = "#140c10"; c.fillRect(0, H * .8, W, H * .2);
      // a cassette tape in the foreground
      c.save(); c.translate(W * .7, H * .78); c.rotate(-.08); c.fillStyle = "#e8e2d4"; c.fillRect(-120, -70, 240, 140); c.fillStyle = "#e0703a"; c.fillRect(-110, -60, 220, 46);
      c.fillStyle = "#2a2226"; c.fillRect(-80, -6, 160, 40); c.fillStyle = "#e8e2d4"; [[-46, 14], [46, 14]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill(); });
      c.fillStyle = "#2a2226"; for (let k = 0; k < 6; k++) { c.fillRect(-49 + (k % 2) * 92, 11 + 0, 6, 6); } c.restore();
    },
    /* 14 · שוב הדיסקו כאן — mirror ball over a crowded light-up floor, in late-90s colours */
    il_disco90(c, r) {
      fill(c, "#0a0414");
      const cols = ["#ff3dd0", "#3dffe0", "#ffe23d", "#7a4dff"];
      for (let row = 0; row < 8; row++) for (let col = -7; col < 8; col++) {
        const z0 = 1 + row * .6, z1 = z0 + .6, y0 = H * .5 + 220 / z0 - 30, y1 = H * .5 + 220 / z1 - 30;
        c.globalAlpha = .3 + r() * .6 * (1 - row / 9); poly(c, [[W / 2 + col * 130 / z0, y0], [W / 2 + (col + 1) * 130 / z0, y0], [W / 2 + (col + 1) * 130 / z1, y1], [W / 2 + col * 130 / z1, y1]], cols[(row + col + 20) % 4]);
      }
      c.globalAlpha = 1;
      for (let i = 0; i < 18; i++) { const x = r() * W, y = H * (.55 + r() * .15), s = .6 + r() * .6; c.fillStyle = "#06020c"; c.beginPath(); c.arc(x, y - 60 * s, 14 * s, 0, 7); c.fill(); c.fillRect(x - 16 * s, y - 46 * s, 32 * s, 60 * s); c.save(); c.translate(x, y - 40 * s); c.rotate(-1 - r()); c.fillRect(0, -4 * s, 46 * s, 8 * s); c.restore(); }
      const bx = W * .5, by = H * .18, br = 64;
      c.fillStyle = "#c9c9d6"; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill();
      for (let i = 0; i < 140; i++) { const a = r() * 7, d = Math.sqrt(r()) * br * .95; c.fillStyle = r() < .25 ? "#fff" : "rgba(80,80,110," + r() + ")"; c.fillRect(bx + Math.cos(a) * d - 4, by + Math.sin(a) * d - 4, 8, 8); }
      c.fillStyle = "#888"; c.fillRect(bx - 1, 0, 2, by - br);
      for (let i = 0; i < 16; i++) beam(c, bx, by, r() * Math.PI * 2, .02, 640, cols[i % 4], .3);
    },
    /* 15 · חללית — a flying saucer landing on a balcony, a single chair waiting */
    il_ufo(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#04061a"], [1, "#16204a"]]));
      stars(c, r, 220, "#fff", H);
      const ux = W * .55, uy = H * .28;
      beam(c, ux, uy + 20, Math.PI / 2, .3, 380, "#9dfff0", .35);
      c.fillStyle = "#b8c4d8"; c.beginPath(); c.ellipse(ux, uy, 150, 34, 0, 0, 7); c.fill();
      c.fillStyle = "rgba(160,255,240,.75)"; c.beginPath(); c.ellipse(ux, uy - 22, 62, 44, 0, Math.PI, 0); c.fill();
      for (let i = 0; i < 9; i++) { const x = ux - 120 + i * 30; glow(c, x, uy + 6, 18, "rgba(255,220,120,.9)"); c.fillStyle = "#ffe08a"; c.beginPath(); c.arc(x, uy + 6, 4, 0, 7); c.fill(); }
      // the balcony: rail, a tiled floor and a plastic chair
      c.fillStyle = "#1a1e2e"; c.fillRect(0, H * .72, W, H * .28);
      c.strokeStyle = "#2c3350"; c.lineWidth = 6; c.beginPath(); c.moveTo(0, H * .6); c.lineTo(W, H * .6); c.stroke();
      for (let x = 10; x < W; x += 34) { c.lineWidth = 3; c.beginPath(); c.moveTo(x, H * .6); c.lineTo(x, H * .72); c.stroke(); }
      c.fillStyle = "#e8e2d4"; c.fillRect(W * .2, H * .78, 70, 10); c.fillRect(W * .2, H * .66, 10, 60); c.fillRect(W * .2 + 4, H * .79, 6, 50); c.fillRect(W * .2 + 62, H * .79, 6, 50);
      glow(c, ux, H * .74, 200, "rgba(150,255,240,.35)");
    },
    /* 16 · על הרצפה — terrazzo floor seen from above, with sneakers kicked up and scattered light */
    il_floor(c, r) {
      fill(c, "#2a2622");
      for (let y = 0; y < H; y += 120) for (let x = 0; x < W; x += 120) { c.fillStyle = (x / 120 + y / 120) % 2 ? "#3a342e" : "#332e29"; c.fillRect(x, y, 118, 118); }
      for (let i = 0; i < 1600; i++) { c.fillStyle = ["#d8cfc0", "#7a6a58", "#b85a3a", "#e8e2d4", "#4a4038"][i % 5]; c.globalAlpha = .55; c.fillRect(r() * W, r() * H, 2 + r() * 4, 2 + r() * 3); } c.globalAlpha = 1;
      beam(c, W * .1, -40, Math.PI * .32, .25, 900, "#ffd27a", .25);
      // two sneakers pointing up, soles to the viewer
      [[W * .58, H * .42, -.15], [W * .7, H * .4, .12]].forEach(([x, y, a]) => { c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = "#f2efe6"; c.beginPath(); c.ellipse(0, 0, 38, 90, 0, 0, 7); c.fill();
        c.fillStyle = "#c0392b"; c.beginPath(); c.ellipse(0, 0, 30, 80, 0, 0, 7); c.fill();
        c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 3; for (let k = -60; k < 70; k += 16) { c.beginPath(); c.moveTo(-24, k); c.lineTo(24, k + 6); c.stroke(); } c.restore(); });
      c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .25; c.beginPath(); c.moveTo(W * .64 + Math.cos(a) * 150, H * .4 + Math.sin(a) * 150); c.lineTo(W * .64 + Math.cos(a) * 190, H * .4 + Math.sin(a) * 190); c.stroke(); }
    },
    /* 17 · אלף כבאים — a city on fire at night: flames, sirens, ladders reaching up */
    il_fire(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0a0408"], [.6, "#3a0c08"], [1, "#120604"]]));
      skyline(c, r, H * .78, 120, 300, "#0e0608", "rgba(255,170,80,.5)", .3);
      for (let i = 0; i < 46; i++) { const x = r() * W, h = 60 + r() * 260; c.fillStyle = lin(c, 0, H * .78, 0, H * .78 - h, [[0, "rgba(255,190,60,.8)"], [.5, "rgba(255,80,20,.5)"], [1, "rgba(255,40,0,0)"]]); c.beginPath(); c.moveTo(x - 26, H * .78); c.quadraticCurveTo(x + (r() - .5) * 50, H * .78 - h * .6, x, H * .78 - h); c.quadraticCurveTo(x + 8, H * .78 - h * .5, x + 26, H * .78); c.fill(); }
      c.fillStyle = "#0a0405"; c.fillRect(0, H * .78, W, H * .22);
      // fire-truck ladders reaching into the smoke
      [[W * .15, -.8], [W * .82, -2.35]].forEach(([x, a]) => { c.save(); c.translate(x, H * .86); c.rotate(a); c.strokeStyle = "#d8d0c0"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -10); c.lineTo(360, -10); c.moveTo(0, 10); c.lineTo(360, 10); c.stroke(); for (let k = 10; k < 360; k += 24) { c.lineWidth = 3; c.beginPath(); c.moveTo(k, -10); c.lineTo(k, 10); c.stroke(); } c.restore(); });
      [[W * .08, "#ff2a2a"], [W * .12, "#2a7aff"], [W * .88, "#ff2a2a"], [W * .92, "#2a7aff"]].forEach(([x, col]) => { glow(c, x, H * .86, 70, col === "#ff2a2a" ? "rgba(255,40,40,.7)" : "rgba(40,120,255,.7)"); c.fillStyle = col; c.fillRect(x - 8, H * .85, 16, 8); });
      for (let i = 0; i < 80; i++) { c.fillStyle = "rgba(255,200,120," + r() + ")"; c.fillRect(r() * W, r() * H * .7, 2, 2); }
    },
    /* 18 · היא לא יודעת מה עובר עליי — night drive: a windshield, a city in the rain, a song on the radio */
    il_drive(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0a0c18"], [1, "#1a1424"]]));
      for (let i = 0; i < 60; i++) { const x = r() * W, y = H * (.2 + r() * .35); glow(c, x, y, 20 + r() * 40, ["rgba(255,190,90,.5)", "rgba(255,80,80,.45)", "rgba(120,180,255,.4)"][i % 3]); }
      c.fillStyle = "#151020"; c.beginPath(); c.moveTo(0, H * .58); c.lineTo(W * .45, H * .48); c.lineTo(W * .55, H * .48); c.lineTo(W, H * .58); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      c.strokeStyle = "rgba(255,230,160,.7)"; c.lineWidth = 4; c.setLineDash([30, 26]); c.beginPath(); c.moveTo(W * .5, H * .5); c.lineTo(W * .5, H); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 90; i++) { c.fillStyle = "rgba(200,220,255," + (.15 + r() * .35) + ")"; c.beginPath(); c.arc(r() * W, r() * H * .7, 1 + r() * 3, 0, 7); c.fill(); }
      // dashboard + steering wheel silhouette + a glowing radio
      c.fillStyle = "#07050c"; c.beginPath(); c.moveTo(0, H * .74); c.quadraticCurveTo(W / 2, H * .66, W, H * .74); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      c.strokeStyle = "#07050c"; c.lineWidth = 26; c.beginPath(); c.arc(W * .3, H * .98, 130, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      c.fillStyle = "#0e2a3a"; c.fillRect(W * .58, H * .8, 150, 40); c.fillStyle = "#5dffd6"; c.font = "bold 24px monospace"; c.fillText("96.0 FM", W * .58 + 18, H * .8 + 28); glow(c, W * .58 + 75, H * .8 + 20, 80, "rgba(90,255,214,.35)");
      c.strokeStyle = "rgba(0,0,0,.6)"; c.lineWidth = 5; c.beginPath(); c.moveTo(W * .2, 0); c.lineTo(W * .62, H * .66); c.stroke();
    },
    /* 19 · הרקדן האוטומטי — a wind-up dancer's key and a seventies stage of mirrored stripes */
    il_automaton(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#1a0820"], [1, "#2a1006"]]));
      const cols = ["#ff6a3d", "#ffb23d", "#ffd96a", "#d94a8a", "#7a3dff"];
      for (let i = 0; i < 5; i++) { c.fillStyle = cols[i]; c.beginPath(); c.moveTo(0, H * (.62 + i * .06)); c.bezierCurveTo(W * .3, H * (.4 + i * .06), W * .6, H * (.8 + i * .05), W, H * (.5 + i * .06)); c.lineTo(W, H * (.56 + i * .06)); c.bezierCurveTo(W * .6, H * (.86 + i * .05), W * .3, H * (.46 + i * .06), 0, H * (.68 + i * .06)); c.fill(); }
      beam(c, W * .5, -40, Math.PI / 2, .2, 600, "#ffe8c0", .4);
      // a music-box drum and a big wind-up key
      const cx = W * .5, cy = H * .42; c.fillStyle = "#c9a24a"; c.fillRect(cx - 110, cy - 30, 220, 60); c.fillStyle = "#e8c86a"; for (let x = cx - 104; x < cx + 104; x += 12) c.fillRect(x, cy - 30 + (Math.floor(r() * 5)) * 12, 4, 4);
      c.fillStyle = "#8a6a2a"; c.beginPath(); c.ellipse(cx - 110, cy, 14, 30, 0, 0, 7); c.ellipse(cx + 110, cy, 14, 30, 0, 0, 7); c.fill();
      c.fillStyle = "#d8b45a"; c.fillRect(cx + 120, cy - 6, 70, 12);
      c.beginPath(); c.ellipse(cx + 214, cy - 34, 30, 40, .3, 0, 7); c.ellipse(cx + 214, cy + 34, 30, 40, -.3, 0, 7); c.fill();
      c.fillStyle = "#1a0820"; c.beginPath(); c.ellipse(cx + 214, cy - 34, 12, 18, .3, 0, 7); c.ellipse(cx + 214, cy + 34, 12, 18, -.3, 0, 7); c.fill();
      for (let i = 0; i < 6; i++) { c.fillStyle = "#ffe8c0"; c.font = "bold 40px serif"; c.globalAlpha = .6; c.fillText("\u266A", cx - 220 + i * 70, cy - 90 - Math.sin(i) * 40); } c.globalAlpha = 1;
    },
    /* 20 · דיווה — the big Eurovision stage: feathers, a crown of lights, a sea of flags */
    il_diva(c, r) {
      fill(c, lin(c, 0, 0, 0, H, [[0, "#0a0418"], [.7, "#2a0a3a"], [1, "#05020a"]]));
      for (let i = 0; i < 12; i++) beam(c, W * (.05 + i * .082), -30, Math.PI / 2 + (i - 5.5) * .05, .05, 700, i % 2 ? "#ff3dd0" : "#3dc4ff", .25);
      const cx = W * .5, cy = H * .5;
      for (let i = 0; i < 26; i++) { const a = Math.PI + (i / 25) * Math.PI; c.save(); c.translate(cx, cy); c.rotate(a + Math.PI / 2); c.fillStyle = i % 2 ? "rgba(255,255,255,.85)" : "rgba(240,220,255,.75)"; c.beginPath(); c.ellipse(0, -150, 18, 120, 0, 0, 7); c.fill();
        c.strokeStyle = "rgba(180,150,220,.6)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -40); c.lineTo(0, -260); c.stroke(); c.restore(); }
      glow(c, cx, cy - 40, 200, "rgba(255,230,255,.55)");
      c.fillStyle = "#ffd23d"; poly(c, [[cx - 70, cy - 100], [cx - 70, cy - 150], [cx - 40, cy - 120], [cx, cy - 170], [cx + 40, cy - 120], [cx + 70, cy - 150], [cx + 70, cy - 100]], "#ffd23d");
      [[-70, -150], [0, -170], [70, -150]].forEach(([dx, dy]) => { glow(c, cx + dx, cy + dy, 24, "rgba(255,255,255,.9)"); });
      c.fillStyle = "#0a0410"; c.fillRect(0, H * .8, W, H * .2);
      for (let i = 0; i < 60; i++) { const x = r() * W, y = H * (.78 + r() * .2); c.fillStyle = "#0a0410"; c.fillRect(x, y - 40, 2, 40); c.fillStyle = ["#ffffff", "#2f63c4", "#ff3d3d", "#ffd23d", "#3dd67a"][i % 5]; c.fillRect(x + 2, y - 40, 22, 14); }
      for (let i = 0; i < 120; i++) { c.fillStyle = "rgba(255,240,255," + r() + ")"; c.fillRect(r() * W, r() * H * .75, 2, 2); }
    },
  };

  function artNameFor(key) {
    if (window.SC_ART_RESOLVE) { const n = window.SC_ART_RESOLVE(key); if (n) return n; }
    const m = /^(\d\d)-(tv|film)$/.exec(key || "");
    if (m) { const d = (window.SC_SETLIST || [])[+m[1] - 1]; if (d && d[m[2]] && d[m[2]].art) return d[m[2]].art; }
    return key;
  }

  function generate(key) {
    key = artNameFor(key);
    if (cache[key]) return cache[key];
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d"), r = rng(key);
    try { (P[key] || P.glee)(c, r); finish(c, r); } catch (e) { c.fillStyle = "#14110e"; c.fillRect(0, 0, W, H); }
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

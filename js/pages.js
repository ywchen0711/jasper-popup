// The printed pages: each spread is painted as one wide watercolor picture (2048 x 717), then cut into the left and
// right page. Spread coordinates: x -10..10 (the spine at 0), z -3.5 (top of the page) .. 3.5 (the edge nearest you).
import { mk, grainTile, OL, jasper, pandaMom, baby } from './art.js';
export const SW = 2048, SH = 717, K = SW / 20;
export const FONT = '"Comic Sans MS","Chalkboard SE","Arial Rounded MT Bold","Microsoft JhengHei",sans-serif';
export const X = (x) => (x + 10) * K, Y = (z) => (z + 3.5) * K;

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function kit(a, seed = 1) {
  const r = rng(seed);
  const k = {
    r,
    fill(col) { a.fillStyle = col; a.fillRect(0, 0, SW, SH); },
    wash(x, z, rad, col, al = 0.3) { a.save(); a.globalAlpha = al; const g = a.createRadialGradient(X(x), Y(z), 0, X(x), Y(z), rad * K); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); a.fillStyle = g; a.fillRect(X(x) - rad * K, Y(z) - rad * K, rad * K * 2, rad * K * 2); a.restore(); },
    blobs(n, cols, al = 0.18, rmin = 0.6, rmax = 2.2, area = [-10, -3.5, 10, 3.5]) { for (let i = 0; i < n; i++) k.wash(area[0] + r() * (area[2] - area[0]), area[1] + r() * (area[3] - area[1]), rmin + r() * (rmax - rmin), cols[i % cols.length], al); },
    tufts(n, col, area = [-10, -3.5, 10, 3.5], skip) {
      a.save(); a.strokeStyle = col; a.lineWidth = 3; a.lineCap = 'round'; a.globalAlpha = 0.6;
      for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[2] - area[0]), z = area[1] + r() * (area[3] - area[1]); if (skip && skip(x, z)) continue; const px = X(x), py = Y(z); a.beginPath(); a.moveTo(px - 7, py - 10); a.lineTo(px - 2, py); a.moveTo(px, py - 14); a.lineTo(px, py); a.moveTo(px + 7, py - 10); a.lineTo(px + 2, py); a.stroke(); }
      a.restore();
    },
    flowers(n, cols, area = [-10, -3.5, 10, 3.5], skip) {
      for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[2] - area[0]), z = area[1] + r() * (area[3] - area[1]); if (skip && skip(x, z)) continue; const px = X(x), py = Y(z), c = cols[i % cols.length];
        a.save(); a.globalAlpha = 0.85; for (let p = 0; p < 5; p++) { const t = (p / 5) * 6.28; a.beginPath(); a.arc(px + Math.cos(t) * 6, py + Math.sin(t) * 6, 5, 0, 7); a.fillStyle = c; a.fill(); } a.beginPath(); a.arc(px, py, 4, 0, 7); a.fillStyle = '#ffe066'; a.fill(); a.restore(); }
    },
    // a soft-edged band along a list of points (paths, rivers)
    band(pts, w, col, edge, al = 1) {
      a.save(); a.globalAlpha = al; a.lineJoin = a.lineCap = 'round';
      const go = () => { a.beginPath(); a.moveTo(X(pts[0][0]), Y(pts[0][1])); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, mz = (pts[i][1] + pts[i + 1][1]) / 2; a.quadraticCurveTo(X(pts[i][0]), Y(pts[i][1]), X(mx), Y(mz)); } const l = pts[pts.length - 1]; a.lineTo(X(l[0]), Y(l[1])); };
      if (edge) { go(); a.lineWidth = w * K + 10; a.strokeStyle = edge; a.stroke(); }
      go(); a.lineWidth = w * K; a.strokeStyle = col; a.stroke(); a.restore();
    },
    dots(pts, col, rad = 4, al = 0.5) { a.save(); a.globalAlpha = al; a.fillStyle = col; for (const [x, z] of pts) { a.beginPath(); a.arc(X(x), Y(z), rad, 0, 7); a.fill(); } a.restore(); },
    ellipse(x, z, rx, rz, col, al = 1, stroke) { a.save(); a.globalAlpha = al; a.beginPath(); a.ellipse(X(x), Y(z), rx * K, rz * K, 0, 0, 7); a.fillStyle = col; a.fill(); if (stroke) { a.lineWidth = 4; a.strokeStyle = stroke; a.stroke(); } a.restore(); },
    text(t, x, z, size, col = OL, align = 'left', font = FONT) { a.save(); a.font = `bold ${size}px ${font}`; a.fillStyle = col; a.textAlign = align; a.textBaseline = 'middle'; a.fillText(t, X(x), Y(z)); a.restore(); },
  };
  return k;
}

// paint(a, kit) draws the whole spread; returns the two page canvases
export function paintSpread(paint, seed, title) {
  const c = mk(SW, SH), a = c.getContext('2d');
  a.fillStyle = '#fbf5e6'; a.fillRect(0, 0, SW, SH);
  const k = kit(a, seed); paint(a, k);
  // the page number and title, printed in the top corner of the left page
  if (title) {
    a.save(); a.font = `bold 30px ${FONT}`; const tw = a.measureText(title.t).width; a.fillStyle = 'rgba(255,250,238,.85)'; a.beginPath(); a.roundRect(X(-9.75), Y(2.62), tw + 110, 70, 18); a.fill(); a.restore();
    k.text(title.n, -9.55, 2.97, 34, '#e8743a'); k.text(title.t, -9.05, 2.94, 30, OL);
  }
  // a dotted border and the grain of the paper
  a.save(); a.setLineDash([3, 12]); a.lineCap = 'round'; a.lineWidth = 3; a.strokeStyle = 'rgba(120,90,60,.28)'; a.strokeRect(14, 14, SW / 2 - 28, SH - 28); a.strokeRect(SW / 2 + 14, 14, SW / 2 - 28, SH - 28); a.restore();
  a.save(); a.globalCompositeOperation = 'multiply'; a.globalAlpha = 0.5; a.fillStyle = a.createPattern(grainTile(), 'repeat'); a.fillRect(0, 0, SW, SH); a.restore();
  const half = (side) => {
    const p = mk(SW / 2, SH), x = p.getContext('2d'); x.drawImage(c, side ? -SW / 2 : 0, 0);
    // the shadow of the gutter, and the page curling down into it
    const g = side ? x.createLinearGradient(0, 0, 90, 0) : x.createLinearGradient(SW / 2, 0, SW / 2 - 90, 0);
    g.addColorStop(0, 'rgba(70,45,25,.38)'); g.addColorStop(0.35, 'rgba(70,45,25,.12)'); g.addColorStop(1, 'rgba(70,45,25,0)'); x.fillStyle = g; x.fillRect(0, 0, SW / 2, SH);
    const e = side ? x.createLinearGradient(SW / 2, 0, SW / 2 - 30, 0) : x.createLinearGradient(0, 0, 30, 0); e.addColorStop(0, 'rgba(70,45,25,.14)'); e.addColorStop(1, 'rgba(70,45,25,0)'); x.fillStyle = e; x.fillRect(0, 0, SW / 2, SH);
    return p;
  };
  return { L: half(0), R: half(1), full: c };
}

// the book's cover
export function paintCover(lang) {
  const W = 1024, H = 717, c = mk(W, H), a = c.getContext('2d');
  a.fillStyle = '#d4553f'; a.fillRect(0, 0, W, H);
  const g = a.createRadialGradient(W * 0.5, H * 0.4, 50, W * 0.5, H * 0.5, W * 0.7); g.addColorStop(0, 'rgba(255,220,170,.35)'); g.addColorStop(1, 'rgba(60,10,0,.35)'); a.fillStyle = g; a.fillRect(0, 0, W, H);
  a.strokeStyle = '#ffd98a'; a.lineWidth = 6; a.strokeRect(30, 30, W - 60, H - 60); a.lineWidth = 2; a.strokeRect(44, 44, W - 88, H - 88);
  for (const [x, y] of [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]]) { a.beginPath(); a.arc(x, y, 14, 0, 7); a.fillStyle = '#ffd98a'; a.fill(); }
  a.save(); a.globalCompositeOperation = 'multiply'; a.globalAlpha = 0.5; a.fillStyle = a.createPattern(grainTile(), 'repeat'); a.fillRect(0, 0, W, H); a.restore();
  // a label with the title
  a.fillStyle = '#fff6e0'; a.beginPath(); a.roundRect(120, 92, W - 240, 220, 40); a.fill(); a.lineWidth = 6; a.strokeStyle = OL; a.stroke();
  a.fillStyle = OL; a.textAlign = 'center'; a.textBaseline = 'middle';
  const F = '"Comic Sans MS","Chalkboard SE","Arial Rounded MT Bold",sans-serif';
  if (lang === 'en') { a.font = `bold 64px ${F}`; a.fillText("Jasper's Pop-Up", W / 2, 165); a.font = `bold 52px ${F}`; a.fillStyle = '#e8743a'; a.fillText('Panda Adventure', W / 2, 245); }
  else { a.font = `bold 78px ${F}`; a.fillText('Jasper 的立體書', W / 2, 160); a.font = `bold 60px ${F}`; a.fillStyle = '#e8743a'; a.fillText('熊貓寶寶在哪裡？', W / 2, 250); }
  // the cast, standing on the cover
  const put = (cut, x, y, sc) => a.drawImage(cut.img, x - cut.img.width * sc / 2, y - cut.img.height * sc, cut.img.width * sc, cut.img.height * sc);
  a.fillStyle = 'rgba(255,240,200,.25)'; a.beginPath(); a.ellipse(W / 2, 640, 380, 40, 0, 0, 7); a.fill();
  put(pandaMom('happy'), 610, 650, 1.35); put(jasper(3), 400, 650, 1.55);
  [[200, 640], [270, 660], [790, 655], [860, 640], [520, 665]].forEach(([x, y], i) => put(baby(i), x, y, 1.25));
  return c;
}

export function paintStack() {
  const c = mk(512, 64), a = c.getContext('2d'); a.fillStyle = '#f4ead4'; a.fillRect(0, 0, 512, 64);
  for (let y = 2; y < 64; y += 3) { a.fillStyle = `rgba(150,120,90,${0.15 + Math.random() * 0.2})`; a.fillRect(0, y, 512, 1); }
  return c;
}
export function paintWood() {
  const W = 1024, c = mk(W, W), a = c.getContext('2d'); a.fillStyle = '#b9835a'; a.fillRect(0, 0, W, W); const r = rng(9);
  for (let i = 0; i < 9; i++) { a.fillStyle = i % 2 ? '#b07a52' : '#c08c62'; a.fillRect(0, i * (W / 9), W, W / 9 - 3); a.fillStyle = 'rgba(80,45,20,.35)'; a.fillRect(0, (i + 1) * (W / 9) - 3, W, 3); }
  a.globalAlpha = 0.18; a.strokeStyle = '#6e4224'; a.lineWidth = 2;
  for (let i = 0; i < 140; i++) { const y = r() * W, x = r() * W, l = 80 + r() * 300; a.beginPath(); a.moveTo(x, y); a.bezierCurveTo(x + l * 0.3, y + 4, x + l * 0.6, y - 4, x + l, y + (r() - 0.5) * 6); a.stroke(); }
  return c;
}

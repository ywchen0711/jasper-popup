// All the pictures in the book, drawn with the canvas: every character and prop is a paper cut-out with a white
// die-cut rim, a little paper grain and a plain paper back. Each drawing is authored in its own design box
// (e.g. 100 x 170) and scaled to the size it is used at.
export const PX = 100; // canvas pixels per world unit
export const OL = '#4a3122'; // the ink line
const cache = new Map();
export const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); return c; };

let grain = null;
export function grainTile() {
  if (grain) return grain;
  const c = mk(256, 256), x = c.getContext('2d'), d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = 215 + Math.random() * 40; d.data[i] = v; d.data[i + 1] = v - 3; d.data[i + 2] = v - 8; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); return (grain = c);
}

// a cut-out: wu x hu world units of art, plus the paper rim round it
export function cutout(key, wu, hu, draw) {
  if (cache.has(key)) return cache.get(key);
  const B = 7, W = Math.round(wu * PX) + B * 2, H = Math.round(hu * PX) + B * 2;
  const art = mk(W, H), a = art.getContext('2d');
  a.save(); a.translate(B, B); a.lineJoin = 'round'; a.lineCap = 'round'; draw(a, W - 2 * B, H - 2 * B); a.restore();
  const g = mk(W, H), gx = g.getContext('2d');
  gx.drawImage(art, 0, 0); gx.globalCompositeOperation = 'multiply'; gx.globalAlpha = 0.45; gx.fillStyle = gx.createPattern(grainTile(), 'repeat'); gx.fillRect(0, 0, W, H);
  gx.globalAlpha = 1; gx.globalCompositeOperation = 'destination-in'; gx.drawImage(art, 0, 0);
  const rim = (r, col) => { const s = mk(W, H), sx = s.getContext('2d'); for (let k = 0; k < 20; k++) { const t = (k / 20) * Math.PI * 2; sx.drawImage(art, Math.cos(t) * r, Math.sin(t) * r); } sx.drawImage(art, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = col; sx.fillRect(0, 0, W, H); return s; };
  const out = mk(W, H), o = out.getContext('2d');
  o.drawImage(rim(B - 0.5, 'rgba(140,115,90,.6)'), 0, 0); o.drawImage(rim(B - 2, '#fffaf0'), 0, 0); o.drawImage(g, 0, 0);
  const res = { img: out, back: rim(B - 0.5, '#eadfca'), w: W / PX, h: H / PX, b: B / PX, key };
  cache.set(key, res); return res;
}

// ---------------------------------------------------------------- drawing kit (design units)
export function P(a, fill, lw = 4, stroke = OL) { if (fill) { a.fillStyle = fill; a.fill(); } if (lw) { a.lineWidth = lw; a.strokeStyle = stroke; a.stroke(); } }
export const circ = (a, x, y, r, fill, lw = 4) => { a.beginPath(); a.arc(x, y, r, 0, Math.PI * 2); P(a, fill, lw); };
export const ell = (a, x, y, rx, ry, rot, fill, lw = 4) => { a.beginPath(); a.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); P(a, fill, lw); };
export const rr = (a, x, y, w, h, r, fill, lw = 4) => { a.beginPath(); a.roundRect(x, y, w, h, r); P(a, fill, lw); };
export const poly = (a, pts, fill, lw = 4, close = true) => { a.beginPath(); pts.forEach(([x, y], i) => (i ? a.lineTo(x, y) : a.moveTo(x, y))); if (close) a.closePath(); P(a, fill, lw); };
const line = (a, pts, lw = 4, col = OL) => { a.beginPath(); pts.forEach(([x, y], i) => (i ? a.lineTo(x, y) : a.moveTo(x, y))); a.lineWidth = lw; a.strokeStyle = col; a.stroke(); };
const arcL = (a, x, y, r, s, e, lw = 3.5, col = OL) => { a.beginPath(); a.arc(x, y, r, s, e); a.lineWidth = lw; a.strokeStyle = col; a.stroke(); };
const shine = (a, x, y, r) => { circ(a, x, y, r, '#fff', 0); };
export function eye(a, x, y, rx, ry) { ell(a, x, y, rx, ry, 0, '#2a1a12', 0); shine(a, x + rx * 0.3, y - ry * 0.35, rx * 0.42); shine(a, x - rx * 0.3, y + ry * 0.35, rx * 0.18); }
const happyEye = (a, x, y, r, lw = 3.5) => arcL(a, x, y + r * 0.4, r, Math.PI * 1.1, Math.PI * 1.9, lw);
const cheek = (a, x, y, r) => { a.save(); a.globalAlpha = 0.55; circ(a, x, y, r, '#ff8fa0', 0); a.restore(); };
const scaled = (a, w, h, bw, bh) => a.scale(w / bw, h / bh);
// soft watercolor highlight inside a shape just drawn (clip to the current path first)
function wash(a, x, y, r, col, alpha = 0.35) { a.save(); a.globalAlpha = alpha; const g = a.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); a.fillStyle = g; a.fillRect(x - r, y - r, r * 2, r * 2); a.restore(); }

// ---------------------------------------------------------------- Jasper (faces right; f: 0 stand, 1/2 steps, 3 cheer)
export function jasper(f = 0) {
  return cutout('jasper' + f, 1.05, 1.75, (a, w, h) => {
    scaled(a, w, h, 105, 175);
    const sw = f === 1 ? 1 : f === 2 ? -1 : 0, up = f === 3;
    // legs and shoes
    rr(a, 37 - sw * 5, 128, 13, 32, 6, '#ffd9b8', 3.5); rr(a, 31 - sw * 8, 155, 22, 13, 7, '#e8473c', 3.5);
    rr(a, 54 + sw * 5, 128, 13, 32, 6, '#ffd9b8', 3.5); rr(a, 52 + sw * 8, 155, 23, 13, 7, '#e8473c', 3.5);
    rr(a, 31, 120, 42, 18, 7, '#3f6fc4', 3.5);
    // backpack
    rr(a, 16, 90, 22, 36, 9, '#4caf6a', 3.5); line(a, [[22, 100], [32, 100]], 3);
    // back arm
    if (up) { rr(a, 26, 66, 12, 30, 6, '#ffa53a', 3.5); circ(a, 31, 64, 7, '#ffd9b8', 3.5); }
    // shirt with stripes
    a.save(); a.beginPath(); a.roundRect(28, 88, 48, 40, 15); a.clip(); a.fillStyle = '#ffa53a'; a.fillRect(20, 80, 70, 60); a.fillStyle = '#fff1c2'; for (const y of [99, 110, 121]) a.fillRect(20, y, 70, 4.5); a.restore();
    rr(a, 28, 88, 48, 40, 15, null, 3.5);
    // front arm (swings)
    if (up) { rr(a, 66, 62, 12, 32, 6, '#ffa53a', 3.5); circ(a, 72, 60, 7.5, '#ffd9b8', 3.5); }
    else { a.save(); a.translate(66, 95); a.rotate(sw * 0.45 - 0.1); rr(a, -6, 0, 12, 27, 6, '#ffa53a', 3.5); circ(a, 0, 29, 7, '#ffd9b8', 3.5); a.restore(); }
    // head
    circ(a, 20, 56, 9, '#ffd9b8', 3.5); arcL(a, 20, 56, 4, 0.6, 2.6, 2.5);
    circ(a, 54, 50, 38, '#ffd9b8', 4);
    a.save(); a.beginPath(); a.arc(54, 50, 38, 0, 7); a.clip(); wash(a, 66, 36, 30, '#fff', 0.5); a.restore();
    // hair: a messy brown cap of tufts
    poly(a, [[16, 52], [14, 34], [22, 20], [34, 11], [50, 7], [66, 9], [80, 16], [90, 28], [94, 40], [84, 36], [80, 30], [72, 34], [64, 27], [54, 33], [44, 26], [36, 34], [28, 32], [24, 44]], '#6b4126', 3.5);
    poly(a, [[46, 9], [44, -2], [56, 8]], '#6b4126', 3.5); poly(a, [[58, 8], [66, -1], [68, 10]], '#6b4126', 3.5);
    a.save(); a.globalAlpha = 0.35; line(a, [[40, 16], [56, 13]], 3, '#a8734a'); a.restore();
    // face
    if (up) { happyEye(a, 64, 54, 6); happyEye(a, 84, 53, 6); }
    else { eye(a, 64, 55, 5, 7); eye(a, 84, 54, 5, 7); }
    line(a, [[59, 43], [68, 42]], 2.8); line(a, [[80, 41], [88, 43]], 2.8);
    cheek(a, 56, 68, 7); cheek(a, 90, 66, 6);
    if (up) { a.beginPath(); a.moveTo(66, 70); a.quadraticCurveTo(76, 84, 86, 69); a.closePath(); P(a, '#c4433b', 3); }
    else arcL(a, 76, 66, 8, 0.25, 2.6, 3.2);
  });
}

// ---------------------------------------------------------------- pandas
export function pandaMom(mood = 'sad') {
  return cutout('mom-' + mood, 1.7, 2.25, (a, w, h) => {
    scaled(a, w, h, 170, 225);
    ell(a, 55, 210, 22, 14, 0, '#2c2a2e', 3.5); ell(a, 115, 210, 22, 14, 0, '#2c2a2e', 3.5);
    ell(a, 85, 156, 60, 58, 0, '#fbfaf5', 4);
    // apron
    a.beginPath(); a.moveTo(50, 128); a.quadraticCurveTo(85, 120, 120, 128); a.lineTo(128, 196); a.quadraticCurveTo(85, 212, 42, 196); a.closePath(); P(a, '#ff9bb3', 3.5);
    a.save(); a.globalAlpha = 0.5; for (let i = 0; i < 9; i++) circ(a, 52 + (i % 3) * 30 + (i > 2 ? 8 : 0), 140 + Math.floor(i / 3) * 20, 3.2, '#fff', 0); a.restore();
    rr(a, 70, 160, 30, 22, 8, '#ffd2dd', 3); // pocket
    // arms
    if (mood === 'happy') { ell(a, 26, 112, 16, 30, 0.6, '#2c2a2e', 3.5); ell(a, 144, 112, 16, 30, -0.6, '#2c2a2e', 3.5); }
    else { ell(a, 32, 150, 16, 30, 0.3, '#2c2a2e', 3.5); ell(a, 130, 118, 15, 28, -0.9, '#2c2a2e', 3.5); rr(a, 112, 92, 26, 18, 5, '#bfe3ff', 3); }
    // head
    circ(a, 40, 30, 19, '#2c2a2e', 3.5); circ(a, 130, 30, 19, '#2c2a2e', 3.5);
    circ(a, 85, 72, 54, '#fbfaf5', 4);
    a.save(); a.beginPath(); a.arc(85, 72, 54, 0, 7); a.clip(); wash(a, 100, 50, 40, '#fff', 0.6); a.restore();
    ell(a, 63, 72, 15, 19, 0.55, '#2c2a2e', 0); ell(a, 107, 72, 15, 19, -0.55, '#2c2a2e', 0);
    if (mood === 'happy') { arcL(a, 64, 72 + 2.8, 7, Math.PI * 1.1, Math.PI * 1.9, 3.5, '#fff'); arcL(a, 106, 72 + 2.8, 7, Math.PI * 1.1, Math.PI * 1.9, 3.5, '#fff'); }
    else { circ(a, 65, 73, 6.5, '#fff', 0); circ(a, 66, 74, 4, '#2c2a2e', 0); shine(a, 67.5, 72, 1.6); circ(a, 105, 73, 6.5, '#fff', 0); circ(a, 104, 74, 4, '#2c2a2e', 0); shine(a, 105.5, 72, 1.6); }
    ell(a, 85, 92, 9, 6, 0, '#2c2a2e', 0);
    if (mood === 'happy') { a.beginPath(); a.moveTo(74, 100); a.quadraticCurveTo(85, 116, 96, 100); a.closePath(); P(a, '#e05561', 3); }
    else { arcL(a, 85, 112, 9, Math.PI * 1.15, Math.PI * 1.85, 3.2); line(a, [[50, 56], [64, 49]], 3.2); line(a, [[120, 56], [106, 49]], 3.2);
      a.beginPath(); a.moveTo(56, 88); a.quadraticCurveTo(50, 100, 55, 104); a.quadraticCurveTo(62, 100, 56, 88); P(a, '#7cc8ff', 2); }
    cheek(a, 52, 96, 9); cheek(a, 118, 96, 9);
    // a flower on her ear
    for (let k = 0; k < 5; k++) { const t = (k / 5) * Math.PI * 2; circ(a, 130 + Math.cos(t) * 9, 24 + Math.sin(t) * 9, 7, '#ffd34d', 2.5); }
    circ(a, 130, 24, 6, '#ff8a3d', 2.5);
  });
}

export const BABIES = [
  { id: 'yuan', name: { zh: '圓圓', en: 'Yuanyuan' }, acc: 'bow', col: '#e84a5f' },
  { id: 'dou', name: { zh: '豆豆', en: 'Doudou' }, acc: 'leaf', col: '#5cbf5a' },
  { id: 'mao', name: { zh: '毛毛', en: 'Maomao' }, acc: 'scarf', col: '#4a90e2' },
  { id: 'tang', name: { zh: '糖糖', en: 'Tangtang' }, acc: 'clip', col: '#ff7ac8' },
  { id: 'qiu', name: { zh: '球球', en: 'Qiuqiu' }, acc: 'ball', col: '#ffc531' },
];
export function baby(i, mood = 'happy') {
  const B = BABIES[i];
  return cutout('baby' + i + mood, 0.72, 0.8, (a, w, h) => {
    scaled(a, w, h, 72, 80);
    ell(a, 24, 74, 9, 6, 0, '#2c2a2e', 3); ell(a, 48, 74, 9, 6, 0, '#2c2a2e', 3);
    ell(a, 36, 58, 22, 18, 0, '#fbfaf5', 3.5);
    ell(a, 15, 56, 7, 11, 0.4, '#2c2a2e', 3); ell(a, 57, 56, 7, 11, -0.4, '#2c2a2e', 3);
    if (B.acc === 'scarf') { rr(a, 16, 42, 40, 10, 5, B.col, 3); rr(a, 42, 46, 9, 18, 4, B.col, 3); }
    circ(a, 17, 12, 9, '#2c2a2e', 3); circ(a, 55, 12, 9, '#2c2a2e', 3);
    circ(a, 36, 31, 24, '#fbfaf5', 3.5);
    a.save(); a.beginPath(); a.arc(36, 31, 24, 0, 7); a.clip(); wash(a, 44, 22, 18, '#fff', 0.7); a.restore();
    ell(a, 27, 31, 7, 9, 0.5, '#2c2a2e', 0); ell(a, 45, 31, 7, 9, -0.5, '#2c2a2e', 0);
    if (mood === 'sleep') { arcL(a, 27, 30, 4, 0.2, 2.9, 2.4, '#fff'); arcL(a, 45, 30, 4, 0.2, 2.9, 2.4, '#fff'); }
    else if (mood === 'sad') { circ(a, 27, 32, 3.4, '#fff', 0); circ(a, 45, 32, 3.4, '#fff', 0); circ(a, 27, 33, 2, '#2c2a2e', 0); circ(a, 45, 33, 2, '#2c2a2e', 0); }
    else { circ(a, 27, 31, 3.6, '#fff', 0); circ(a, 45, 31, 3.6, '#fff', 0); circ(a, 27.6, 31.6, 2.3, '#2c2a2e', 0); circ(a, 45.6, 31.6, 2.3, '#2c2a2e', 0); }
    ell(a, 36, 40, 4.5, 3, 0, '#2c2a2e', 0);
    if (mood === 'sad') arcL(a, 36, 49, 4, Math.PI * 1.2, Math.PI * 1.8, 2.4); else { arcL(a, 33, 42, 3, 0.2, 2.6, 2.2); arcL(a, 39, 42, 3, 0.5, 2.9, 2.2); }
    cheek(a, 22, 40, 5); cheek(a, 50, 40, 5);
    if (B.acc === 'bow') { poly(a, [[52, 6], [64, 0], [64, 14]], B.col, 2.5); poly(a, [[52, 6], [42, -1], [43, 13]], B.col, 2.5); circ(a, 52, 7, 3.5, '#ff9aa8', 2.5); }
    if (B.acc === 'leaf') { a.beginPath(); a.moveTo(36, 8); a.quadraticCurveTo(48, -6, 58, 2); a.quadraticCurveTo(48, 12, 36, 8); P(a, B.col, 2.5); line(a, [[36, 8], [34, 2]], 2.5); }
    if (B.acc === 'clip') { circ(a, 18, 10, 6, B.col, 2.5); poly(a, [[12, 10], [6, 5], [6, 15]], '#ffd0ea', 2.2); poly(a, [[24, 10], [30, 5], [30, 15]], '#ffd0ea', 2.2); }
    if (B.acc === 'ball') { circ(a, 36, 63, 11, B.col, 3); arcL(a, 36, 63, 11, -0.6, 0.6, 2.4, '#fff'); line(a, [[26, 60], [46, 60]], 2.2, '#e39a12'); }
  });
}

// ---------------------------------------------------------------- the neighbours
export function frog() {
  return cutout('frog', 0.95, 0.75, (a, w, h) => {
    scaled(a, w, h, 95, 75);
    ell(a, 47, 64, 44, 9, 0, '#6cc46a', 3.5);
    ell(a, 47, 44, 30, 22, 0, '#7fd36b', 3.5); ell(a, 47, 50, 18, 12, 0, '#d9f5b8', 0);
    circ(a, 30, 22, 12, '#7fd36b', 3.5); circ(a, 64, 22, 12, '#7fd36b', 3.5);
    eye(a, 31, 22, 5, 6); eye(a, 63, 22, 5, 6);
    arcL(a, 47, 36, 14, 0.3, 2.84, 3.2); cheek(a, 26, 42, 5); cheek(a, 68, 42, 5);
  });
}
export function owl() {
  return cutout('owl', 0.85, 1.05, (a, w, h) => {
    scaled(a, w, h, 85, 105);
    poly(a, [[18, 24], [14, 4], [32, 18]], '#9a6b44', 3); poly(a, [[67, 24], [71, 4], [53, 18]], '#9a6b44', 3);
    ell(a, 42, 58, 36, 44, 0, '#a87650', 3.5); ell(a, 42, 72, 22, 26, 0, '#f3d9a8', 0);
    for (let i = 0; i < 6; i++) arcL(a, 32 + (i % 3) * 10, 66 + Math.floor(i / 3) * 10, 4, 0.2, 2.9, 2, '#c99a64');
    circ(a, 28, 38, 14, '#fff6dc', 3); circ(a, 56, 38, 14, '#fff6dc', 3); eye(a, 29, 39, 6, 7); eye(a, 55, 39, 6, 7);
    poly(a, [[38, 48], [46, 48], [42, 57]], '#ffb43a', 2.5);
    ell(a, 8, 60, 8, 22, 0.2, '#8a5c38', 3); ell(a, 76, 60, 8, 22, -0.2, '#8a5c38', 3);
  });
}
export function penguin() {
  return cutout('penguin', 0.75, 1.0, (a, w, h) => {
    scaled(a, w, h, 75, 100);
    ell(a, 27, 95, 10, 5, 0, '#ffa531', 3); ell(a, 48, 95, 10, 5, 0, '#ffa531', 3);
    ell(a, 37, 58, 30, 38, 0, '#2f3a52', 3.5); ell(a, 37, 64, 20, 28, 0, '#fdfdfb', 0);
    ell(a, 8, 60, 7, 20, 0.3, '#2f3a52', 3); ell(a, 66, 60, 7, 20, -0.3, '#2f3a52', 3);
    rr(a, 14, 38, 46, 10, 5, '#e8473c', 3); rr(a, 44, 42, 9, 18, 4, '#e8473c', 3);
    eye(a, 28, 24, 4, 5); eye(a, 46, 24, 4, 5); poly(a, [[32, 31], [42, 31], [37, 37]], '#ffa531', 2.5);
    cheek(a, 22, 32, 4); cheek(a, 52, 32, 4);
    rr(a, 20, 0, 34, 14, 7, '#7fb8ff', 3); circ(a, 37, 0, 6, '#fff', 3);
  });
}
export function rabbit() {
  return cutout('rabbit', 0.95, 1.45, (a, w, h) => {
    scaled(a, w, h, 95, 145);
    ell(a, 34, 22, 9, 26, -0.1, '#fdf8f2', 3.5); ell(a, 34, 24, 4, 18, -0.1, '#ffc0cc', 0);
    ell(a, 62, 22, 9, 26, 0.15, '#fdf8f2', 3.5); ell(a, 62, 24, 4, 18, 0.15, '#ffc0cc', 0);
    ell(a, 48, 110, 32, 34, 0, '#fdf8f2', 3.5);
    a.beginPath(); a.moveTo(24, 92); a.lineTo(72, 92); a.lineTo(76, 138); a.quadraticCurveTo(48, 146, 20, 138); a.closePath(); P(a, '#7ec2e8', 3.5);
    rr(a, 38, 108, 20, 14, 5, '#bfe3ff', 2.5);
    circ(a, 48, 66, 30, '#fdf8f2', 3.5); eye(a, 38, 64, 4, 5.5); eye(a, 58, 64, 4, 5.5);
    ell(a, 48, 74, 4, 3, 0, '#ff8aa0', 0); arcL(a, 45, 77, 3, 0.2, 2.6, 2.2); arcL(a, 51, 77, 3, 0.5, 2.9, 2.2);
    cheek(a, 30, 76, 6); cheek(a, 66, 76, 6);
    rr(a, 26, 40, 44, 8, 4, '#fff', 3); // a cook's cap band
    a.beginPath(); a.moveTo(28, 42); a.quadraticCurveTo(20, 24, 36, 26); a.quadraticCurveTo(48, 14, 60, 26); a.quadraticCurveTo(76, 24, 68, 42); a.closePath(); P(a, '#fff', 3);
  });
}

// ---------------------------------------------------------------- scenery
function leafy(a, cx, cy, rs, base, dark) {
  for (const [dx, dy, r] of rs) circ(a, cx + dx, cy + dy, r, base, 4);
  a.save(); for (const [dx, dy, r] of rs) { a.beginPath(); a.arc(cx + dx, cy + dy, r - 2, 0, 7); a.fillStyle = base; a.fill(); }
  a.globalAlpha = 0.35; for (const [dx, dy, r] of rs) { a.beginPath(); a.arc(cx + dx + r * 0.25, cy + dy + r * 0.35, r * 0.55, 0, 7); a.fillStyle = dark; a.fill(); }
  a.globalAlpha = 0.5; for (const [dx, dy, r] of rs) { a.beginPath(); a.arc(cx + dx - r * 0.3, cy + dy - r * 0.35, r * 0.3, 0, 7); a.fillStyle = '#fff'; a.fill(); } a.restore();
}
export function bamboo(v = 0) {
  return cutout('bamboo' + v, 1.4, 4.2, (a, w, h) => {
    scaled(a, w, h, 140, 420);
    const st = [[30, 18, 0.02], [68, 0, -0.03], [104, 40, 0.04]];
    st.forEach(([x, top, lean], k) => {
      const col = ['#7cc35a', '#8fd36a', '#6db552'][(k + v) % 3];
      a.save(); a.translate(x, 420); a.rotate(lean);
      rr(a, -9, -(420 - top), 18, 420 - top, 6, col, 3.5);
      for (let y = -60; y > -(420 - top); y -= 62 + k * 6) { line(a, [[-9, y], [9, y]], 3.5); a.save(); a.globalAlpha = 0.4; line(a, [[-4, y - 6], [-4, y - 50]], 3, '#e8ffd2'); a.restore(); }
      a.restore();
    });
    const lf = (x, y, r, s) => { a.save(); a.translate(x, y); a.rotate(r); a.scale(s, s); a.beginPath(); a.moveTo(0, 0); a.quadraticCurveTo(22, -12, 46, 0); a.quadraticCurveTo(22, 10, 0, 0); P(a, '#4fa848', 3); a.restore(); };
    [[30, 80, -0.5, 1], [30, 84, -2.6, 0.9], [70, 40, -0.3, 1.1], [70, 46, -2.9, 1], [104, 120, -0.6, 0.9], [104, 126, -2.5, 1], [70, 180, 0.2, 0.8], [30, 220, -2.8, 0.8], [104, 260, -0.2, 0.8], [68, 300, -2.7, 0.7]].forEach((l) => lf(...l));
  });
}
export function hut(v = 'day') {
  return cutout('hut' + v, 3.0, 3.0, (a, w, h) => {
    scaled(a, w, h, 300, 300);
    rr(a, 40, 140, 220, 150, 16, '#f6dfb0', 4);
    a.save(); a.globalAlpha = 0.35; for (let y = 160; y < 290; y += 22) line(a, [[44, y], [256, y]], 2.5, '#c99a64'); a.restore();
    a.beginPath(); a.moveTo(150, 4); a.quadraticCurveTo(250, 80, 290, 160); a.quadraticCurveTo(150, 178, 10, 160); a.quadraticCurveTo(50, 80, 150, 4); P(a, '#d9a24e', 4);
    a.save(); a.globalAlpha = 0.45; for (let i = -4; i <= 4; i++) line(a, [[150, 12], [150 + i * 34, 165]], 3, '#a8742e'); a.restore();
    a.beginPath(); a.moveTo(150, 4); a.quadraticCurveTo(250, 80, 290, 160); a.quadraticCurveTo(150, 178, 10, 160); a.quadraticCurveTo(50, 80, 150, 4); P(a, null, 4);
    // round door
    a.beginPath(); a.moveTo(120, 290); a.lineTo(120, 220); a.arc(150, 220, 30, Math.PI, 0); a.lineTo(180, 290); P(a, '#8a5a34', 4); circ(a, 170, 254, 4, '#ffd34d', 2.5);
    // windows
    const win = (x) => { circ(a, x, 210, 22, v === 'night' || v === 'dusk' ? '#ffe28a' : '#bfe6ff', 4); line(a, [[x - 22, 210], [x + 22, 210]], 3); line(a, [[x, 188], [x, 232]], 3); rr(a, x - 28, 234, 56, 14, 4, '#c07a42', 3); for (let k = 0; k < 4; k++) circ(a, x - 20 + k * 13, 232, 6, ['#ff6f8a', '#ffd34d', '#ff9a3d', '#ff6f8a'][k], 2.5); };
    win(78); win(222);
    if (v === 'home') { rr(a, 90, 120, 120, 34, 10, '#ff6f8a', 3.5); }
    // chimney
    rr(a, 210, 40, 26, 50, 4, '#c9b49a', 3.5);
  });
}
export function tree(v = 0) {
  const pal = [['#77c95e', '#3f8d3c'], ['#9ad15a', '#5e9a34'], ['#f2a64a', '#c9622a']][v % 3];
  return cutout('tree' + v, 2.2, 2.8, (a, w, h) => {
    scaled(a, w, h, 220, 280);
    a.beginPath(); a.moveTo(92, 280); a.quadraticCurveTo(100, 200, 96, 150); a.lineTo(124, 150); a.quadraticCurveTo(120, 200, 130, 280); a.closePath(); P(a, '#9c6a40', 4);
    line(a, [[110, 200], [140, 170]], 8, '#9c6a40'); line(a, [[110, 200], [140, 170]], 0);
    leafy(a, 110, 100, [[-60, 20, 44], [60, 18, 46], [0, -30, 62], [-34, -60, 40], [36, -58, 42], [0, 34, 50]], pal[0], pal[1]);
    if (v === 0) for (const [x, y] of [[70, 80], [150, 60], [120, 120], [60, 130], [170, 120]]) { circ(a, x, y, 9, '#ff5d5d', 3); shine(a, x - 3, y - 3, 2.5); }
  });
}
export function pine(snow = false) {
  return cutout('pine' + snow, 1.5, 2.8, (a, w, h) => {
    scaled(a, w, h, 150, 280);
    rr(a, 64, 230, 22, 50, 4, '#8a5a34', 3.5);
    for (const [y, hw] of [[240, 70], [175, 56], [110, 42]]) {
      poly(a, [[75, y - 110], [75 + hw, y], [75 - hw, y]], '#3f8f5e', 4);
      if (snow) { a.beginPath(); a.moveTo(75, y - 110); a.lineTo(75 + hw * 0.45, y - 60); a.quadraticCurveTo(75, y - 48, 75 - hw * 0.45, y - 60); a.closePath(); P(a, '#fbfdff', 3); }
    }
  });
}
export function bush(v = 0) {
  return cutout('bush' + v, 1.5, 0.95, (a, w, h) => {
    scaled(a, w, h, 150, 95);
    leafy(a, 75, 58, [[-42, 12, 30], [42, 12, 30], [-16, -10, 36], [22, -8, 34], [0, 16, 34]], v === 1 ? '#5fb86a' : '#6cc35a', '#2f7d3c');
    if (v === 2) for (const [x, y] of [[40, 50], [70, 34], [100, 54], [118, 40], [56, 70]]) { circ(a, x, y, 7, '#5a6bff', 2.5); shine(a, x - 2, y - 2, 2); }
    if (v === 0) for (const [x, y] of [[44, 46], [86, 30], [110, 60]]) for (let k = 0; k < 5; k++) { const t = (k / 5) * 6.28; circ(a, x + Math.cos(t) * 5, y + Math.sin(t) * 5, 4, '#fff', 1.5); }
  });
}
export function rock(v = 0) {
  return cutout('rock' + v, 1.2, 0.7, (a, w, h) => {
    scaled(a, w, h, 120, 70);
    a.beginPath(); a.moveTo(6, 66); a.quadraticCurveTo(10, 20, 44, 12); a.quadraticCurveTo(70, 2, 96, 20); a.quadraticCurveTo(118, 40, 114, 66); a.closePath(); P(a, v ? '#dfe8f2' : '#b8b0a6', 4);
    a.save(); a.globalAlpha = 0.5; line(a, [[30, 30], [50, 20]], 5, '#fff'); a.restore();
    if (!v) { a.save(); a.globalAlpha = 0.6; circ(a, 80, 46, 8, '#7fb36a', 0); circ(a, 92, 50, 6, '#7fb36a', 0); a.restore(); }
  });
}
export function tulip(col, open, inside) {
  return cutout(`tulip${col}${open}${inside || ''}`, 0.9, 2.0, (a, w, h) => {
    scaled(a, w, h, 90, 200);
    line(a, [[45, 200], [45, 70]], 8, OL); line(a, [[45, 200], [45, 70]], 4.5, '#5fb85a');
    a.beginPath(); a.moveTo(45, 180); a.quadraticCurveTo(10, 150, 12, 110); a.quadraticCurveTo(34, 140, 45, 170); P(a, '#5fb85a', 3);
    a.beginPath(); a.moveTo(45, 160); a.quadraticCurveTo(84, 140, 80, 104); a.quadraticCurveTo(58, 130, 45, 150); P(a, '#5fb85a', 3);
    if (!open) {
      a.beginPath(); a.moveTo(45, 84); a.quadraticCurveTo(10, 78, 14, 36); a.lineTo(28, 46); a.lineTo(45, 20); a.lineTo(62, 46); a.lineTo(76, 36); a.quadraticCurveTo(80, 78, 45, 84); P(a, col, 4);
      a.save(); a.globalAlpha = 0.4; line(a, [[30, 70], [30, 50]], 5, '#fff'); a.restore();
    } else {
      a.beginPath(); a.moveTo(45, 84); a.quadraticCurveTo(-2, 72, 2, 22); a.quadraticCurveTo(26, 40, 45, 58); a.quadraticCurveTo(64, 40, 88, 22); a.quadraticCurveTo(92, 72, 45, 84); P(a, col, 4);
      ell(a, 45, 50, 24, 10, 0, '#fff3b0', 3);
      if (inside === 'bee') { ell(a, 45, 38, 12, 9, 0, '#ffd34d', 3); line(a, [[41, 30], [41, 46]], 3); line(a, [[49, 30], [49, 46]], 3); ell(a, 40, 26, 7, 5, -0.4, '#e8f6ff', 2.5); ell(a, 52, 26, 7, 5, 0.4, '#e8f6ff', 2.5); }
      if (inside === 'bfly') { ell(a, 36, 34, 10, 8, -0.5, '#b07cff', 3); ell(a, 54, 34, 10, 8, 0.5, '#b07cff', 3); line(a, [[45, 26], [45, 46]], 4); }
    }
  });
}
export function lily() { return cutout('lily', 1.2, 0.5, (a, w, h) => { scaled(a, w, h, 120, 50); a.beginPath(); a.ellipse(60, 26, 56, 20, 0, 0.3, Math.PI * 2 - 0.3); a.lineTo(60, 26); a.closePath(); P(a, '#5cbf72', 3.5); circ(a, 30, 22, 7, '#ffb7d0', 2.5); }); }
export function mushroom(glow = false, big = false) {
  const s = big ? 1.5 : 1;
  return cutout(`mush${glow}${big}`, 1.3 * s, 1.3 * s, (a, w, h) => {
    scaled(a, w, h, 130, 130);
    a.beginPath(); a.moveTo(48, 128); a.quadraticCurveTo(44, 80, 52, 64); a.lineTo(80, 64); a.quadraticCurveTo(88, 80, 84, 128); a.closePath(); P(a, '#fbf1dc', 4);
    a.beginPath(); a.moveTo(4, 70); a.quadraticCurveTo(10, 4, 66, 4); a.quadraticCurveTo(124, 4, 126, 70); a.quadraticCurveTo(66, 82, 4, 70); P(a, glow ? '#7fd8ff' : '#ef5a4c', 4);
    for (const [x, y, r] of [[36, 34, 10], [70, 22, 12], [100, 44, 9], [60, 54, 7]]) circ(a, x, y, r, glow ? '#e9fbff' : '#fff7ee', 2.5);
    if (glow) { a.save(); a.globalAlpha = 0.5; wash(a, 66, 40, 60, '#fff', 0.6); a.restore(); }
  });
}
export function log(lit = false, peek = false) {
  return cutout(`log${lit}${peek}`, 2.4, 1.2, (a, w, h) => {
    scaled(a, w, h, 240, 120);
    rr(a, 30, 22, 200, 92, 40, '#a8743f', 4);
    a.save(); a.globalAlpha = 0.4; for (const y of [44, 66, 90]) line(a, [[60, y], [210, y + 2]], 3, '#6e4422'); a.restore();
    ell(a, 40, 68, 34, 46, 0, '#c99a64', 4);
    ell(a, 40, 70, 24, 34, 0, lit ? '#ffd76a' : '#2b1d16', 3);
    if (lit) { a.save(); wash(a, 40, 70, 40, '#fff8c0', 0.8); a.restore(); }
    if (peek) { circ(a, 30, 56, 6, '#2c2a2e', 0); circ(a, 50, 56, 6, '#2c2a2e', 0); circ(a, 40, 72, 15, '#fbfaf5', 2.5); ell(a, 35, 72, 4, 5, -0.5, '#2c2a2e', 0); ell(a, 45, 72, 4, 5, 0.5, '#2c2a2e', 0); }
    a.save(); a.translate(150, 22); for (let k = 0; k < 3; k++) { a.beginPath(); a.moveTo(k * 18, 0); a.quadraticCurveTo(k * 18 + 6, -16, k * 18 + 16, -2); P(a, '#6cc35a', 2.5); } a.restore();
  });
}
export function moon() {
  return cutout('moon', 1.6, 3.4, (a, w, h) => {
    scaled(a, w, h, 160, 340);
    line(a, [[80, 340], [80, 130]], 4, '#6b6f86');
    a.save(); circ(a, 80, 72, 62, '#fff3a8', 4); a.globalCompositeOperation = 'destination-out'; circ(a, 116, 50, 50, '#000', 0); a.restore();
    a.save(); a.beginPath(); a.arc(80, 72, 62, 0, 7); a.clip(); arcL(a, 116, 50, 50, 0, 7, 4); a.restore();
    eye(a, 40, 84, 4, 5); cheek(a, 48, 104, 7); arcL(a, 52, 100, 6, 0.6, 2.4, 2.6);
    for (const [x, y] of [[30, 180], [130, 160], [120, 230]]) { poly(a, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => { const r = k % 2 ? 7 : 16, t = (k / 10) * 6.28 - 1.57; return [x + Math.cos(t) * r, y + Math.sin(t) * r]; }), '#fff3a8', 3); line(a, [[x, y + 16], [80, 250]], 1.5, '#6b6f86'); }
  });
}
export function sun() {
  return cutout('sun', 1.6, 3.2, (a, w, h) => {
    scaled(a, w, h, 160, 320);
    line(a, [[80, 320], [80, 140]], 4, '#8a7a6a');
    for (let k = 0; k < 12; k++) { const t = (k / 12) * 6.28; poly(a, [[80 + Math.cos(t - 0.14) * 52, 72 + Math.sin(t - 0.14) * 52], [80 + Math.cos(t) * 76, 72 + Math.sin(t) * 76], [80 + Math.cos(t + 0.14) * 52, 72 + Math.sin(t + 0.14) * 52]], '#ffb43a', 3); }
    circ(a, 80, 72, 54, '#ffd34d', 4); eye(a, 62, 66, 5, 7); eye(a, 98, 66, 5, 7); cheek(a, 54, 86, 8); cheek(a, 106, 86, 8); arcL(a, 80, 82, 14, 0.3, 2.84, 3.5);
  });
}
export function cloud(v = 0) {
  return cutout('cloud' + v, 2.0, 1.9, (a, w, h) => {
    scaled(a, w, h, 200, 190);
    line(a, [[100, 190], [100, 80]], 3.5, '#8a8f9e');
    for (const [x, y, r] of [[50, 60, 32], [100, 44, 42], [150, 60, 32], [76, 78, 28], [126, 78, 28]]) circ(a, x, y, r, v ? '#ffd9e4' : '#ffffff', 4);
    a.fillStyle = v ? '#ffd9e4' : '#fff'; for (const [x, y, r] of [[50, 60, 30], [100, 44, 40], [150, 60, 30], [76, 78, 26], [126, 78, 26]]) { a.beginPath(); a.arc(x, y, r, 0, 7); a.fill(); }
  });
}
export function mountain() {
  return cutout('mountain', 8.0, 3.4, (a, w, h) => {
    scaled(a, w, h, 800, 340);
    const peak = (x, y, hw, col) => { poly(a, [[x, y], [x + hw, 340], [x - hw, 340]], col, 4); a.beginPath(); a.moveTo(x, y); a.lineTo(x + hw * 0.32, y + 110); a.lineTo(x + hw * 0.12, y + 90); a.lineTo(x - hw * 0.05, y + 118); a.lineTo(x - hw * 0.2, y + 92); a.lineTo(x - hw * 0.32, y + 110); a.closePath(); P(a, '#ffffff', 3.5); };
    peak(170, 70, 190, '#9fb6dc'); peak(620, 50, 200, '#9fb6dc'); peak(400, 6, 260, '#8aa6d6');
  });
}
export function snowman(state = 'whole', hat = '#e8473c') {
  return cutout('snowman' + state + hat, 1.2, 1.75, (a, w, h) => {
    scaled(a, w, h, 120, 175);
    if (state === 'pile') { a.beginPath(); a.moveTo(4, 172); a.quadraticCurveTo(20, 120, 60, 128); a.quadraticCurveTo(108, 120, 116, 172); a.closePath(); P(a, '#fbfdff', 4); return; }
    circ(a, 60, 128, 44, '#fbfdff', 4); circ(a, 60, 62, 32, '#fbfdff', 4);
    a.save(); a.globalAlpha = 0.35; circ(a, 72, 140, 26, '#bcd4ff', 0); circ(a, 70, 72, 18, '#bcd4ff', 0); a.restore();
    for (const y of [110, 130, 150]) circ(a, 60, y, 4.5, '#3a3a46', 0);
    eye(a, 50, 56, 4, 5); eye(a, 70, 56, 4, 5); poly(a, [[58, 66], [62, 66], [84, 72]], '#ff9a3d', 2.5); cheek(a, 44, 70, 5); cheek(a, 76, 70, 5);
    rr(a, 30, 84, 60, 12, 6, hat, 3); rr(a, 70, 88, 12, 26, 5, hat, 3);
    rr(a, 34, 22, 52, 8, 3, '#3a3a46', 3); rr(a, 42, 0, 36, 24, 4, '#3a3a46', 3); rr(a, 42, 14, 36, 6, 0, hat, 0);
    line(a, [[24, 116], [2, 96]], 4, '#8a5a34'); line(a, [[96, 116], [118, 96]], 4, '#8a5a34');
  });
}
export function igloo() {
  return cutout('igloo', 2.4, 1.4, (a, w, h) => {
    scaled(a, w, h, 240, 140);
    a.beginPath(); a.moveTo(8, 138); a.quadraticCurveTo(10, 10, 120, 8); a.quadraticCurveTo(230, 10, 232, 138); a.closePath(); P(a, '#f2f8ff', 4);
    a.save(); a.globalAlpha = 0.4; for (const y of [40, 72, 104]) line(a, [[20, y], [220, y]], 3, '#9fb6dc'); a.restore();
    a.beginPath(); a.moveTo(140, 138); a.lineTo(140, 96); a.arc(170, 96, 30, Math.PI, 0); a.lineTo(200, 138); P(a, '#3d4a66', 4);
  });
}
export function stall(kind) {
  return cutout('stall' + kind, 3.0, 2.8, (a, w, h) => {
    scaled(a, w, h, 300, 280);
    rr(a, 20, 52, 14, 228, 4, '#a8743f', 3.5); rr(a, 266, 52, 14, 228, 4, '#a8743f', 3.5);
    rr(a, 10, 180, 280, 100, 10, kind === 'bun' ? '#c98a4e' : '#d8a060', 4);
    a.save(); a.globalAlpha = 0.35; for (let x = 40; x < 290; x += 36) line(a, [[x, 186], [x, 274]], 3, '#7a4a22'); a.restore();
    const col = kind === 'bun' ? ['#e8473c', '#fff6e8'] : ['#4caf6a', '#fff6e8'];
    a.beginPath(); a.moveTo(0, 60); a.lineTo(20, 10); a.lineTo(280, 10); a.lineTo(300, 60); a.closePath(); P(a, col[1], 4);
    a.save(); a.beginPath(); a.moveTo(0, 60); a.lineTo(20, 10); a.lineTo(280, 10); a.lineTo(300, 60); a.closePath(); a.clip(); a.fillStyle = col[0]; for (let x = 0; x < 300; x += 50) { a.beginPath(); a.moveTo(x, 70); a.lineTo(x + 12 + 13, 0); a.lineTo(x + 37 + 13, 0); a.lineTo(x + 25, 70); a.fill(); } a.restore();
    a.beginPath(); a.moveTo(0, 60); a.lineTo(20, 10); a.lineTo(280, 10); a.lineTo(300, 60); a.closePath(); P(a, null, 4);
    for (let x = 0; x < 300; x += 25) { a.beginPath(); a.arc(x + 12.5, 60, 12.5, 0, Math.PI); P(a, (x / 25) % 2 ? col[1] : col[0], 3); }
    rr(a, 100, 92, 100, 40, 8, '#fff6e8', 3.5);
    a.fillStyle = OL; a.font = 'bold 30px sans-serif'; a.textAlign = 'center'; a.textBaseline = 'middle'; a.fillText(kind === 'bun' ? '包子' : '水果', 150, 113);
    if (kind === 'fruit') for (let i = 0; i < 9; i++) { const x = 40 + (i % 5) * 52 + (i > 4 ? 26 : 0), y = 172 - (i > 4 ? 20 : 0); circ(a, x, y, 17, ['#ff5d5d', '#ffb43a', '#a8d84e', '#ff5d5d', '#ffd34d'][i % 5], 3); shine(a, x - 5, y - 5, 4); }
  });
}
export function steamer(part = 'base') {
  if (part === 'lid') return cutout('steamlid', 1.0, 0.38, (a, w, h) => { scaled(a, w, h, 100, 38); a.beginPath(); a.moveTo(4, 36); a.quadraticCurveTo(50, -6, 96, 36); a.closePath(); P(a, '#e6c27a', 3.5); a.save(); a.globalAlpha = 0.4; for (let x = 18; x < 90; x += 12) line(a, [[x, 34], [50, 4]], 2, '#a8742e'); a.restore(); circ(a, 50, 8, 6, '#c98a4e', 3); });
  return cutout('steam' + part, 1.0, 0.62, (a, w, h) => {
    scaled(a, w, h, 100, 62);
    rr(a, 4, 6, 92, 54, 10, '#e6c27a', 3.5);
    a.save(); a.globalAlpha = 0.45; for (const y of [20, 34, 48]) line(a, [[8, y], [92, y]], 2.5, '#a8742e'); a.restore();
    if (part === 'buns') for (const x of [26, 50, 74]) { a.beginPath(); a.arc(x, 10, 13, Math.PI, 0); a.closePath(); P(a, '#fffaf0', 3); line(a, [[x - 4, 0], [x, 4], [x + 4, 0]], 2); }
  });
}
export function townhouse(v = 0) {
  return cutout('town' + v, 2.6, 2.7, (a, w, h) => {
    scaled(a, w, h, 260, 270);
    rr(a, 30, 110, 200, 160, 8, ['#f6e2c4', '#fbd9c6', '#e8eed2'][v % 3], 4);
    a.beginPath(); a.moveTo(0, 118); a.quadraticCurveTo(40, 100, 50, 60); a.lineTo(210, 60); a.quadraticCurveTo(220, 100, 260, 118); a.closePath(); P(a, ['#4f7fc4', '#c4544a', '#5e9a64'][v % 3], 4);
    a.save(); a.globalAlpha = 0.35; for (let x = 60; x < 210; x += 20) line(a, [[x, 64], [x - 6, 112]], 3, '#fff'); a.restore();
    rr(a, 100, 190, 60, 80, 6, '#a8743f', 3.5); circ(a, 148, 232, 4, '#ffd34d', 2);
    for (const x of [50, 172]) { rr(a, x, 140, 40, 40, 4, '#ffe9a8', 3.5); line(a, [[x + 20, 140], [x + 20, 180]], 3); }
    for (const x of [40, 220]) { line(a, [[x, 118], [x, 136]], 2); circ(a, x, 146, 12, '#e8473c', 3); rr(a, x - 5, 132, 10, 4, 1, '#ffd34d', 0); }
  });
}
export function lanterns() {
  return cutout('lanterns', 7.0, 1.6, (a, w, h) => {
    scaled(a, w, h, 700, 160);
    rr(a, 6, 0, 10, 160, 3, '#a8743f', 3); rr(a, 684, 0, 10, 160, 3, '#a8743f', 3);
    a.beginPath(); a.moveTo(12, 10); a.quadraticCurveTo(350, 70, 688, 10); a.lineWidth = 3; a.strokeStyle = OL; a.stroke();
    for (let i = 1; i < 9; i++) { const x = 12 + (i * 676) / 9, t = x / 700, y = 10 + 60 * 4 * t * (1 - t) * 1.0 + 8; ell(a, x, y + 22, 20, 18, 0, i % 2 ? '#e8473c' : '#ffb43a', 3); rr(a, x - 8, y + 2, 16, 5, 2, '#ffd34d', 2); line(a, [[x, y + 40], [x, y + 52]], 3, '#ffd34d'); }
  });
}
export function fence() { return cutout('fence', 2.2, 0.7, (a, w, h) => { scaled(a, w, h, 220, 70); rr(a, 0, 26, 220, 12, 4, '#e8c38a', 3); rr(a, 0, 48, 220, 12, 4, '#e8c38a', 3); for (let x = 8; x < 220; x += 42) poly(a, [[x, 70], [x, 14], [x + 10, 2], [x + 20, 14], [x + 20, 70]], '#f6dfb0', 3); }); }
export function sign(text) { return cutout('sign' + text, 1.1, 1.3, (a, w, h) => { scaled(a, w, h, 110, 130); rr(a, 48, 40, 14, 90, 4, '#a8743f', 3.5); a.beginPath(); a.moveTo(6, 14); a.lineTo(86, 14); a.lineTo(106, 36); a.lineTo(86, 58); a.lineTo(6, 58); a.closePath(); P(a, '#f6dfb0', 4); a.fillStyle = OL; a.font = 'bold 26px sans-serif'; a.textAlign = 'center'; a.textBaseline = 'middle'; a.fillText(text, 50, 37); }); }
export function rainbow() {
  return cutout('rainbow', 12, 4.6, (a, w, h) => {
    scaled(a, w, h, 1200, 460);
    ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc'].forEach((c, i) => { a.beginPath(); a.arc(600, 470, 450 - i * 36, Math.PI, 0); a.arc(600, 470, 414 - i * 36, 0, Math.PI, true); a.closePath(); P(a, c, 4); });
    for (const x of [140, 1060]) for (const [dx, dy, r] of [[-60, 0, 50], [0, -30, 64], [60, 0, 50], [0, 20, 46]]) circ(a, x + dx, 420 + dy, r, '#fff', 4);
    a.fillStyle = '#fff'; for (const x of [140, 1060]) for (const [dx, dy, r] of [[-60, 0, 47], [0, -30, 61], [60, 0, 47], [0, 20, 43]]) { a.beginPath(); a.arc(x + dx, 420 + dy, r, 0, 7); a.fill(); }
  });
}
export function banner(text) {
  return cutout('banner' + text, 5.2, 1.5, (a, w, h) => {
    scaled(a, w, h, 520, 150);
    rr(a, 8, 0, 10, 150, 3, '#a8743f', 3); rr(a, 502, 0, 10, 150, 3, '#a8743f', 3);
    a.beginPath(); a.moveTo(14, 12); a.quadraticCurveTo(260, 40, 506, 12); a.lineTo(506, 84); a.quadraticCurveTo(260, 112, 14, 84); a.closePath(); P(a, '#ff8fb1', 4);
    a.fillStyle = '#fff'; a.font = 'bold 46px "Arial Rounded MT Bold", sans-serif'; a.textAlign = 'center'; a.textBaseline = 'middle'; a.lineWidth = 7; a.strokeStyle = OL; a.strokeText(text, 260, 58); a.fillText(text, 260, 58);
  });
}
export function star() { return cutout('star', 0.6, 0.6, (a, w, h) => { scaled(a, w, h, 60, 60); poly(a, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => { const r = k % 2 ? 12 : 28, t = (k / 10) * 6.28 - 1.57; return [30 + Math.cos(t) * r, 32 + Math.sin(t) * r]; }), '#ffd34d', 3.5); eye(a, 24, 30, 2.6, 3.4); eye(a, 36, 30, 2.6, 3.4); arcL(a, 30, 35, 4, 0.4, 2.7, 2); }); }
export function leafPile() {
  return cutout('leafpile', 1.9, 1.2, (a, w, h) => {
    scaled(a, w, h, 190, 120);
    const cols = ['#f2a64a', '#e8743a', '#ffd34d', '#c9622a', '#9ad15a'];
    let s = 7; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let k = 0; k < 34; k++) { const x = 20 + r() * 150, y = 16 + r() * 88, t = r() * 6.28; a.save(); a.translate(x, y); a.rotate(t); a.beginPath(); a.moveTo(-18, 0); a.quadraticCurveTo(0, -12, 18, 0); a.quadraticCurveTo(0, 12, -18, 0); P(a, cols[k % 5], 2.5); line(a, [[-14, 0], [14, 0]], 1.5); a.restore(); }
  });
}
export function plank() {
  return cutout('plank', 1.15, 2.5, (a, w, h) => {
    scaled(a, w, h, 115, 250);
    for (let y = 0; y < 250; y += 31) rr(a, 4, y + 2, 107, 27, 6, ['#d9a86a', '#c99a5c'][Math.round(y / 31) % 2], 3);
    line(a, [[18, 0], [18, 250]], 5, '#8a5a34'); line(a, [[97, 0], [97, 250]], 5, '#8a5a34');
  });
}
export function pullTab(word) {
  return cutout('tab' + word, 0.9, 0.7, (a, w, h) => {
    scaled(a, w, h, 90, 70);
    rr(a, 4, 4, 82, 62, 14, '#ffd34d', 4);
    poly(a, [[45, 60], [26, 38], [38, 38], [38, 12], [52, 12], [52, 38], [64, 38]], '#ff7a59', 3);
    a.fillStyle = OL; a.font = 'bold 15px sans-serif'; a.textAlign = 'left'; a.fillText(word, 6, 20);
  });
}
export function wheel() {
  return cutout('wheel', 1.6, 1.6, (a, w, h) => {
    scaled(a, w, h, 160, 160);
    circ(a, 80, 80, 76, '#ffe9a8', 4);
    for (let k = 0; k < 4; k++) { a.save(); a.translate(80, 80); a.rotate((k / 4) * 6.28); a.beginPath(); a.moveTo(0, 0); a.arc(0, 0, 72, -0.78, 0.78); a.closePath(); P(a, ['#ffb3c7', '#bfe6ff', '#c8f0b0', '#ffd9a0'][k], 3); a.restore(); }
    circ(a, 80, 80, 18, '#ff7a59', 4); circ(a, 80, 80, 6, '#fff', 2.5);
    for (let k = 0; k < 4; k++) { const t = (k / 4) * 6.28; circ(a, 80 + Math.cos(t) * 46, 80 + Math.sin(t) * 46, 10, '#fff', 3); }
  });
}

// ---------------------------------------------------------------- glows (sprites)
export function glowTex(col = '255,240,160') {
  const c = mk(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(0.25, `rgba(${col},.7)`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return c;
}
export function heartTex() { const c = mk(96, 96), x = c.getContext('2d'); x.translate(48, 52); x.beginPath(); x.moveTo(0, 26); x.bezierCurveTo(-40, 0, -30, -36, 0, -16); x.bezierCurveTo(30, -36, 40, 0, 0, 26); x.fillStyle = '#ff6f91'; x.fill(); x.lineWidth = 5; x.strokeStyle = '#fff'; x.stroke(); return c; }

// Jasper's Pop-Up Panda Adventure — the engine: the table and the book, Jasper and the babies who follow him,
// the paper pieces folding up out of each spread, talking, turning the page, and the little helpers the
// spreads (spreads.js) use to tell their story.
import * as THREE from '../lib/three.module.min.js';
import { Book, Piece, tex } from './book.js';
import { paintSpread } from './pages.js';
import * as ART from './art.js';
import { audioInit, sfx, music, setMusic, speak, hush, setVoice, voiceAvailable } from './audio.js';
import { SPREADS } from './spreads.js';

// ---------------------------------------------------------------- renderer, scene, light
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#3a2a22');
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
const hemi = new THREE.HemisphereLight('#fff6e8', '#8a6a50', 1.0); scene.add(hemi);
const sunL = new THREE.DirectionalLight('#fff1dc', 1.9); sunL.position.set(-11, 15, 7); sunL.castShadow = true;
const small = Math.min(innerWidth, innerHeight) < 700;
sunL.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048); Object.assign(sunL.shadow.camera, { left: -15, right: 15, top: 12, bottom: -12, near: 1, far: 50 }); sunL.shadow.bias = -0.0006; sunL.shadow.normalBias = 0.02;
scene.add(sunL, sunL.target);
const lamps = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight('#ffd98a', 0, 6, 1.6); scene.add(l); return l; });
const book = new Book(scene);

// ---------------------------------------------------------------- the save and the settings
const KEY = 'jasperPopup.v1';
let save = { si: 0, babies: [], stars: [], lang: 'zh', voice: true, music: true, done: false };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) save = Object.assign(save, s); } catch (e) { /* no storage */ }
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* no storage */ } };
setVoice(save.voice); setMusic(save.music);
const T = (o) => (o == null ? '' : typeof o === 'string' ? o : o[save.lang] ?? o.zh);
const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- tweens
const tweens = [];
const ease = { lin: (t) => t, out: (t) => 1 - (1 - t) ** 3, inout: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2), back: (t) => { const c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; }, in: (t) => t * t * t };
function anim(dur, fn, e = 'out', delay = 0) { return new Promise((res) => tweens.push({ t: -delay, dur, fn, e: ease[e] || e, res })); }
const wait = (s) => anim(s, () => {}, 'lin');
function runTweens(dt) { for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; if (w.t < 0) continue; const p = Math.min(1, w.t / w.dur); w.fn(w.e(p), p); if (p >= 1) { tweens.splice(i, 1); w.res(); } } }

// ---------------------------------------------------------------- particles (little sprites)
const parts = [];
const spriteTex = {};
function sTex(name) {
  if (spriteTex[name]) return spriteTex[name];
  let c;
  if (name === 'heart') c = ART.heartTex();
  else if (name === 'glow') c = ART.glowTex();
  else if (name === 'snow') c = ART.glowTex('255,255,255');
  else if (name === 'blue') c = ART.glowTex('150,230,255');
  else if (name.startsWith('conf')) { c = ART.mk(32, 32); const x = c.getContext('2d'); x.fillStyle = ['#ff6b8a', '#ffd34d', '#5cbf5a', '#4a90e2', '#b98cff', '#ff9a3d'][+name.slice(4)]; x.fillRect(4, 8, 24, 16); }
  else if (name === 'arrow') { c = ART.mk(96, 128); const x = c.getContext('2d'); x.beginPath(); x.moveTo(48, 120); x.lineTo(10, 66); x.lineTo(32, 66); x.lineTo(32, 8); x.lineTo(64, 8); x.lineTo(64, 66); x.lineTo(86, 66); x.closePath(); x.fillStyle = '#ffd34d'; x.fill(); x.lineWidth = 7; x.strokeStyle = ART.OL; x.stroke(); }
  else if (name === 'turn') { c = ART.mk(160, 160); const x = c.getContext('2d'); x.beginPath(); x.arc(80, 80, 70, 0, 7); x.fillStyle = 'rgba(255,240,180,.95)'; x.fill(); x.lineWidth = 7; x.strokeStyle = ART.OL; x.stroke(); x.beginPath(); x.moveTo(52, 50); x.lineTo(112, 80); x.lineTo(52, 110); x.closePath(); x.fillStyle = '#ff7a59'; x.fill(); x.stroke(); }
  return (spriteTex[name] = tex(c));
}
function sprite(name, size, add = false) { const m = new THREE.SpriteMaterial({ map: sTex(name), transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }); const s = new THREE.Sprite(m); s.scale.set(size, size, 1); scene.add(s); return s; }
function burst(x, y, z, kind = 'conf', n = 24) {
  for (let i = 0; i < n; i++) {
    const nm = kind === 'conf' ? 'conf' + (i % 6) : kind, sz = kind === 'heart' ? 0.35 + Math.random() * 0.2 : kind === 'conf' ? 0.16 : 0.3 + Math.random() * 0.3;
    const s = sprite(nm, sz, kind === 'glow' || kind === 'snow' || kind === 'blue'), a = Math.random() * Math.PI * 2, sp = kind === 'heart' ? 0.8 : 2 + Math.random() * 2.5;
    s.position.set(x, y, z);
    parts.push({ s, vx: Math.cos(a) * sp * 0.6, vy: (kind === 'heart' ? 1.4 : 3) + Math.random() * 2.5, vz: Math.sin(a) * sp * 0.4, life: kind === 'heart' ? 1.6 : 1.2 + Math.random() * 0.6, g: kind === 'heart' ? -0.6 : kind === 'snow' ? 3 : 7, spin: Math.random() * 10, t: 0 });
  }
}
function runParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.t += dt; p.vy -= p.g * dt; p.s.position.x += p.vx * dt; p.s.position.y = Math.max(0.05, p.s.position.y + p.vy * dt); p.s.position.z += p.vz * dt; p.s.material.rotation += p.spin * dt;
    p.s.material.opacity = Math.min(1, (p.life - p.t) * 2.5);
    if (p.t >= p.life) { p.s.removeFromParent(); p.s.material.dispose(); parts.splice(i, 1); }
  }
}

// ---------------------------------------------------------------- Jasper and the babies
const J = { x: 0, z: 0, vx: 0, vz: 0, face: 1, step: 0, walkT: 0, moving: false, piece: new Piece(ART.jasper(0), { x: 0, z: 0 }), cheer: false, lantern: false };
scene.add(J.piece.hinge); J.piece.hinge.visible = false;
const followers = []; // {i, piece, x, z, face}
const trail = [];
function addFollower(i, x, z) {
  const piece = new Piece(ART.baby(i), { x, z }); piece.rise = 1; piece.apply(); scene.add(piece.hinge);
  const f = { i, piece, x, z, face: 1, hopT: 0 }; followers.push(f); g.who('b' + i, piece, ART.BABIES[i].name, 1.7); return f;
}
function placeParty(x, z) {
  J.x = x; J.z = z; J.vx = J.vz = 0; trail.length = 0;
  for (let k = 0; k < 60; k++) trail.push([x - (k * 0.06), z]);
  followers.forEach((f, k) => { const p = trail[Math.min(trail.length - 1, (k + 1) * 9)]; f.x = p[0]; f.z = p[1]; });
}

// ---------------------------------------------------------------- the current spread
let SI = 0, S = null; // S = the running spread: its pieces, items and state
const items = [], solids = [], walks = [];
let pieces = [];
function piece(cut, kind, x, z, o = {}) {
  const p = new Piece(cut, { kind, x, z, y: o.y ?? (kind === 'stand' ? 0 : 0.004 + (o.layer || 0) * 0.003), face: o.face || 0, scale: o.scale || 1, flip: o.flip });
  p.fixed = !!o.fixed; if (p.fixed) { p.apply = function () { this.hinge.rotation.set(-(1 - this.rise) * Math.PI / 2, this.face, 0); }; }
  p.delay = o.delay ?? 0; p.goal = o.hidden ? 0 : kind === 'stand' ? (o.rise ?? 1) : null; p.rise = kind === 'stand' ? 0 : 1; p.apply();
  scene.add(p.hinge); pieces.push(p);
  if (o.solid) solids.push({ c: true, x: o.sx ?? x, z: o.sz ?? z, r: o.solid, p });
  return p;
}
function clearSpread() {
  for (const p of pieces) p.dispose(); pieces = []; items.length = 0; solids.length = 0; walks.length = 0;
  for (const l of lamps) l.intensity = 0; for (const sp of glows) sp.removeFromParent(); glows.length = 0;
  hint.obj.visible = false; exitMark.visible = false; exitGlow.visible = false;
}
const glows = [];
function glow(x, y, z, size, kind = 'glow') { const s = sprite(kind, size, true); s.position.set(x, y, z); glows.push(s); return s; }

// rise all the pieces of the spread (staggered, with a springy pop)
async function riseAll(dur = 0.75) {
  const list = pieces.filter((p) => p.kind === 'stand' && p.goal > 0);
  const chars = [J.piece, ...followers.map((f) => f.piece)];
  let n = 0;
  const go = list.map((p) => { const d = p.delay + (n++ % 12) * 0.05; const r0 = p.rise; if (n < 9) setTimeout(() => sfx('rise'), d * 1000); return anim(dur, (t) => { p.rise = r0 + (p.goal - r0) * t; p.apply(); }, 'back', d); });
  go.push(...chars.map((p, k) => anim(0.6, (t) => { p.rise = t; p.apply(); }, 'back', 0.35 + k * 0.08)));
  await Promise.all(go);
}
async function foldAll(dur = 0.5) {
  const chars = [J.piece, ...followers.map((f) => f.piece)];
  sfx('fold');
  await Promise.all([...pieces, ...chars].map((p) => { if (p.kind === 'stand') { const r0 = p.rise; return anim(dur, (t) => { p.rise = r0 * (1 - t); p.apply(); }, 'inout'); } if (p.kind === 'flap') { const l0 = p.lift; return anim(dur, (t) => { p.lift = l0 * (1 - t); p.apply(); }, 'inout'); } return null; }).filter(Boolean));
}

// ---------------------------------------------------------------- moving about
const BOUNDS = [-9.6, -3.05, 9.6, 3.2];
function blocked(x, z) {
  if (x < BOUNDS[0] || x > BOUNDS[2] || z < BOUNDS[1] || z > BOUNDS[3]) return true;
  for (const w of walks) if ((!w.on || w.on()) && x > w.x0 && x < w.x1 && z > w.z0 && z < w.z1) return false;
  for (const s of solids) { if (s.on && !s.on()) continue; if (s.c) { if (Math.hypot(x - s.x, (z - s.z) * 1.25) < s.r + 0.22) return true; } else if (x > s.x0 - 0.2 && x < s.x1 + 0.2 && z > s.z0 - 0.15 && z < s.z1 + 0.15) return true; }
  return false;
}
let goTo = null; // a point (and maybe an item) the player tapped
function moveJasper(dt, ax, az) {
  const onIce = S?.def.ice?.(J.x, J.z);
  let len = Math.hypot(ax, az);
  if (goTo && len < 0.1) {
    const dx = goTo.x - J.x, dz = goTo.z - J.z, d = Math.hypot(dx, dz);
    const reach = goTo.item ? goTo.item.r * 0.8 : 0.12;
    if (d < reach) { const it = goTo.item; goTo = null; if (it && itemOn(it)) useItem(it); }
    else { ax = dx / d; az = dz / d; len = 1; goTo.t += dt; if (goTo.t > 6 || (goTo.stuck += (J.moving ? 0 : dt)) > 0.6) goTo = null; }
  } else if (len > 0.1) goTo = null;
  if (len > 1) { ax /= len; az /= len; }
  const sp = 3.3, k = onIce ? 1.4 : 14;
  J.vx += (ax * sp - J.vx) * Math.min(1, k * dt); J.vz += (az * sp - J.vz) * Math.min(1, k * dt);
  const nx = J.x + J.vx * dt, nz = J.z + J.vz * dt; const x0 = J.x, z0 = J.z;
  if (!blocked(nx, J.z)) J.x = nx; else J.vx *= onIce ? -0.4 : 0;
  if (!blocked(J.x, nz)) J.z = nz; else J.vz *= onIce ? -0.4 : 0;
  const moved = Math.hypot(J.x - x0, J.z - z0);
  J.moving = moved > 0.002 && len > 0.1 || (onIce && moved > 0.004);
  if (Math.abs(J.vx) > 0.25 && len > 0.1) J.face = J.vx > 0 ? 1 : -1;
  if (J.moving) { J.walkT += dt; const st = Math.floor(J.walkT / 0.14) % 2; if (st !== J.step) { J.step = st; if (!onIce) sfx('step'); } }
  if (onIce && !J.wasIce && moved > 0.004) sfx('slide'); J.wasIce = onIce;
  if (moved > 0.0005) { const l = trail[0]; if (!l || Math.hypot(l[0] - J.x, l[1] - J.z) > 0.06) { trail.unshift([J.x, J.z]); if (trail.length > 120) trail.pop(); } }
}
function drawParty(dt, time) {
  const P = J.piece; P.hinge.position.set(J.x, 0.01, J.z);
  const want = J.cheer ? ART.jasper(3) : J.moving ? ART.jasper(1 + J.step) : ART.jasper(0);
  if (P.cut !== want) P.setCut(want); P.flip(J.face < 0);
  P.wob.position.y = J.moving ? Math.abs(Math.sin(J.walkT * 22)) * 0.06 : 0; P.wob.rotation.z = J.moving ? Math.sin(J.walkT * 11) * 0.05 : Math.sin(time * 2) * 0.012;
  followers.forEach((f, k) => {
    const tp = trail[Math.min(trail.length - 1, (k + 1) * 9)]; if (!tp || f.free) return;
    const dx = tp[0] - f.x, dz = tp[1] - f.z, d = Math.hypot(dx, dz);
    if (d > 0.02) { const s = Math.min(1, dt * 9); f.x += dx * s; f.z += dz * s; if (Math.abs(dx) > 0.01) f.face = dx > 0 ? 1 : -1; f.hopT += dt; } else f.hopT = 0;
    f.piece.hinge.position.set(f.x, 0.012, f.z); f.piece.flip(f.face < 0);
    f.piece.wob.position.y = f.hopT ? Math.abs(Math.sin(f.hopT * 14 + k)) * 0.12 : 0;
  });
  if (J.lantern) { lamps[0].position.set(J.x + J.face * 0.4, 1.3, J.z + 0.3); lamps[0].intensity = 7; lantern.visible = true; lantern.position.set(J.x + J.face * 0.42, 0.95, J.z + 0.05); lantern.material.opacity = 0.75 + Math.sin(time * 6) * 0.1; }
  else lantern.visible = false;
}
const lantern = sprite('glow', 0.9, true); lantern.visible = false;

// ---------------------------------------------------------------- the camera
const cam = { x: 0, z: 0.4, w: 15, tx: 0, tz: 0.4, tw: 15, el: 0.64, overview: false };
function fitWidth() { const a = innerWidth / innerHeight; return a > 1.5 ? 15.5 : a > 1.1 ? 13 : a > 0.8 ? 10 : a > 0.6 ? 7.5 : 6.2; }
function camUpdate(dt, snap) {
  const k = snap ? 1 : Math.min(1, dt * 3);
  cam.x += (cam.tx - cam.x) * k; cam.z += (cam.tz - cam.z) * k; cam.w += (cam.tw - cam.w) * k;
  const a = innerWidth / innerHeight, vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * a);
  let d = (cam.w / 2) / Math.tan(hf / 2); if (a > 0.9) d = Math.max(d, 9.5 / 2 / Math.tan(vf / 2));
  camera.position.set(cam.x, Math.sin(cam.el) * d, cam.z + Math.cos(cam.el) * d); camera.lookAt(cam.x, 1.05, cam.z - 0.35);
}
function camFollow() {
  if (cam.overview) { cam.tw = 22; cam.tx = 0; cam.tz = 0.2; return; }
  const w = fitWidth(); cam.tw = w; const half = Math.max(0, 10.3 - w / 2);
  cam.tx = Math.max(-half, Math.min(half, J.x)); cam.tz = 0.35;
}

// ---------------------------------------------------------------- talking
const speakers = {};
const bubble = $('bubble'), story = $('story');
let sayState = null;
function who(key, p, name, pitch = 1.1) { speakers[key] = { p, name, pitch }; }
who('jasper', J.piece, { zh: 'Jasper', en: 'Jasper' }, 1.35);
function say(key, text, o = {}) {
  return new Promise((res) => {
    const sp = speakers[key], str = T(text), el = key === 'n' ? story : bubble;
    bubble.hidden = story.hidden = true;
    el.querySelector('.name').textContent = sp ? T(sp.name) : '';
    el.querySelector('.name').hidden = !sp; el.hidden = false; el.classList.remove('done');
    const body = el.querySelector('.text'); body.textContent = '';
    sayState = { key, str, n: 0, el, body, res, sp, t: 0 };
    if (sp) { sfx('talk'); if (sp.p) wobble(sp.p, 0.08); }
    speak(str, save.lang, sp ? sp.pitch : 1.0, key === 'n' ? 0.9 : 1.0);
    if (o.auto) setTimeout(() => sayState?.str === str && advance(true), o.auto * 1000);
  });
}
function advance(force) {
  const s = sayState; if (!s) return;
  if (s.n < s.str.length && !force) { s.n = s.str.length; s.body.textContent = s.str; s.el.classList.add('done'); return; }
  sayState = null; s.el.hidden = true; hush(); s.res();
}
function sayTick(dt) {
  const s = sayState; if (!s) return;
  if (s.n < s.str.length) { s.t += dt * (save.lang === 'en' ? 45 : 22); const n = Math.min(s.str.length, Math.floor(s.t)); if (n !== s.n) { s.n = n; s.body.textContent = s.str.slice(0, n); } if (s.n >= s.str.length) s.el.classList.add('done'); }
  if (s.sp && s.sp.p) placeOver(s.el, s.sp.p, 0.25);
}
// a quick bubble that floats off by itself (no waiting)
function pip(text, x, y, z, dur = 1.6) {
  const el = document.createElement('div'); el.className = 'pip'; el.textContent = T(text); document.body.appendChild(el);
  const v = new THREE.Vector3(x, y, z); const o = { el, v, t: 0, dur }; pips.push(o);
}
const pips = [];
function pipTick(dt) { for (let i = pips.length - 1; i >= 0; i--) { const o = pips[i]; o.t += dt; o.v.y += dt * 0.35; const s = screenOf(o.v); o.el.style.left = s.x + 'px'; o.el.style.top = s.y + 'px'; o.el.style.opacity = Math.min(1, (o.dur - o.t) * 3); if (o.t > o.dur) { o.el.remove(); pips.splice(i, 1); } } }
const _v = new THREE.Vector3();
function screenOf(v) { _v.copy(v).project(camera); return { x: (_v.x * 0.5 + 0.5) * innerWidth, y: (-_v.y * 0.5 + 0.5) * innerHeight, behind: _v.z > 1 }; }
function topOf(p, pad = 0.2) { const h = p.kind === 'stand' ? p.h * Math.max(0.2, p.rise) : 0.3; return new THREE.Vector3(p.pos.x, p.pos.y + h + pad + p.wob.position.y, p.pos.z); }
function placeOver(el, p, pad) { const s = screenOf(topOf(p, pad)); const w = el.offsetWidth, h = el.offsetHeight; el.style.left = Math.max(8, Math.min(innerWidth - w - 8, s.x - w / 2)) + 'px'; el.style.top = Math.max(8, s.y - h - 14) + 'px'; }

// ---------------------------------------------------------------- goals and hints
let goalText = null, goalAt = null, idleT = 0;
const hint = { obj: sprite('arrow', 0.55), t: 0 }; hint.obj.visible = false; hint.obj.center.set(0.5, 0);
function goal(text, at) { goalText = text; goalAt = at || null; idleT = 0; $('goal').hidden = !text; $('goalText').textContent = T(text); if (text) { $('goal').classList.remove('new'); void $('goal').offsetWidth; $('goal').classList.add('new'); } }
function hintTick(dt, time) {
  idleT += dt; const show = goalAt && idleT > 9 && !run.busy;
  hint.obj.visible = !!show;
  if (show) { const [x, z, y = 1.6] = typeof goalAt === 'function' ? goalAt() : goalAt; hint.obj.position.set(x, y + Math.abs(Math.sin(time * 4)) * 0.35, z); }
}

// ---------------------------------------------------------------- the things to touch
const prompt = $('prompt');
function item(o) { const it = Object.assign({ r: 1.2, icon: '✋', on: null }, o); items.push(it); return it; }
const itemOn = (it) => !it.gone && (!it.on || it.on());
let near = null;
function nearItem() {
  let best = null, bd = 1e9;
  for (const it of items) { if (!itemOn(it)) continue; const d = Math.hypot(it.x - J.x, (it.z - J.z) * 1.2); if (d < it.r && d < bd) { bd = d; best = it; } }
  return best;
}
function promptTick() {
  near = run.busy || mode !== 'play' ? null : nearItem();
  if (!near) { prompt.hidden = true; return; }
  prompt.hidden = false; prompt.querySelector('.icon').textContent = near.icon; prompt.querySelector('.lbl').textContent = T(near.label);
  const s = screenOf(new THREE.Vector3(near.x, near.y ?? 1.2, near.z)); prompt.style.left = Math.max(8, Math.min(innerWidth - prompt.offsetWidth - 8, s.x - prompt.offsetWidth / 2)) + 'px'; prompt.style.top = Math.max(60, s.y - prompt.offsetHeight - 10) + 'px';
}
function useItem(it) { if (!itemOn(it) || run.busy) return; idleT = 0; goTo = null; J.vx = J.vz = 0; run(async () => { if (it.once) it.gone = true; await it.act(g, it); }); }

// a script runs one at a time; walking stops while it runs
async function run(fn) { if (run.busy) return; run.busy = true; try { await fn(); } catch (e) { console.error(e); } finally { run.busy = false; } }
run.busy = false;

// ---------------------------------------------------------------- little stage tricks for the spreads
function wobble(p, amt = 0.15, dur = 0.6) { const z0 = 0; return anim(dur, (t, raw) => { p.wob.rotation.z = z0 + Math.sin(raw * Math.PI * 6) * amt * (1 - raw); }, 'lin'); }
async function hop(p, h = 0.4, dur = 0.35) { await anim(dur, (t, raw) => { p.wob.position.y = Math.sin(raw * Math.PI) * h; }, 'lin'); p.wob.position.y = 0; }
// a card flip: squash flat sideways, change the picture, spring back
async function morph(p, cut, dur = 0.36) { sfx('paper'); await anim(dur / 2, (t) => { p.wob.scale.x = 1 - t; }, 'in'); p.setCut(cut); await anim(dur / 2, (t) => { p.wob.scale.x = t; }, 'back'); p.wob.scale.x = 1; }
function raise(p, to = 1, dur = 0.6, e = 'back') { const r0 = p.rise; return anim(dur, (t) => { p.rise = r0 + (to - r0) * t; p.apply(); }, e); }
function liftFlap(p, to = 1, dur = 0.6) { const l0 = p.lift; sfx('flap'); return anim(dur, (t) => { p.lift = l0 + (to - l0) * t; p.apply(); }, 'back'); }
// a baby jumps out from (x, z): pops up, hops, and joins the line
async function found(i, x, z, o = {}) {
  const f = addFollower(i, x, z); f.free = true; f.piece.rise = 0; f.piece.apply();
  if (o.from) f.piece.hinge.position.set(x, o.from, z);
  sfx('pop'); burst(x, 0.8, z, 'conf', 30);
  await anim(0.5, (t) => { f.piece.rise = t; f.piece.apply(); if (o.from) f.piece.hinge.position.y = o.from * (1 - t); }, 'back');
  sfx('found'); burst(x, 1, z, 'heart', 6); await hop(f.piece, 0.6, 0.45); await hop(f.piece, 0.3, 0.3);
  if (!save.babies.includes(i)) save.babies.push(i);
  hud(); f.free = false; trail.splice(0, 0, ...Array(4).fill([J.x, J.z]));
  return f;
}
async function star(x, z, y = 0.6) {
  const id = SI; if (save.stars.includes(id)) return;
  const p = piece(ART.star(), 'stand', x, z, { y }); p.rise = 1; p.apply();
  sfx('star'); burst(x, y + 0.5, z, 'glow', 10);
  await anim(0.9, (t, raw) => { p.hinge.position.y = y + Math.sin(raw * Math.PI) * 1.4; p.wob.rotation.y = raw * Math.PI * 4; }, 'lin');
  save.stars.push(id); hud(); pip({ zh: '找到一顆星星！', en: 'You found a star!' }, x, y + 1.2, z, 1.8);
  await anim(0.3, (t) => p.wob.scale.setScalar(1 - t), 'in'); p.hinge.visible = false;
}
function solid(o) { const s = Object.assign({}, o); solids.push(s); return s; }
function walk(o) { walks.push(o); return o; }

// the page is finished: the corner glows, walk to it (or tap it) to turn
function done(text) {
  S.done = true; const [x, z] = S.def.exit;
  exitMark.visible = exitGlow.visible = true; exitMark.position.set(x, 0.75, z); exitGlow.position.set(x, 0.3, z);
  goal(text || { zh: '走到右下角的箭頭，翻到下一頁', en: 'Walk to the arrow in the corner to turn the page' }, [x, z, 1.4]);
  item({ x, z, r: 1.3, icon: '📖', label: { zh: '翻到下一頁', en: 'Turn the page' }, act: () => turnPage() });
}
const exitMark = sprite('turn', 0.8); exitMark.visible = false; const exitGlow = sprite('glow', 2.2, true); exitGlow.visible = false;

const g = { T, say, pip, goal, wait, anim, item, solid, walk, piece, glow, lamps, burst, wobble, hop, morph, raise, liftFlap, found, star, done, who, sfx, J, followers, save, ease,
  stand: (cut, x, z, o) => piece(cut, 'stand', x, z, o), flap: (cut, x, z, o) => piece(cut, 'flap', x, z, o), flat: (cut, x, z, o) => piece(cut, 'flat', x, z, o),
  get lang() { return save.lang; }, get busy() { return run.busy; }, run, ART, near: (x, z, r) => Math.hypot(J.x - x, J.z - z) < r, cheer: (v) => { J.cheer = v; }, lantern: (v) => { J.lantern = v; }, camOverview: (v) => { cam.overview = v; }, end: () => ending(), sprite, screenOf };

// ---------------------------------------------------------------- building a spread
const pageTex = new Map();
function pagesOf(i) {
  const key = i + save.lang;
  if (!pageTex.has(key)) { const d = SPREADS[i]; const c = paintSpread(d.paint, d.seed || i + 1, { n: String(i + 1), t: T(d.title) }); pageTex.set(key, { L: tex(c.L), R: tex(c.R) }); }
  return pageTex.get(key);
}
function lightFor(d) {
  const L = Object.assign({ sky: '#fff6e8', ground: '#8a6a50', hemi: 1.0, sun: '#fff1dc', sunI: 1.9, sunPos: [-11, 15, 7], exp: 1.05, bg: '#3a2a22', glow: '#3a3530' }, d.light || {});
  Piece.glow = L.glow; for (const p of [J.piece, ...followers.map((f) => f.piece)]) p.front.emissive.set(L.glow);
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi; sunL.color.set(L.sun); sunL.intensity = L.sunI; sunL.position.set(...L.sunPos); renderer.toneMappingExposure = L.exp; scene.background.set(L.bg);
}
function buildSpread(i) {
  clearSpread(); SI = i; const d = SPREADS[i];
  S = { def: d, st: {}, done: false, i };
  lightFor(d); J.lantern = false; J.cheer = false;
  d.setup(g, S.st);
  if (d.who) for (const [k, v] of Object.entries(d.who)) who(k, v.p(S.st), v.name, v.pitch);
}
async function enterSpread(i, first) {
  buildSpread(i); const d = SPREADS[i];
  placeParty(...d.start); J.face = 1;
  J.piece.hinge.visible = true; J.piece.rise = 0; J.piece.apply(); followers.forEach((f) => { f.piece.rise = 0; f.piece.apply(); });
  drawParty(0, 0);
  music(d.music);
  hud(); await riseAll();
  await run(async () => { await d.intro(g, S.st, first); });
}

// ---------------------------------------------------------------- turning the page
async function turnPage() {
  if (mode !== 'play') return;
  const next = SI + 1; if (next >= SPREADS.length) return;
  mode = 'turn'; prompt.hidden = true; goal(null); hint.obj.visible = false; exitMark.visible = exitGlow.visible = false; goTo = null;
  cam.overview = true;
  save.si = next; store();
  await foldAll(0.55);
  const cur = pagesOf(SI), nx = pagesOf(next);
  book.leaf.textures(cur.R, nx.L); book.setPages(cur.L, nx.R); book.leaf.group.visible = true; book.leaf.set(0);
  clearSpread(); sfx('turn');
  await anim(1.15, (t) => book.leaf.set(t), 'inout');
  book.setPages(nx.L, nx.R); book.leaf.group.visible = false;
  cam.overview = false; mode = 'play';
  await enterSpread(next, true);
}

// ---------------------------------------------------------------- the HUD
function hud() {
  const b = $('babies'); if (!b.children.length) ART.BABIES.forEach((B, i) => { const c = document.createElement('img'); c.src = ART.baby(i).img.toDataURL(); c.title = T(B.name); b.appendChild(c); });
  [...b.children].forEach((c, i) => c.classList.toggle('got', save.babies.includes(i)));
  $('stars').textContent = '⭐ ' + save.stars.length + ' / 5';
}

// ---------------------------------------------------------------- the title, the opening and the end
let mode = 'title';
function titleScreen() {
  mode = 'title'; clearSpread(); followers.forEach((f) => f.piece.dispose()); followers.length = 0; J.piece.hinge.visible = false;
  book.setCover(save.lang); book.setOpen(0); lightFor({});
  const p = pagesOf(0); book.setPages(p.L, p.R);
  cam.overview = false; cam.tx = cam.x = 5; cam.tz = cam.z = 0.6; cam.tw = cam.w = Math.max(13, fitWidth() * 0.95); camUpdate(0, true);
  $('title').hidden = false; $('hud').hidden = true; $('end').hidden = true; goal(null);
  $('continue').hidden = !(save.si > 0 && !save.done);
  document.querySelector('.settings0').append($('voiceBtn'), $('musicBtn'));
  setLangButtons(); music(null);
}
async function openBook(fromSave) {
  audioInit(); $('title').hidden = true; mode = 'opening';
  if (!fromSave) { save.si = 0; save.babies = []; save.stars = []; save.done = false; }
  // baby i (and the star) of spread i are found on spread i: keep only what came before the page we open at
  save.babies = save.babies.filter((i) => i < save.si); save.stars = save.stars.filter((i) => i < save.si); store();
  const si = save.si, p = pagesOf(si); book.setPages(p.L, p.R);
  cam.tx = 0; cam.tz = 0.3; cam.tw = 22; sfx('turn');
  await anim(1.6, (t) => book.setOpen(t), 'inout');
  // the babies already found come along
  for (const i of save.babies) addFollower(i, 0, 0);
  $('hud').hidden = false; mode = 'play';
  await enterSpread(si, !fromSave || true);
}
async function ending() {
  save.done = true; save.si = 0; store();
  await wait(0.6);
  $('endStars').textContent = save.stars.length;
  $('endMsg').textContent = T(save.stars.length >= 5 ? { zh: '五顆星星全部找到了，你真厲害！', en: 'All five stars found. Amazing!' } : { zh: '書裡還藏著星星喔，再讀一次找找看！', en: 'There are more stars hidden in the book. Read it again to find them!' });
  $('end').hidden = false; mode = 'end';
}
async function closeBook() {
  $('end').hidden = true; mode = 'closing'; goal(null); prompt.hidden = true;
  cam.overview = true; await foldAll(0.5); clearSpread();
  followers.forEach((f) => f.piece.dispose()); followers.length = 0; J.piece.hinge.visible = false;
  cam.overview = false; cam.tx = 5; cam.tw = Math.max(13, fitWidth() * 0.95); sfx('turn');
  await anim(1.4, (t) => book.setOpen(1 - t), 'inout');
  titleScreen();
}

// ---------------------------------------------------------------- input
const keys = new Set();
addEventListener('keydown', (e) => {
  if (e.repeat && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) { e.preventDefault(); return; }
  keys.add(e.code); audioInit();
  if (['Space', 'Enter', 'KeyE', 'KeyZ', 'NumpadEnter'].includes(e.code)) { e.preventDefault(); pressAct(); }
  if (e.code === 'Escape') toggleMenu();
  if (e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
function pressAct() {
  if (sayState) return advance();
  if (mode === 'title') return openBook(false);
  if (mode === 'end') return;
  if (mode === 'play' && near && !run.busy) useItem(near);
}
function axis() {
  let x = 0, z = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1; if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
  if (keys.has('ArrowUp') || keys.has('KeyW')) z -= 1; if (keys.has('ArrowDown') || keys.has('KeyS')) z += 1;
  const gp = navigator.getGamepads?.()[0] || [...(navigator.getGamepads?.() || [])].find(Boolean);
  if (gp) {
    const gx = gp.axes[0] || 0, gz = gp.axes[1] || 0; if (Math.hypot(gx, gz) > 0.25) { x += gx; z += gz; }
    if (gp.buttons[14]?.pressed) x -= 1; if (gp.buttons[15]?.pressed) x += 1; if (gp.buttons[12]?.pressed) z -= 1; if (gp.buttons[13]?.pressed) z += 1;
    const a = gp.buttons[0]?.pressed; if (a && !axis.a) pressAct(); axis.a = a;
    const st = gp.buttons[9]?.pressed; if (st && !axis.st) toggleMenu(); axis.st = st;
  }
  return [x, z];
}
// tap the page to walk there, or tap a thing to go and touch it
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2(), hitP = new THREE.Vector3();
canvas.addEventListener('pointerdown', (e) => {
  audioInit();
  if (sayState) return advance();
  if (mode === 'title') return openBook(false);
  if (mode !== 'play' || run.busy) return;
  let best = null, bd = 70 * Math.max(1, innerWidth / 1400);
  for (const it of items) { if (!itemOn(it)) continue; for (const y of [0.2, it.y ?? 1.0]) { const s = screenOf(new THREE.Vector3(it.x, y, it.z)); const d = Math.hypot(s.x - e.clientX, s.y - e.clientY); if (d < bd) { bd = d; best = it; } } }
  if (best) { if (Math.hypot(best.x - J.x, (best.z - J.z) * 1.2) < best.r) return useItem(best); goTo = { x: best.x, z: best.z, item: best, t: 0, stuck: 0 }; return; }
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  if (ray.ray.intersectPlane(plane, hitP)) { goTo = { x: Math.max(-9.5, Math.min(9.5, hitP.x)), z: Math.max(-3, Math.min(3.15, hitP.z)), t: 0, stuck: 0 }; tapMark(hitP.x, hitP.z); }
});
function tapMark(x, z) { const s = sprite('glow', 0.5, true); s.position.set(x, 0.05, z); parts.push({ s, vx: 0, vy: 0, vz: 0, life: 0.5, g: 0, spin: 0, t: 0 }); }
prompt.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (near) useItem(near); });
bubble.addEventListener('pointerdown', (e) => { e.stopPropagation(); advance(); });
story.addEventListener('pointerdown', (e) => { e.stopPropagation(); advance(); });

// ---------------------------------------------------------------- buttons
function setLangButtons() {
  document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === save.lang));
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T(UI[el.dataset.t]); });
  $('voiceBtn').textContent = (save.voice ? '🔊 ' : '🔈 ') + T(UI.voice) + (save.voice ? '' : T(UI.off)); $('voiceBtn').hidden = !voiceAvailable();
  $('musicBtn').textContent = (save.music ? '🎵 ' : '🎵 ') + T(UI.music) + (save.music ? '' : T(UI.off));
  document.documentElement.lang = save.lang === 'en' ? 'en' : 'zh-Hant';
}
const UI = {
  start: { zh: '打開書本 ▶', en: 'Open the book ▶' }, cont: { zh: '從上次的地方繼續', en: 'Continue where I stopped' }, voice: { zh: '朗讀', en: 'Read aloud' }, music: { zh: '音樂', en: 'Music' }, off: { zh: '（關）', en: ' (off)' },
  resume: { zh: '繼續讀', en: 'Keep reading' }, cover: { zh: '闔上書本', en: 'Close the book' }, again: { zh: '再讀一次', en: 'Read it again' }, theend: { zh: '全劇終', en: 'The End' },
  starsGot: { zh: '找到的星星', en: 'Stars found' }, tip: { zh: '方向鍵或點畫面走路・空白鍵或點東西互動', en: 'Arrow keys or tap to walk · Space or tap things to use them' }, goalHead: { zh: '現在要做', en: 'Now' },
};
$('startBtn').onclick = () => openBook(false);
$('continue').onclick = () => openBook(true);
document.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => { save.lang = b.dataset.lang; store(); setLangButtons(); book.setCover(save.lang); if (mode === 'title') { const p = pagesOf(0); book.setPages(p.L, p.R); } }));
$('voiceBtn').onclick = () => { save.voice = !save.voice; setVoice(save.voice); store(); setLangButtons(); };
$('musicBtn').onclick = () => { save.music = !save.music; setMusic(save.music); store(); setLangButtons(); };
$('menuBtn').onclick = () => toggleMenu();
$('resumeBtn').onclick = () => toggleMenu(false);
$('coverBtn').onclick = () => { toggleMenu(false); if (mode === 'play' && !run.busy) closeBook(); };
$('againBtn').onclick = () => closeBook();
function toggleMenu(v) { const m = $('menu'); if (mode === 'title') return; m.hidden = v === undefined ? !m.hidden : !v; $('menu').querySelector('.settings').append($('voiceBtn'), $('musicBtn')); }

// ---------------------------------------------------------------- the frame
let last = performance.now(), time = 0;
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
  const [ax, az] = axis();
  if (mode === 'play' && !run.busy && $('menu').hidden) moveJasper(dt, ax, az); else { J.moving = false; J.vx = J.vz = 0; }
  if (Math.hypot(ax, az) > 0.2) idleT = 0;
  runTweens(dt); runParts(dt);
  if (mode === 'play' || mode === 'turn' || mode === 'end' || mode === 'closing') drawParty(dt, time);
  if (S && mode === 'play' && S.def.update) S.def.update(g, S.st, dt, time);
  for (const s of glows) if (s.userData.pulse) s.material.opacity = 0.6 + Math.sin(time * s.userData.pulse) * 0.3;
  if (exitMark.visible) { exitMark.position.y = 0.75 + Math.sin(time * 4) * 0.12; exitGlow.material.opacity = 0.5 + Math.sin(time * 4) * 0.3; }
  if (mode === 'play' || mode === 'turn') camFollow();
  camUpdate(dt); sayTick(dt); pipTick(dt); hintTick(dt, time); promptTick();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
titleScreen(); requestAnimationFrame(frame);
window.JASPER = { g, J, get S() { return S; }, get mode() { return mode; }, save, openBook, turnPage, items, followers, camera, book, scene, advance, get saying() { return !!sayState; }, useItem, SPREADS, buildSpread, enterSpread, pieces: () => pieces };

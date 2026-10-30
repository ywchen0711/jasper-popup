// Sounds made on the spot: paper rustles, pops, a music box, and the read-aloud voice.
let A = null, out = null, sfxG = null, musG = null, noiseBuf = null, musOn = true, theme = null, nextT = 0, step = 0, timer = null;
export function audioInit() {
  if (A) { if (A.state === 'suspended') A.resume(); return; }
  try {
    A = new (window.AudioContext || window.webkitAudioContext)();
    out = A.createGain(); out.gain.value = 0.8; out.connect(A.destination);
    sfxG = A.createGain(); sfxG.gain.value = 0.9; sfxG.connect(out); musG = A.createGain(); musG.gain.value = 0.32; musG.connect(out);
    noiseBuf = A.createBuffer(1, A.sampleRate, A.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    timer = setInterval(schedule, 60);
  } catch (e) { A = null; }
}
export const audioOK = () => !!A;
export function setMusic(v) { musOn = v; if (musG) musG.gain.value = v ? 0.32 : 0; }

function tone(f, t, dur, { type = 'sine', vol = 0.2, to = null, dest = sfxG, attack = 0.005 } = {}) {
  const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
}
function noise(t, dur, { vol = 0.2, f = 2000, q = 1, type = 'bandpass', to = null, attack = 0.01 } = {}) {
  const s = A.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const bq = A.createBiquadFilter(); bq.type = type; bq.frequency.setValueAtTime(f, t); if (to) bq.frequency.exponentialRampToValueAtTime(to, t + dur); bq.Q.value = q;
  const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  s.connect(bq); bq.connect(g); g.connect(sfxG); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
const bell = (f, t, vol = 0.12, dest = sfxG, dur = 0.9) => { tone(f, t, dur, { vol, dest }); tone(f * 2.01, t, dur * 0.5, { vol: vol * 0.35, dest }); tone(f * 3.98, t, dur * 0.25, { vol: vol * 0.12, dest }); };
const N = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function sfx(name) {
  if (!A) return; const t = A.currentTime + 0.01;
  switch (name) {
    case 'pop': tone(520, t, 0.16, { to: 1300, vol: 0.22 }); noise(t, 0.05, { vol: 0.1, f: 3000 }); break;
    case 'rise': noise(t, 0.28, { vol: 0.12, f: 1400, to: 3800, q: 0.8 }); tone(300, t + 0.12, 0.14, { to: 700, vol: 0.08 }); break;
    case 'fold': noise(t, 0.25, { vol: 0.1, f: 3000, to: 900, q: 0.8 }); break;
    case 'paper': noise(t, 0.18, { vol: 0.14, f: 2600, q: 0.6 }); noise(t + 0.08, 0.14, { vol: 0.08, f: 4200, q: 0.6 }); break;
    case 'flap': noise(t, 0.3, { vol: 0.16, f: 1800, to: 4400, q: 0.7 }); tone(220, t, 0.1, { vol: 0.08, to: 160 }); break;
    case 'turn': noise(t, 0.9, { vol: 0.2, f: 900, to: 3200, q: 0.5, attack: 0.25 }); noise(t + 0.6, 0.4, { vol: 0.1, f: 2400, to: 700, q: 0.6 }); tone(130, t + 0.9, 0.18, { vol: 0.1, to: 90 }); break;
    case 'step': noise(t, 0.05, { vol: 0.05, f: 1600 + Math.random() * 600, q: 2 }); break;
    case 'tab': noise(t, 0.4, { vol: 0.14, f: 900, to: 2400, q: 2 }); tone(300, t + 0.35, 0.12, { vol: 0.1, to: 500 }); break;
    case 'click': tone(1500, t, 0.04, { vol: 0.12, type: 'square' }); noise(t, 0.03, { vol: 0.08, f: 4000 }); break;
    case 'found': [72, 76, 79, 84].forEach((n, i) => bell(N(n), t + i * 0.11, 0.14)); tone(N(84), t + 0.45, 0.6, { vol: 0.06, type: 'triangle' }); break;
    case 'star': [84, 88, 91, 96].forEach((n, i) => bell(N(n), t + i * 0.07, 0.1)); break;
    case 'talk': for (let i = 0; i < 3; i++) tone(500 + Math.random() * 300, t + i * 0.07, 0.06, { vol: 0.06, type: 'triangle' }); break;
    case 'squeak': tone(900, t, 0.12, { to: 1600, vol: 0.12, type: 'triangle' }); tone(1500, t + 0.13, 0.1, { to: 1100, vol: 0.1, type: 'triangle' }); break;
    case 'poof': noise(t, 0.45, { vol: 0.25, f: 700, to: 200, q: 0.5, type: 'lowpass' }); tone(200, t, 0.2, { to: 80, vol: 0.12 }); break;
    case 'achoo': tone(700, t, 0.25, { to: 900, vol: 0.06, type: 'triangle' }); noise(t + 0.28, 0.25, { vol: 0.25, f: 2500, q: 0.6 }); break;
    case 'nope': tone(400, t, 0.12, { vol: 0.1, type: 'triangle' }); tone(300, t + 0.13, 0.18, { vol: 0.1, type: 'triangle' }); break;
    case 'sparkle': for (let i = 0; i < 5; i++) bell(N(88 + [0, 4, 7, 12, 16][i]), t + i * 0.05, 0.05, sfxG, 0.4); break;
    case 'wheel': for (let i = 0; i < 4; i++) tone(1200, t + i * 0.06, 0.03, { vol: 0.08, type: 'square' }); break;
    case 'gurgle': for (let i = 0; i < 4; i++) tone(180 + Math.random() * 80, t + i * 0.08, 0.08, { vol: 0.1, type: 'sine', to: 120 }); break;
    case 'bump': tone(160, t, 0.12, { vol: 0.12, to: 90 }); break;
    case 'slide': noise(t, 0.5, { vol: 0.08, f: 5000, q: 3 }); break;
    case 'cheer': [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => bell(N(n), t + i * 0.09, 0.12)); for (let i = 0; i < 8; i++) noise(t + 0.6 + i * 0.05, 0.1, { vol: 0.05, f: 3000 + Math.random() * 2000, q: 4 }); break;
    case 'hum': tone(N(67), t, 0.3, { vol: 0.06, type: 'triangle' }); tone(N(71), t + 0.25, 0.4, { vol: 0.06, type: 'triangle' }); break;
  }
}

// ---------------------------------------------------------------- the music box
// a few gentle tunes; each line is [melody (MIDI note or 0 for a rest), bass]
const TUNES = {
  day: { bpm: 104, mel: [72, 76, 79, 76, 77, 76, 74, 0, 72, 74, 76, 72, 74, 0, 67, 0, 72, 76, 79, 81, 79, 77, 76, 0, 74, 77, 76, 74, 72, 0, 0, 0], bass: [48, 0, 55, 0, 53, 0, 55, 0, 48, 0, 55, 0, 55, 0, 43, 0, 48, 0, 55, 0, 53, 0, 48, 0, 50, 0, 55, 0, 48, 0, 55, 0] },
  meadow: { bpm: 112, mel: [79, 0, 76, 79, 81, 79, 76, 0, 74, 76, 79, 76, 74, 72, 74, 0, 79, 0, 76, 79, 84, 83, 81, 0, 79, 81, 79, 76, 74, 76, 72, 0], bass: [48, 0, 52, 0, 53, 0, 52, 0, 50, 0, 55, 0, 43, 0, 55, 0, 48, 0, 52, 0, 57, 0, 53, 0, 55, 0, 52, 0, 55, 0, 48, 0] },
  night: { bpm: 76, mel: [69, 0, 72, 0, 76, 0, 74, 72, 71, 0, 72, 0, 69, 0, 0, 0, 69, 0, 72, 0, 77, 0, 76, 74, 72, 0, 71, 0, 69, 0, 0, 0], bass: [45, 0, 0, 0, 52, 0, 0, 0, 41, 0, 0, 0, 45, 0, 0, 0, 45, 0, 0, 0, 53, 0, 0, 0, 52, 0, 0, 0, 45, 0, 0, 0] },
  snow: { bpm: 92, mel: [76, 79, 84, 0, 83, 79, 81, 0, 79, 76, 77, 79, 76, 0, 0, 0, 76, 79, 84, 0, 86, 84, 83, 0, 81, 79, 77, 76, 72, 0, 0, 0], bass: [48, 0, 55, 0, 52, 0, 53, 0, 50, 0, 55, 0, 48, 0, 55, 0, 48, 0, 55, 0, 50, 0, 55, 0, 53, 0, 55, 0, 48, 0, 0, 0] },
  market: { bpm: 120, mel: [74, 76, 79, 81, 79, 76, 74, 0, 72, 74, 76, 79, 76, 0, 74, 0, 74, 76, 79, 81, 84, 81, 79, 76, 74, 76, 74, 72, 74, 0, 0, 0], bass: [50, 0, 57, 0, 55, 0, 57, 0, 48, 0, 55, 0, 50, 0, 57, 0, 50, 0, 57, 0, 55, 0, 52, 0, 50, 0, 55, 0, 50, 0, 57, 0] },
  home: { bpm: 96, mel: [76, 0, 74, 72, 74, 76, 76, 76, 74, 74, 74, 0, 76, 79, 79, 0, 76, 0, 74, 72, 74, 76, 76, 76, 74, 74, 76, 74, 72, 0, 0, 0], bass: [48, 0, 55, 0, 48, 0, 55, 0, 43, 0, 50, 0, 48, 0, 55, 0, 48, 0, 55, 0, 48, 0, 55, 0, 43, 0, 50, 0, 48, 0, 0, 0] },
};
export function music(name) { theme = TUNES[name] ? name : null; step = 0; if (A) nextT = A.currentTime + 0.1; }
function schedule() {
  if (!A || !theme) return; const T = TUNES[theme], dt = 60 / T.bpm / 2;
  while (nextT < A.currentTime + 0.25) {
    const i = step % T.mel.length, m = T.mel[i], b = T.bass[i];
    if (m) bell(N(m), nextT, 0.11, musG, 1.2); if (b) tone(N(b), nextT, 0.8, { vol: 0.09, dest: musG, type: 'triangle', attack: 0.02 });
    nextT += dt; step++;
  }
}

// ---------------------------------------------------------------- reading aloud
let voiceOn = true, voices = [];
const loadVoices = () => { try { voices = speechSynthesis.getVoices(); } catch (e) { voices = []; } };
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
export function setVoice(v) { voiceOn = v; if (!v) hush(); }
export const voiceAvailable = () => 'speechSynthesis' in window;
export function hush() { try { speechSynthesis.cancel(); } catch (e) { /* none */ } }
export function speak(text, lang, pitch = 1.1, rate = 0.95) {
  if (!voiceOn || !('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/[「」]/g, ''));
    const want = lang === 'en' ? ['en-US', 'en-GB', 'en'] : ['zh-TW', 'zh-HK', 'zh-CN', 'zh'];
    const v = want.map((w) => voices.find((x) => x.lang.replace('_', '-').startsWith(w))).find(Boolean); if (v) u.voice = v; u.lang = v ? v.lang : want[0];
    u.pitch = pitch; u.rate = rate; speechSynthesis.speak(u);
  } catch (e) { /* none */ }
}

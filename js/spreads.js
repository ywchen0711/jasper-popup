// The six spreads of the book: what is printed on the pages, what stands up out of them, and the story.
// Spread coordinates: x -10..10 (the spine at 0), z -3.5 (far edge) .. 3.5 (near edge). Baby i is found on spread i.
import * as A from './art.js';
const N = (zh, en) => ({ zh, en });
const MOM = N('熊貓媽媽', 'Panda Mom');

// ---------------------------------------------------------------- printing helpers
function nearLine(pts, x, z, d) {
  for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz))); if (Math.hypot(x - ax - vx * t, z - az - vz * t) < d) return true; }
  return false;
}
function grass(k, skip, dark = '#6aa84f', cols = ['#ff8fb1', '#ffffff', '#ffd34d', '#b98cff'], n = 1) { k.tufts(170 * n, dark, undefined, skip); k.flowers(55 * n, cols, undefined, skip); }
function waves(a, k, pts, col = 'rgba(255,255,255,.7)') {
  a.save(); a.strokeStyle = col; a.lineWidth = 3; a.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const t = k.r(), seg = Math.floor(t * (pts.length - 1)), f = t * (pts.length - 1) - seg, [ax, az] = pts[seg], [bx, bz] = pts[seg + 1], x = ax + (bx - ax) * f + (k.r() - 0.5) * 0.8, z = az + (bz - az) * f; const X = (x + 10) * 102.4, Y = (z + 3.5) * 102.4; a.beginPath(); a.moveTo(X - 12, Y); a.quadraticCurveTo(X - 6, Y - 6, X, Y); a.quadraticCurveTo(X + 6, Y + 6, X + 12, Y); a.stroke(); }
  a.restore();
}

// ================================================================ the bamboo home (pages 1 and 6)
const PATH0 = [[-6.2, -0.6], [-5.2, 0.6], [-2.6, 1.3], [0.4, 0.8], [3.2, 1.3], [6.2, 2.1], [9.9, 2.6]];
function paintHome(a, k, warm) {
  k.fill('#d3ebae'); k.blobs(46, ['#c2e39a', '#eaf6c4', '#bfe08e'], 0.28, 0.8, 2.6);
  k.blobs(16, ['#a8d483'], 0.22, 0.8, 1.8, [-10, -3.5, 10, -2.3]);
  k.ellipse(3.7, -1.3, 1.7, 0.8, '#8fd0f0', 1, '#6bb4dc'); k.ellipse(3.4, -1.45, 1.0, 0.35, '#c4ecff', 0.7);
  k.band(PATH0, 0.95, '#f3dfb3', '#e5c990');
  k.dots([[-1, 1.15], [1.8, 1.0], [4.6, 1.75], [7.6, 2.35]], '#d9bf8a', 9, 0.6);
  grass(k, (x, z) => nearLine(PATH0, x, z, 0.7) || Math.hypot((x - 3.7) / 1.8, (z + 1.3) / 0.9) < 1);
  if (warm) { k.blobs(30, ['#ffb070', '#ff9a8a', '#ffd08a'], 0.22, 1.5, 3.5); }
}
function homePieces(g, st, warm) {
  const s = g.stand;
  s(A.cloud(warm ? 1 : 0), -1.0, -3.35, { scale: 0.9 }); s(A.cloud(warm ? 1 : 0), 4.4, -3.3, { scale: 0.75, delay: 0.1 });
  s(A.sun(), warm ? 8.2 : 7.4, -3.3, { scale: warm ? 0.85 : 1, delay: 0.05 });
  s(A.bamboo(0), -9.1, -2.9, { solid: 0.5 }); s(A.bamboo(1), -3.3, -3.0, { scale: 0.95, solid: 0.5 });
  s(A.bamboo(2), 1.6, -3.05, { scale: 0.9, solid: 0.5 }); s(A.bamboo(1), 9.1, -2.8, { solid: 0.5 });
  s(A.tree(warm ? 2 : 0), 6.0, -2.6, { solid: 0.45 });
  st.hut = s(A.hut(warm ? 'home' : 'day'), -6.3, -2.0, { solid: 1.4, sz: -2.1 });
  s(A.fence(), -9.0, 0.5, { face: 0.6 }); g.solid({ x0: -9.9, z0: 0.0, x1: -8.2, z1: 1.0 });
  st.bushL = s(A.bush(1), -1.6, -1.6, { solid: 0.55 });
  st.bush = s(A.bush(0), 6.9, 0.8, { solid: 0.55 });
  s(A.rock(0), 1.2, 2.6, { solid: 0.45 }); s(A.rock(0), 8.6, -0.3, { scale: 0.7, solid: 0.3 });
  g.flat(A.lily(), 3.1, -1.2, { scale: 0.6, face: 0.3 }); g.solid({ c: true, x: 3.7, z: -1.3, r: 1.45 });
  st.mom = s(A.pandaMom('sad'), -3.6, -0.75, { solid: 0.65 }); g.who('mom', st.mom, MOM, 1.0);
}
const rnd = (n) => Math.floor(Math.random() * n);
const dist = (g, x, z) => Math.hypot(g.J.x - x, g.J.z - z);

// ================================================================ 1. the bamboo home: hide-and-seek, then a chase
// Yuanyuan hides in one of four places. The place she is in rustles now and then, but only when you are nearby.
// Each wrong guess makes her giggle and sneak to another place. Once found she runs off, and you have to catch her.
const home = {
  id: 'home', title: N('竹林的家', 'The Bamboo Home'), music: 'day', seed: 11, start: [-1.2, 1.6], exit: [9.1, 2.8],
  paint: (a, k) => paintHome(a, k, false),
  setup(g, st) {
    homePieces(g, st, false);
    const pileA = g.flap(A.leafPile(), -7.6, 1.45, { layer: 2 }), pileB = g.flap(A.leafPile(), -0.6, 2.0, { layer: 2, face: 0.2 });
    st.spots = [
      { kind: 'flap', p: pileA, x: -7.6, z: 2.1, out: [-7.6, 2.35] },
      { kind: 'flap', p: pileB, x: -0.6, z: 2.6, out: [-0.6, 2.85] },
      { kind: 'bush', p: st.bushL, x: -1.6, z: -1.6, out: [-1.6, -0.95] },
      { kind: 'bush', p: st.bush, x: 6.9, z: 0.8, out: [6.9, 1.45] },
    ];
    st.baby = rnd(4); st.starAt = (st.baby + 1 + rnd(3)) % 4; st.rt = 2; st.miss = 0;
    st.spots.forEach((sp, k) => g.item({ x: sp.x, z: sp.z, r: 1.45, y: 0.6, icon: '🔍', label: N('找找看', 'Search here'), on: () => !st.chase && !st.foundIt, act: () => search(g, st, k) }));
    g.item({ x: -3.6, z: -0.75, r: 1.7, y: 2.4, icon: '💬', label: N('和熊貓媽媽說話', 'Talk to Panda Mom'), act: async () => {
      if (S0done(st)) await g.say('mom', N('其他寶寶往小河那邊去了，要小心喔！', 'The others went toward the river. Be careful!'));
      else await g.say('mom', N('圓圓最會躲了，而且會偷偷換地方。她躲的地方會沙沙作響，要走近一點才聽得到。', 'Yuanyuan is the best at hiding, and she sneaks from place to place. Wherever she is will rustle, but only when you are close.'));
    } });
  },
  update(g, st, dt, time) {
    if (st.chase) return chaseTick(g, st, dt, time);
    if (st.foundIt) return;
    if ((st.rt -= dt) < 0) {
      st.rt = 2.2 + Math.random() * 1.8; const sp = st.spots[st.baby];
      if (!g.busy && dist(g, sp.x, sp.z) < 4.2) { g.wobble(sp.p, sp.kind === 'flap' ? 0.06 : 0.12, 0.5); g.sfx('giggle'); g.burst(sp.x, 0.5, sp.z, 'conf', 4); }
    }
  },
  async intro(g, st) {
    g.goal(null);
    await g.say('n', N('在竹林的最深處，住著熊貓媽媽和她的五個熊貓寶寶。', 'Deep in the bamboo forest lived Panda Mom and her five panda babies.'));
    await g.say('n', N('今天早上，寶寶們玩捉迷藏，玩著玩著……全部都不見了！', 'This morning the babies played hide-and-seek... and then they were all gone!'));
    await g.say('mom', N('Jasper！我的寶寶都不見了，你可以幫我找找嗎？', 'Jasper! My babies are lost. Can you help me find them?'));
    await g.say('jasper', N('交給我吧，熊貓媽媽！', 'Leave it to me, Panda Mom!'));
    await g.say('mom', N('圓圓一定還躲在附近。她躲的地方會沙沙作響……可是你每猜錯一次，她就會偷偷換地方！', 'Yuanyuan must be hiding nearby. Wherever she is will rustle... but every time you guess wrong, she sneaks somewhere else!'));
    g.goal(N('找到躲起來的圓圓（聽沙沙聲！）', 'Find Yuanyuan (listen for the rustling!)'), () => { const sp = st.spots[st.baby]; return [sp.x, sp.z, 1.3]; });
  },
};
const S0done = (st) => st.caught;
async function search(g, st, k) {
  const sp = st.spots[k];
  if (sp.kind === 'flap') await g.liftFlap(sp.p, 1, 0.5); else { g.sfx('paper'); await g.wobble(sp.p, 0.22, 0.55); }
  if (k === st.baby) {
    st.foundIt = true; g.goal(null);
    const [x, z] = sp.out, p = g.stand(A.baby(0), x, z); p.rise = 1; p.apply();
    g.sfx('pop'); await g.hop(p, 0.5, 0.35);
    st.chase = { p, x, z, vx: 0, vz: 0, t: 0, hop: 0 };
    await g.say('b0', N('嘻嘻，被你發現了！可是你抓不到我～', 'Hee hee, you found me! But you can\'t catch me!'));
    if (sp.kind === 'flap') g.liftFlap(sp.p, 0, 0.4);
    g.goal(N('抓住圓圓！把她逼到角落', 'Catch Yuanyuan! Corner her'), () => [st.chase.x, st.chase.z, 1.3]);
    return;
  }
  if (k === st.starAt && !st.starGot) { st.starGot = true; await g.star(...sp.out); }
  else g.pip(N('沒有人……', 'Nobody here...'), sp.x, 1.3, sp.z, 1.4);
  st.miss++;
  const opts = [0, 1, 2, 3].filter((i) => i !== k && i !== st.baby); st.baby = opts[rnd(opts.length)]; g.sfx('giggle'); st.rt = 1.2;
  if (sp.kind === 'flap') await g.liftFlap(sp.p, 0, 0.4);
}
function chaseTick(g, st, dt, time) {
  const c = st.chase; if (c.caught) return;
  c.t += dt; const J = g.J, dx = c.x - J.x, dz = c.z - J.z, d = Math.hypot(dx, dz);
  if (d < 0.75 && !g.busy) {
    c.caught = true; st.caught = true;
    g.run(async () => {
      g.goal(null); c.p.hinge.visible = false;
      await g.found(0, c.x, c.z);
      await g.say('b0', N('好啦好啦，被你抓到了！', 'Okay, okay, you got me!'));
      await g.morph(st.mom, A.pandaMom('happy'));
      await g.say('mom', N('圓圓！太好了，謝謝你，Jasper！', 'Yuanyuan! Oh, thank you, Jasper!'));
      await g.say('b0', N('我看到大家往小河那邊跑了！', 'I saw the others run off toward the river!'));
      await g.morph(st.mom, A.pandaMom('sad'));
      await g.say('mom', N('還有四個寶寶……拜託你了！', 'Four more babies to find... please help them!'));
      g.done();
    });
    return;
  }
  if (g.busy) return;
  // run away from Jasper: try directions round "straight away", keep off the edges of the page
  const tired = c.t > 14, sp = d < 4.5 ? (tired ? 2.0 : 2.75) : 0.8, base = Math.atan2(dz, dx);
  let best = null, bs = -1e9;
  for (const o of [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.1, -2.1, 2.6, -2.6]) {
    const a = base + o, nx = c.x + Math.cos(a) * 0.6, nz = c.z + Math.sin(a) * 0.6;
    if (g.blocked(nx, nz)) continue;
    const edge = Math.min(nx + 9.6, 9.6 - nx, nz + 3.0, 3.15 - nz), sc = Math.hypot(nx - J.x, nz - J.z) - Math.max(0, 1.4 - edge) * 1.6 - Math.abs(o) * 0.15;
    if (sc > bs) { bs = sc; best = a; }
  }
  if (best != null) { const k = Math.min(1, dt * 8); c.vx += (Math.cos(best) * sp - c.vx) * k; c.vz += (Math.sin(best) * sp - c.vz) * k; } else { c.vx *= 0.8; c.vz *= 0.8; }
  const nx = c.x + c.vx * dt, nz = c.z + c.vz * dt; if (!g.blocked(nx, c.z)) c.x = nx; if (!g.blocked(c.x, nz)) c.z = nz;
  c.hop += dt * Math.hypot(c.vx, c.vz);
  c.p.hinge.position.set(c.x, 0.012, c.z); if (Math.abs(c.vx) > 0.2) c.p.flip(c.vx < 0); c.p.wob.position.y = Math.abs(Math.sin(c.hop * 5)) * 0.14;
  if ((c.tt = (c.tt || 0) - dt) < 0 && d < 3) { c.tt = 3 + Math.random() * 2; g.sfx('giggle'); g.pip(tired ? N('呼……呼……跑不動了', 'Puff... puff... so tired') : N('抓不到～', 'Can\'t catch me!'), c.x, 1.3, c.z, 1.2); }
}

// ================================================================ 2. the flower meadow: the bridge tabs and the singing flower
// Three paper tabs each flip a different set of bridge boards; all three boards must lie down to cross.
// Then the big flower sings a tune on four flower pads: step on them in the same order, three rounds, longer each time.
const RIVER = [[3.7, -3.7], [4.25, -1.8], [3.8, 0], [4.25, 1.8], [3.9, 3.7]];
const PATH1 = [[-9.9, 2.3], [-6.5, 1.6], [-3, 1.9], [0, 1.2], [2.8, 1.0]], PATH1b = [[5.2, 1.0], [6.0, 1.6], [7.3, 2.6], [9.9, 2.5]];
const TABS = [{ x: 0.3, sym: '●', seg: [0, 1] }, { x: 1.3, sym: '▲', seg: [1, 2] }, { x: 2.3, sym: '■', seg: [0] }];
const SEGX = [2.95, 3.6, 4.25];
const PADS = [[6.0, 0.8, '#ff6b8a'], [7.3, -0.35, '#ffd34d'], [8.6, 0.8, '#5aa6ff'], [7.3, 1.95, '#b98cff']];
const LENS = [3, 4, 5];
const meadow = {
  id: 'meadow', title: N('花花草原', 'The Flower Meadow'), music: 'meadow', seed: 23, start: [-8.6, 2.2], exit: [9.2, 2.9],
  light: { sunI: 2.0, exp: 1.08 },
  paint(a, k) {
    k.fill('#c9eba0'); k.blobs(50, ['#b0e080', '#e4f6b8', '#a0d878', '#f6f2b0'], 0.3, 0.8, 2.6);
    k.band(RIVER, 1.95, '#8fd0f0', '#cfe8a8', 1); k.band(RIVER, 1.75, '#7cc3ec', '#5aa6d6'); waves(a, k, RIVER);
    k.band(PATH1, 0.85, '#f3dfb3', '#e5c990'); k.band(PATH1b, 0.85, '#f3dfb3', '#e5c990');
    k.ellipse(7.3, 0.8, 2.1, 1.6, '#e8f6c8', 0.8);
    grass(k, (x, z) => nearLine(PATH1, x, z, 0.6) || nearLine(PATH1b, x, z, 0.6) || nearLine(RIVER, x, z, 1.2) || Math.hypot((x - 7.3) / 2.1, (z - 0.8) / 1.6) < 1, '#62a848', ['#ff8fb1', '#ffffff', '#ffd34d', '#b98cff', '#ff9a3d'], 1.5);
    // the symbols printed by each tab
  },
  setup(g, st) {
    const s = g.stand;
    s(A.cloud(0), -6.0, -3.35, { scale: 0.85 }); s(A.cloud(0), 1.4, -3.4, { scale: 0.7 }); s(A.sun(), -2.6, -3.35, { scale: 0.85 });
    s(A.tree(1), -8.6, -2.5, { solid: 0.45 }); s(A.tree(0), -4.4, -2.85, { scale: 0.9, solid: 0.4 }); s(A.tree(1), 9.2, -2.9, { scale: 0.8, solid: 0.4 });
    s(A.bush(1), -1.3, -2.2, { solid: 0.5 }); s(A.bush(0), 2.2, -2.6, { scale: 0.8, solid: 0.4 }); s(A.bush(2), 9.3, 0.6, { scale: 0.7, solid: 0.35 });
    s(A.tulip('#ff9a3d', true), -6.3, -0.6, { scale: 0.6 }); s(A.tulip('#ff8fb1', true), -5.6, -0.2, { scale: 0.5 }); s(A.tulip('#b98cff', true), -2.4, -0.4, { scale: 0.55 });
    s(A.tulip('#ffd34d', true), 5.5, -2.2, { scale: 0.7 }); s(A.tulip('#5aa6ff', true), 9.0, -1.6, { scale: 0.7 });
    s(A.rock(0), -6.4, 1.0, { solid: 0.45 });
    g.solid({ x0: 3.05, z0: -3.6, x1: 4.95, z1: 3.6 });
    // the three bridge boards (standing up = not crossable) and their tabs
    st.down = [false, false, false];
    st.segs = SEGX.map((x, k) => s(A.plankSeg(), x, 1.0, { face: -Math.PI / 2, fixed: true, rise: 0.86, delay: 0.2 + k * 0.05 }));
    SEGX.forEach((x, k) => g.walk({ x0: k === 0 ? 2.5 : x - 0.1, z0: 0.45, x1: k === 2 ? 5.6 : x + 0.75, z1: 1.55, on: () => st.down[k] }));
    st.tabs = TABS.map((t) => g.flat(A.pullTab(t.sym), t.x, 3.5, { layer: 3, scale: 0.85 }));
    TABS.forEach((t, k) => g.item({ x: t.x, z: 3.1, r: 0.75, y: 0.4, icon: '👉', label: N(`拉 ${t.sym} 紙片`, `Pull the ${t.sym} tab`), on: () => !st.bridge, act: () => pullTab(g, st, k) }));
    g.flat(A.lily(), 4.05, 2.75, { scale: 0.85 });
    st.frog = s(A.frog(), 4.05, 2.8, { delay: 0.3 }); g.who('frog', st.frog, N('青蛙', 'Frog'), 0.8);
    g.item({ x: 4.05, z: 2.7, r: 1.7, y: 1.1, icon: '💬', label: N('和青蛙說話', 'Talk to the frog'), act: async () => {
      if (!st.bridge) await g.say('frog', N('呱！每張紙片都會翻動不同的木板。三塊木板全部放下來，才能過河喔。', 'Ribbit! Each tab flips different boards. All three boards must be down to cross.'));
      else if (!st.done) await g.say('frog', N('呱呱！那朵大花會唱歌。記住它唱的順序，照著踩花瓣！', 'Ribbit! That big flower sings. Remember the order and step on the petals the same way!'));
      else await g.say('frog', N('呱～祝你們一路順風！', 'Ribbit! Have a good trip!'));
    } });
    // the singing flower and its pads
    st.big = s(A.tulip('#ff6b8a', false), 7.3, -1.75, { scale: 1.35, solid: 0.45 });
    st.pads = PADS.map(([x, z, c]) => g.flat(A.pad(c), x, z, { layer: 1, scale: 0.95 }));
    st.seq = []; let last = -1; for (let i = 0; i < 5; i++) { let n; do n = rnd(4); while (n === last); st.seq.push(n); last = n; }
    st.round = 0; st.phase = 'idle'; st.mist = 0;
    g.item({ x: 7.3, z: -1.6, r: 1.5, y: 2.0, icon: '🎵', label: N('聽大花唱歌', 'Listen to the flower'), on: () => st.bridge && !st.done && st.phase !== 'sing', act: () => sing(g, st) });
  },
  update(g, st) {
    if (st.phase !== 'input' || g.busy) return;
    const on = padUnder(g);
    if (on === st.on) return; st.on = on; if (on == null) return;
    flash(g, st, on);
    if (on !== st.seq[st.pos]) { st.phase = 'idle'; st.mist++; g.sfx('buzz'); g.wobble(st.big, 0.12, 0.5); g.pip(N('唱錯了！再聽一次', 'Wrong note! Listen again'), PADS[on][0], 1.2, PADS[on][1], 1.6); g.run(async () => { await g.wait(1.0); await sing(g, st); }); return; }
    st.pos++;
    if (st.pos >= LENS[st.round]) {
      st.round++; st.phase = 'idle';
      if (st.round >= 3) g.run(() => flowerOpens(g, st));
      else g.run(async () => { g.sfx('star'); g.pip(N('答對了！下一段更長喔', 'Right! The next one is longer'), 7.3, 2.2, 0.8, 1.6); await g.wait(1.2); await sing(g, st); });
    }
  },
  async intro(g) {
    await g.say('n', N('Jasper 和圓圓來到了開滿花的草原。', 'Jasper and Yuanyuan came to a meadow full of flowers.'));
    await g.say('jasper', N('咦？河上的紙橋都豎起來了，過不去……', 'Huh? The paper bridge is folded up. We can\'t cross...'));
    g.goal(N('想辦法讓三塊木板都放下來', 'Get all three bridge boards down'), [1.3, 3.2, 0.8]);
  },
};
function padUnder(g) { let on = null; PADS.forEach(([x, z], k) => { if (dist(g, x, z) < 0.5) on = k; }); return on; }
async function pullTab(g, st, k) {
  const t = TABS[k], tab = st.tabs[k]; g.sfx('tab');
  await g.anim(0.22, (v) => { tab.pos.z = 3.5 + v * 0.45; }, 'out'); g.anim(0.22, (v) => { tab.pos.z = 3.95 - v * 0.45; }, 'out', 0.05);
  await Promise.all(t.seg.map((i) => { st.down[i] = !st.down[i]; return g.raise(st.segs[i], st.down[i] ? 0 : 0.86, 0.5, 'out'); }));
  g.sfx('bump');
  if (st.down.every(Boolean)) {
    st.bridge = true; g.burst(3.9, 0.3, 1, 'conf', 18);
    await g.say('n', N('啪！三塊木板全部放下來，紙橋接好了！', 'Flap! All three boards are down. The bridge is ready!'));
    await g.say('frog', N('呱呱！河對面那朵大花會唱歌。記住它唱的順序，照著踩花瓣！', 'Ribbit! The big flower across the river sings. Remember the order and step on the petals the same way!'));
    g.goal(N('聽大花唱歌，照順序踩花瓣（第 1/3 段）', 'Listen to the flower, then step on the petals in order (tune 1/3)'), [7.3, -1.6, 2.4]);
  }
}
async function flash(g, st, k) { const [, , c] = PADS[k]; g.sfx('n' + k); st.pads[k].setCut(A.pad(c, true)); g.burst(PADS[k][0], 0.3, PADS[k][1], 'glow', 3); await g.wait(0.32); st.pads[k].setCut(A.pad(c)); }
async function sing(g, st) {
  st.phase = 'sing'; st.on = null; g.goal(null);
  await g.wobble(st.big, 0.08, 0.4);
  const n = LENS[st.round], gap = [0.62, 0.52, 0.44][st.round];
  for (let i = 0; i < n; i++) { flash(g, st, st.seq[i]); await g.wobble(st.big, 0.05, gap); }
  st.phase = 'input'; st.pos = 0; st.on = padUnder(g); // standing on a petal already doesn't count: step off and on
  g.goal(N(`照著大花唱的順序踩花瓣（第 ${st.round + 1}/3 段）`, `Step on the petals in the flower's order (tune ${st.round + 1}/3)`), () => { const k = st.seq[st.pos] ?? 0; return [PADS[k][0], PADS[k][1], 0.9]; });
}
async function flowerOpens(g, st) {
  g.goal(null); st.done = true; g.sfx('cheer');
  await g.morph(st.big, A.tulip('#ff6b8a', true));
  await g.found(1, 7.3, -1.2, { from: 1.6 });
  await g.say('b1', N('哈——啾！我在花裡睡著了，是你的腳步把歌唱完的嗎？', 'Ah-choo! I fell asleep in the flower. Did your steps finish its song?'));
  if (st.mist === 0) { await g.star(7.3, 0.8); g.pip(N('一次都沒錯！', 'Not a single mistake!'), 7.3, 2.0, 0.8, 1.8); }
  await g.say('b1', N('毛毛跑進森林裡了，可是他很怕黑耶！', 'Maomao ran into the forest, but he is scared of the dark!'));
  g.done();
}

// ================================================================ 3. the moonlit forest: fireflies and soot sprites
// Four fireflies dart away when you come close and rest for a moment after. Two soot sprites wander the paths:
// touch one and a firefly you caught flies off again. Catch all four without a touch for the star.
const PATH2 = [[-9.9, 1.6], [-7, 1.2], [-4, 1.8], [-1, 1.1], [2, 1.5], [5, 0.9], [7, 1.6], [9.9, 2.3]];
const FLIES = [[-7.2, 2.2], [0.6, -0.9], [4.7, 2.5], [8.8, 0.4]];
const SOOTS = [{ x: -2.0, z: 0.8, rx: 2.8, rz: 1.4, w: 0.55 }, { x: 4.8, z: 0.9, rx: 2.4, rz: 1.5, w: -0.7 }];
const night = {
  id: 'night', title: N('月光森林', 'The Moonlit Forest'), music: 'night', seed: 37, start: [-8.8, 1.7], exit: [9.2, 2.9],
  light: { sky: '#7a8ad0', ground: '#1a2030', hemi: 0.8, sun: '#b0c0ff', sunI: 0.9, sunPos: [-8, 14, 6], exp: 1.25, bg: '#10131e', glow: '#141420' },
  paint(a, k) {
    k.fill('#3d5c70'); k.blobs(50, ['#34526a', '#4a6c80', '#3a5070'], 0.4, 0.8, 2.6);
    k.band(PATH2, 0.9, '#62808c', '#557482');
    k.tufts(160, '#6f9aa0', undefined, (x, z) => nearLine(PATH2, x, z, 0.6)); k.flowers(30, ['#9fb8ff', '#d0c0ff', '#8fe0d0'], undefined, (x, z) => nearLine(PATH2, x, z, 0.6));
    const d = []; for (let i = 0; i < 60; i++) d.push([-10 + k.r() * 20, -3.5 + k.r() * 7]); k.dots(d, '#fff6b0', 3, 0.5);
  },
  setup(g, st) {
    const s = g.stand; g.lantern(true);
    st.moon = s(A.moon(), -7.6, -3.3); st.moon.front.emissive.set('#8a7a40'); g.glow(-7.6, 2.75, -3.2, 3.2).userData.pulse = 0.8; s(A.cloud(0), 3.0, -3.4, { scale: 0.7 });
    for (const [x, z, sc] of [[-9.2, -2.5, 1], [-5.6, -3.0, 0.9], [5.4, -3.0, 0.95], [9.2, -2.4, 1]]) s(A.pine(false), x, z, { scale: sc, solid: 0.4 });
    s(A.tree(1), -1.4, -2.9, { scale: 0.9, solid: 0.4 }); s(A.tree(1), 2.8, -2.6, { scale: 0.8, solid: 0.4 });
    s(A.mushroom(false, true), -2.6, -1.3, { solid: 0.6 });
    for (const [x, z] of [[0.4, -2.1], [-6.6, 0.4], [3.6, 2.3]]) { s(A.mushroom(true), x, z, { scale: 0.6, solid: 0.3 }); g.glow(x, 0.6, z + 0.05, 1.6).userData.pulse = 2 + Math.random(); }
    g.lamps[1].position.set(-2.6, 1.6, -0.6); g.lamps[1].color.set('#9fe6ff'); g.lamps[1].intensity = 2.5;
    s(A.rock(0), -4.0, -0.7, { solid: 0.45 }); st.owl = s(A.owl(), -4.0, -0.68, { y: 0.5, delay: 0.25 }); g.who('owl', st.owl, N('貓頭鷹', 'Owl'), 0.75);
    st.log = s(A.log(false, false), 7.3, -1.4, { solid: 1.15, sx: 7.5 });
    st.flies = FLIES.map(([x, z]) => ({ x, z, vx: 0, vz: 0, got: false, flee: 0, rest: 0, s: g.glow(x, 1.0, z, 0.7) })); st.count = 0;
    st.soots = SOOTS.map((o, k) => ({ ...o, a: k * 2, p: s(A.soot(0), o.x + o.rx, o.z, { delay: 0.4 }) }));
    g.item({ x: -4.0, z: -0.7, r: 1.6, y: 1.8, icon: '💬', label: N('和貓頭鷹說話', 'Talk to the owl'), act: async () => {
      if (st.count < 4) await g.say('owl', N(`咕咕……還差 ${4 - st.count} 隻螢火蟲。牠們很怕生，衝過去會被嚇跑，等牠們停下來休息再抓。`, `Hoo hoo... ${4 - st.count} more fireflies. They are shy: rush at them and they dart off. Catch them when they stop to rest.`));
      else await g.say('owl', N('咕咕……那根大木頭好亮呢。', 'Hoo hoo... that big log is glowing.'));
    } });
    g.item({ x: 6.4, z: -0.8, r: 1.5, y: 1.0, icon: '🪵', label: N('看看木頭裡面', 'Look inside the log'), on: () => st.lit, once: true, act: async () => {
      g.goal(null); await g.morph(st.log, A.log(true, false));
      await g.found(2, 6.3, -0.4);
      await g.say('b2', N('嗚……謝謝你們，那些黑黑的煤炭精好可怕。', 'Sniff... thank you. Those soot sprites were so scary.'));
      if (!st.hit) { await g.star(6.3, 0.2); g.pip(N('一次都沒被碰到！', 'Not touched even once!'), 6.3, 1.6, 0.2, 1.8); }
      await g.say('jasper', N('別怕，我們一起走！', 'Don\'t be scared, we\'ll go together!'));
      await g.say('b2', N('糖糖最喜歡雪了，她一定跑去雪山了！', 'Tangtang loves snow. She must have gone up the snowy mountain!'));
      g.done();
    } });
  },
  update(g, st, dt, time) {
    const J = g.J;
    // the soot sprites go round their paths
    for (const o of st.soots) {
      o.a += o.w * dt; const x = o.x + Math.cos(o.a) * o.rx, z = o.z + Math.sin(o.a) * o.rz, f = Math.floor(time * 4) % 2;
      o.p.pos.set(x, 0, z); o.p.wob.position.y = Math.abs(Math.sin(time * 8 + o.a)) * 0.12; o.p.flip(-Math.sin(o.a) * o.w < 0);
      if (o.p.cut !== A.soot(f)) o.p.setCut(A.soot(f));
      if (!g.busy && !st.toLog && (st.hurt || 0) <= 0 && Math.hypot(J.x - x, J.z - z) < 0.65) bumped(g, st, x, z);
    }
    if ((st.hurt || 0) > 0) { st.hurt -= dt; J.piece.hinge.visible = Math.floor(st.hurt * 10) % 2 === 0 || st.hurt <= 0; }
    st.flies.forEach((f, k) => {
      if (st.toLog) return;
      if (f.got) { const a = time * 2.6 + (k * Math.PI * 2) / 4; f.s.position.set(J.x + Math.cos(a) * 0.7, 1.3 + Math.sin(time * 4 + k) * 0.15, J.z + Math.sin(a) * 0.4); return; }
      const d = Math.hypot(J.x - f.x, J.z - f.z);
      if (d < 0.6 && !g.busy) { f.got = true; st.count++; g.sfx('sparkle'); g.pip(`✨ ${st.count} / 4`, f.x, 1.6, f.z, 1.4); if (st.count >= 4) g.run(() => fliesToLog(g, st)); else setGoal(g, st); return; }
      if (f.rest > 0) { f.rest -= dt; f.vx = f.vz = 0; }
      else if (f.flee > 0) { f.flee -= dt; if (f.flee <= 0) f.rest = 0.9 + Math.random() * 0.5; }
      else if (d < 1.9) { const a = Math.atan2(f.z - J.z, f.x - J.x) + (Math.random() - 0.5) * 1.4; f.vx = Math.cos(a) * 2.6; f.vz = Math.sin(a) * 2.6; f.flee = 0.8 + Math.random() * 0.5; g.sfx('whoosh'); }
      else { f.vx = Math.sin(time * 0.7 + k * 3) * 0.4; f.vz = Math.cos(time * 0.9 + k) * 0.3; }
      let nx = f.x + f.vx * dt, nz = f.z + f.vz * dt;
      if (nx < -9.3 || nx > 9.3) { f.vx *= -1; nx = f.x; } if (nz < -2.8 || nz > 3.0) { f.vz *= -1; nz = f.z; }
      f.x = nx; f.z = nz;
      f.s.position.set(f.x, 1.0 + Math.sin(time * 2.1 + k * 2) * 0.2, f.z); f.s.material.opacity = f.rest > 0 ? 0.6 + Math.sin(time * 10) * 0.4 : 0.85;
    });
  },
  async intro(g, st) {
    await g.say('n', N('天黑了，森林裡好安靜……', 'Night fell, and the forest grew very quiet...'));
    await g.say('jasper', N('毛毛——你在哪裡？', 'Maomao! Where are you?'));
    await g.say('owl', N('咕咕……毛毛很怕黑，躲起來了。去抓四隻螢火蟲吧，牠們會幫你照亮。', 'Hoo hoo... Maomao is scared of the dark and hiding. Catch four fireflies, they will light the way.'));
    await g.say('owl', N('小心那些黑黑的煤炭精，被牠們碰到，螢火蟲會嚇得飛走！', 'Watch out for the soot sprites. If one touches you, your fireflies will fly away in fright!'));
    setGoal(g, st);
  },
};
function setGoal(g, st) { g.goal(N(`抓到四隻螢火蟲（${st.count}/4），別碰到煤炭精`, `Catch four fireflies (${st.count}/4) and avoid the soot sprites`), () => { const f = st.flies.find((q) => !q.got); return f ? [f.x, f.z, 1.9] : [6.4, -0.8, 1.6]; }); }
function bumped(g, st, x, z) {
  const J = g.J; st.hit = true; st.hurt = 1.6; g.sfx('poof'); g.burst(J.x, 0.8, J.z, 'snow', 10);
  const dx = J.x - x, dz = J.z - z, d = Math.hypot(dx, dz) || 1; for (let s = 1.2; s > 0.1; s -= 0.2) { const nx = J.x + (dx / d) * s, nz = J.z + (dz / d) * s; if (!g.blocked(nx, nz)) { g.setPos(nx, nz); break; } }
  const lost = st.flies.filter((f) => f.got);
  if (lost.length) { const f = lost[lost.length - 1]; f.got = false; st.count--; const spot = FLIES[rnd(FLIES.length)]; f.x = spot[0]; f.z = spot[1]; f.rest = 0; f.flee = 0; g.pip(N('哎呀！螢火蟲飛走了', 'Oh no! A firefly flew away'), J.x, 2.2, J.z, 1.6); setGoal(g, st); }
  else g.pip(N('哇！嚇一跳', 'Eek!'), J.x, 2.2, J.z, 1.2);
}
async function fliesToLog(g, st) {
  g.goal(null); st.toLog = true;
  await g.say('n', N('四隻螢火蟲一起飛向了大木頭……', 'The four fireflies flew off together toward the big log...'));
  const from = st.flies.map((f) => f.s.position.clone());
  await g.anim(1.4, (t) => st.flies.forEach((f, k) => { const tx = 6.4 + Math.cos(k * 1.6) * 0.35, ty = 0.75 + Math.sin(k * 1.6) * 0.25, tz = -1.25; f.s.position.set(from[k].x + (tx - from[k].x) * t, from[k].y + (ty - from[k].y) * t + Math.sin(t * Math.PI) * 1.2, from[k].z + (tz - from[k].z) * t); }), 'inout');
  g.lamps[3].position.set(6.5, 1.0, -0.6); g.lamps[3].color.set('#ffd27a');
  g.anim(0.8, (t) => { g.lamps[3].intensity = t * 4; }, 'out');
  await g.morph(st.log, A.log(true, true)); st.lit = true; g.sfx('sparkle');
  await g.say('n', N('木頭裡亮起來了，好像有一雙小眼睛在看著你……', 'The log lights up, and two little eyes peek out at you...'));
  g.goal(N('看看大木頭裡面', 'Look inside the big log'), [6.4, -0.8, 1.6]);
}

// ================================================================ 4. the snowy mountain: the sliding ice
// Once on the ice you slide until a rock stops you. The top and right edges are snowbanks (you stop there); you can
// only get on or off from the left and the bottom. Tangtang is inside the sneezing snowman in the middle of the lake:
// stop right next to him (at least seven slides). A star sits on one hard-to-reach square.
const LK = { x0: -2.0, z0: -1.4, cell: 0.9, C: 10, R: 4 };
const ROCKS = [[2, 3], [3, 0], [3, 1], [4, 1], [5, 3], [6, 2], [7, 3], [8, 3], [9, 0], [9, 3]];
const SNOWMAN = [6, 1], STAR = [9, 1];
const cx = (c) => LK.x0 + LK.cell * (c + 0.5), cz = (r) => LK.z0 + LK.cell * (r + 0.5);
const inLake = (x, z) => x > LK.x0 && x < LK.x0 + LK.cell * LK.C && z > LK.z0 && z < LK.z0 + LK.cell * LK.R;
const rockAt = (c, r) => ROCKS.some(([a, b]) => a === c && b === r) || (c === SNOWMAN[0] && r === SNOWMAN[1]);
const snow = {
  id: 'snow', title: N('雪山', 'The Snowy Mountain'), music: 'snow', seed: 41, start: [-8.8, 2.3], exit: [9.2, 2.9],
  light: { sky: '#eaf4ff', ground: '#9fb0c8', hemi: 1.05, sun: '#ffffff', sunI: 1.7, exp: 1.0, bg: '#232a38' },
  paint(a, k) {
    k.fill('#eef5fb'); k.blobs(46, ['#dbe8f6', '#ffffff', '#cfe0f2'], 0.5, 0.8, 2.6);
    const X = (x) => (x + 10) * 102.4, Y = (z) => (z + 3.5) * 102.4, x1 = LK.x0 + LK.cell * LK.C, z1 = LK.z0 + LK.cell * LK.R;
    a.save(); a.fillStyle = '#bfe4f7'; a.fillRect(X(LK.x0), Y(LK.z0), X(x1) - X(LK.x0), Y(z1) - Y(LK.z0));
    for (let c = 0; c < LK.C; c++) for (let r = 0; r < LK.R; r++) { a.fillStyle = (c + r) % 2 ? 'rgba(255,255,255,.22)' : 'rgba(120,190,230,.15)'; a.fillRect(X(LK.x0 + c * LK.cell) + 2, Y(LK.z0 + r * LK.cell) + 2, LK.cell * 102.4 - 4, LK.cell * 102.4 - 4); }
    a.strokeStyle = 'rgba(255,255,255,.85)'; a.lineWidth = 5; a.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const x = LK.x0 + k.r() * (x1 - LK.x0 - 0.6), z = LK.z0 + 0.2 + k.r() * (z1 - LK.z0 - 0.4); a.beginPath(); a.moveTo(X(x), Y(z)); a.lineTo(X(x + 0.45), Y(z - 0.18)); a.stroke(); }
    a.restore();
    // snowbanks on the top and right edges of the lake
    const bank = (x, z) => k.ellipse(x, z, 0.5, 0.26, '#ffffff', 1, '#c8dcef');
    for (let x = LK.x0 + 0.2; x < x1; x += 0.6) bank(x, LK.z0 - 0.12);
    for (let z = LK.z0; z < z1; z += 0.5) bank(x1 + 0.12, z);
    const steps = []; for (let i = 0; i < 9; i++) steps.push([-9 + i * 0.85, 2.6 + (i % 2 ? 0.12 : -0.12)]); k.dots(steps, '#b7cbe0', 7, 0.6);
    k.tufts(40, '#a8c4d8', undefined, (x, z) => inLake(x, z) || (x > 7 && x < 7.6 && z > -1.6 && z < 2.3));
  },
  setup(g, st) {
    const s = g.stand;
    s(A.mountain(), -4.6, -3.4); s(A.mountain(), 5.3, -3.42, { scale: 0.85, delay: 0.05 }); s(A.cloud(0), 0.6, -3.2, { scale: 0.7 });
    for (const [x, z, sc] of [[-9.2, -2.2, 1], [-0.9, -2.5, 0.85], [1.6, -2.9, 0.7], [9.3, -2.0, 0.95], [-5.3, 2.6, 0.6]]) s(A.pine(true), x, z, { scale: sc, solid: 0.35 * sc + 0.05 });
    st.igloo = s(A.igloo(), -7.3, -1.6, { solid: 1.05, sz: -1.7 });
    st.peng = s(A.penguin(), -5.4, -0.5, { solid: 0.4 }); g.who('peng', st.peng, N('企鵝', 'Penguin'), 1.25);
    for (const [c, r] of ROCKS) { s(A.rock(1), cx(c), cz(r), { scale: 0.62 }); if (c === 0 || r === LK.R - 1) g.solid({ c: true, x: cx(c), z: cz(r), r: 0.42 }); }
    g.solid({ x0: LK.x0, z0: LK.z0 - 0.35, x1: LK.x0 + LK.cell * LK.C + 0.35, z1: LK.z0 - 0.1 });
    g.solid({ x0: LK.x0 + LK.cell * LK.C + 0.1, z0: LK.z0 - 0.35, x1: LK.x0 + LK.cell * LK.C + 0.35, z1: LK.z0 + LK.cell * LK.R });
    st.man = s(A.snowman('whole', '#e8473c'), cx(SNOWMAN[0]), cz(SNOWMAN[1]), {});
    st.decoys = [[8.6, 0.7, '#4caf6a'], [-4.0, 1.2, '#4a90e2']].map(([x, z, c]) => ({ x, z, p: s(A.snowman('whole', c), x, z, { solid: 0.5 }) }));
    st.decoys.forEach((d) => g.item({ x: d.x, z: d.z, r: 1.4, y: 1.6, icon: '⛄', label: N('拍拍雪人', 'Pat the snowman'), act: async () => { g.sfx('nope'); await g.wobble(d.p, 0.12, 0.5); g.pip(N('這個雪人沒有打噴嚏', 'This one isn\'t sneezing'), d.x, 2.0, d.z, 1.6); } }));
    st.starP = s(A.star(), cx(STAR[0]), cz(STAR[1]), { y: 0.25, delay: 0.3 });
    if (g.save.stars.includes(3)) st.starP.goal = 0;
    st.onIce = false; st.slide = null; st.sn = 2;
    g.item({ x: cx(SNOWMAN[0]), z: cz(SNOWMAN[1]), r: 1.05, y: 1.6, icon: '⛄', label: N('拍拍會打噴嚏的雪人', 'Pat the sneezing snowman'), on: () => st.onIce && !st.slide && !st.found, act: async () => {
      st.found = true; g.goal(null); g.sfx('poof'); g.burst(cx(6), 1.0, cz(1), 'snow', 40);
      await g.morph(st.man, A.snowman('pile'));
      await g.found(3, cx(6) + 0.3, cz(1) + 0.4);
      await g.say('b3', N('哈啾！好冷喔……謝謝你，Jasper！你滑冰滑得好厲害！', 'Ah-choo! So cold... thank you, Jasper! You slide like a champion!'));
      await g.say('b3', N('球球肚子餓了，他說要去市集找包子吃！', 'Qiuqiu was hungry. He said he was going to the market for buns!'));
      g.done(N('滑出冰湖，走到右下角的箭頭翻頁', 'Slide off the ice and walk to the arrow in the corner'));
    } });
    g.item({ x: -6.9, z: -1.0, r: 1.3, y: 0.8, icon: '🚪', label: N('敲敲冰屋的門', 'Knock on the igloo'), act: async () => { g.sfx('bump'); await g.wobble(st.igloo, 0.05, 0.3); await g.say('peng', N('那是我家啦！冰湖上的星星，我試了好久都滑不過去……', 'That\'s my house! I\'ve tried for ages to slide over to the star on the lake...')); } });
    g.item({ x: -5.4, z: -0.5, r: 1.4, y: 1.4, icon: '💬', label: N('和企鵝說話', 'Talk to the penguin'), act: async () => { await g.say('peng', st.found ? N('找到了！太好了！', 'You found her! Hooray!') : N('在冰上一滑就停不下來，只有撞到石頭才會停。上面和右邊是雪堆，只能從左邊和下面上下冰湖喔。', 'Once you slide on the ice you can\'t stop until you hit a rock. The top and right are snowbanks: you can only get on and off from the left and the bottom.')); } });
  },
  // Jasper on the ice: one push slides him all the way
  move(g, st, dt, ax, az) {
    const J = g.J;
    if (st.slide) {
      const s = st.slide, dx = s.tx - J.x, dz = s.tz - J.z, d = Math.hypot(dx, dz), step = 7 * dt;
      J.moving = false; if (Math.abs(dx) > 0.05) J.face = dx > 0 ? 1 : -1;
      if (d <= step) { g.setPos(s.tx, s.tz); st.slide = null; if (s.exit) st.onIce = false; else { st.cell = [s.c, s.r]; g.sfx('bump'); stopped(g, st); } }
      else g.setPos(J.x + (dx / d) * step, J.z + (dz / d) * step);
      return true;
    }
    if (!st.onIce) return false;
    let x = ax, z = az; if (Math.hypot(x, z) < 0.3) { const t = g.tapAxis(); if (t) { [x, z] = t; g.clearTap(); } }
    J.moving = false; if (Math.hypot(x, z) < 0.3) return true;
    const [dc, dr] = Math.abs(x) > Math.abs(z) ? [Math.sign(x), 0] : [0, Math.sign(z)];
    slideFrom(g, st, st.cell[0], st.cell[1], dc, dr);
    return true;
  },
  update(g, st, dt) {
    const J = g.J;
    // stepping onto the ice from the left or the bottom
    if (!st.onIce && !st.slide && inLake(J.x, J.z)) {
      const fromLeft = J.x - LK.x0 < LK.z0 + LK.cell * LK.R - J.z;
      const c = Math.max(0, Math.min(LK.C - 1, Math.floor((J.x - LK.x0) / LK.cell))), r = Math.max(0, Math.min(LK.R - 1, Math.floor((J.z - LK.z0) / LK.cell)));
      st.onIce = true; g.stopWalk(); g.clearTap();
      if (fromLeft) slideFrom(g, st, -1, r, 1, 0); else slideFrom(g, st, c, LK.R, 0, -1);
      if (!st.slide) { st.onIce = false; g.setPos(fromLeft ? LK.x0 - 0.3 : J.x, fromLeft ? J.z : LK.z0 + LK.cell * LK.R + 0.3); }
    }
    if (!st.found && (st.sn -= dt) < 0) { st.sn = 3 + Math.random() * 2; if (!g.busy) { g.sfx('achoo'); g.wobble(st.man, 0.14, 0.6); g.pip(N('哈——啾！', 'Ah-CHOO!'), cx(6), 2.0, cz(1), 1.4); g.burst(cx(6), 1.2, cz(1) + 0.1, 'snow', 8); } }
  },
  async intro(g) {
    await g.say('n', N('哇，好冷！雪山上有一大片結冰的湖。', 'Brrr! On the snowy mountain there is a big frozen lake.'));
    await g.say('peng', N('嘿，Jasper！湖中間那個雪人一直在打噴嚏耶！', 'Hey, Jasper! That snowman in the middle of the lake keeps sneezing!'));
    await g.say('peng', N('可是冰很滑，一滑就停不下來，只有撞到石頭才會停喔。', 'But the ice is slippery: once you slide you can\'t stop until you hit a rock.'));
    g.goal(N('滑到打噴嚏的雪人旁邊', 'Slide up next to the sneezing snowman'), [cx(6), cz(1), 2.2]);
  },
};
function slideFrom(g, st, c, r, dc, dr) {
  let x = c, y = r;
  for (;;) {
    const nx = x + dc, ny = y + dr;
    if (nx < 0 || nx >= LK.C || ny < 0 || ny >= LK.R) {
      if (x < 0 || x >= LK.C || y < 0 || y >= LK.R) return; // could not even get on
      if (dc === -1) { st.slide = { tx: LK.x0 - 0.45, tz: cz(y), exit: true }; break; }
      if (dr === 1) { st.slide = { tx: cx(x), tz: LK.z0 + LK.cell * LK.R + 0.45, exit: true }; break; }
      st.slide = { tx: cx(x), tz: cz(y), c: x, r: y }; break; // a snowbank
    }
    if (rockAt(nx, ny)) { if (x < 0 || x >= LK.C || y < 0 || y >= LK.R) return; st.slide = { tx: cx(x), tz: cz(y), c: x, r: y }; break; }
    x = nx; y = ny;
  }
  if (st.slide && Math.hypot(st.slide.tx - g.J.x, st.slide.tz - g.J.z) < 0.05 && !st.slide.exit) { st.slide = null; g.sfx('bump'); return; }
  g.sfx('slide');
}
function stopped(g, st) {
  const [c, r] = st.cell;
  if (c === STAR[0] && r === STAR[1] && !st.starGot && !g.save.stars.includes(3)) { st.starGot = true; st.starP.hinge.visible = false; g.run(() => g.star(cx(c), cz(r))); }
}

// ================================================================ 5. the market: the steamer shuffle
// Mr. Rabbit hides Qiuqiu under a steamer and shuffles them: three rounds, faster each time. Pick the right one.
const SLOTS = [2.4, 3.7, 5.0], SZ = 0.45;
const market = {
  id: 'market', title: N('熱鬧的市集', 'The Busy Market'), music: 'market', seed: 53, start: [-8.8, 2.2], exit: [9.2, 2.9],
  light: { sky: '#fff0dc', ground: '#9a7058', sun: '#ffe2b8', sunI: 1.85 },
  paint(a, k) {
    k.fill('#efd9bb'); k.blobs(30, ['#e8cba6', '#f6e6cc'], 0.4, 0.8, 2.4);
    a.save(); for (let i = 0; i < 520; i++) { const x = -10 + k.r() * 20, z = -3.5 + k.r() * 7, X = (x + 10) * 102.4, Y = (z + 3.5) * 102.4; a.beginPath(); a.ellipse(X, Y, 16 + k.r() * 10, 10 + k.r() * 6, k.r(), 0, 7); a.fillStyle = ['#e6c9a4', '#dcbd96', '#f0dcc0'][i % 3]; a.fill(); a.lineWidth = 2; a.strokeStyle = 'rgba(150,110,80,.35)'; a.stroke(); } a.restore();
    k.band([[-9.9, 2.3], [-5, 1.8], [0, 2.2], [5, 1.9], [9.9, 2.5]], 1.1, 'rgba(255,240,210,.7)');
    k.ellipse(3.7, 0.5, 2.3, 0.8, 'rgba(160,110,70,.22)', 1);
  },
  setup(g, st) {
    const s = g.stand;
    s(A.townhouse(0), -8.3, -2.95, { solid: 1.0 }); s(A.townhouse(1), -5.5, -3.15, { scale: 0.95 }); s(A.townhouse(2), 5.8, -3.15, { scale: 0.95 }); s(A.townhouse(0), 8.6, -2.95, { solid: 1.0 });
    s(A.lanterns(), 0, -2.3, { delay: 0.2 }); g.solid({ c: true, x: -3.45, z: -2.3, r: 0.2 }); g.solid({ c: true, x: 3.45, z: -2.3, r: 0.2 });
    st.fruit = s(A.stall('fruit'), -4.2, -1.3); g.solid({ x0: -5.6, z0: -1.6, x1: -2.8, z1: -1.05 });
    s(A.stall('bun'), 3.7, -1.3); g.solid({ x0: 2.2, z0: -1.6, x1: 5.2, z1: -1.05 });
    g.solid({ x0: 1.9, z0: 0.15, x1: 5.5, z1: 0.75 }); // the steamer table
    st.base = SLOTS.map((x) => s(A.steamer('base'), x, SZ));
    st.lid = SLOTS.map((x) => s(A.steamer('lid'), x, SZ, { y: 0.56, delay: 0.1 }));
    st.slot = [0, 1, 2]; st.qiu = rnd(3); st.round = 0; st.miss = 0; st.phase = 'wait';
    st.rab = s(A.rabbit(), 6.6, 0.1, { solid: 0.45 }); g.who('rab', st.rab, N('兔子老闆', 'Mr. Rabbit'), 1.2);
    s(A.sign(g.lang === 'en' ? 'BUNS' : '包子'), 1.2, 1.2, { scale: 0.8 });
    SLOTS.forEach((x, k) => g.item({ x, z: SZ + 0.6, r: 0.75, y: 1.0, icon: '🥟', label: N('就是這個！', 'This one!'), on: () => st.phase === 'pick', act: () => pick(g, st, k) }));
    g.item({ x: 6.6, z: 0.1, r: 1.5, y: 1.9, icon: '💬', label: N('和兔子老闆說話', 'Talk to Mr. Rabbit'), on: () => st.phase !== 'shuffle', act: async () => {
      if (st.phase === 'wait') await shuffleRound(g, st);
      else await g.say('rab', st.found ? N('慢走喔，歡迎再來！', 'Come again soon!') : N('眼睛跟緊那個蒸籠，別眨眼喔！', 'Keep your eyes on that steamer. Don\'t blink!'));
    } });
  },
  async intro(g, st) {
    await g.say('n', N('市集好熱鬧，到處都香香的！', 'The market is busy, and everything smells delicious!'));
    await g.say('rab', N('哎呀呀，有一隻小熊貓把我一整籠包子都吃光了！', 'Oh my! A little panda ate a whole steamer of my buns!'));
    await g.say('rab', N('想帶他回家？先贏我的蒸籠遊戲吧！我把他藏進蒸籠裡，你要猜中他在哪一個，連贏三回！', 'Want to take him home? Win my steamer game first! I hide him under a steamer, you guess which one. Win three rounds!'));
    g.goal(N('站到蒸籠前面，看兔子老闆洗蒸籠', 'Stand in front of the steamers and watch Mr. Rabbit shuffle'), [3.7, 1.2, 1.2]);
    await g.wait(0.6); await shuffleRound(g, st);
  },
};
const steamerAt = (st, slot) => st.slot.indexOf(slot);
function place(st, k, x, z) { st.base[k].pos.set(x, 0, z); st.lid[k].pos.set(x, 0.56, z); }
async function peek(g, st, k, show) {
  const lid = st.lid[k], x = lid.pos.x;
  if (show) { g.sfx('paper'); await g.anim(0.3, (t) => { lid.pos.y = 0.56 + t * 0.55; lid.wob.rotation.z = -t * 0.5; }, 'back'); }
  else { await g.anim(0.25, (t) => { lid.pos.y = 1.11 - t * 0.55; lid.wob.rotation.z = -0.5 + t * 0.5; }, 'in'); g.sfx('bump'); lid.pos.x = x; }
}
async function shuffleRound(g, st) {
  st.phase = 'shuffle'; g.goal(null); g.look(3.7); // keep the steamers in view while they are shuffled
  const q = st.qiu;
  await g.say('rab', [N('第一回，看清楚囉！', 'Round one, watch closely!'), N('第二回，要快一點囉！', 'Round two, a bit faster!'), N('最後一回，超級快！', 'Last round, super fast!')][st.round], { auto: 1.4 });
  await peek(g, st, q, true); st.base[q].setCut(A.steamer('peek')); g.sfx('squeak'); await g.wait(1.0); st.base[q].setCut(A.steamer('base')); await peek(g, st, q, false);
  const n = [5, 8, 12][st.round], dur = [0.55, 0.4, 0.28][st.round];
  for (let i = 0; i < n; i++) {
    const a = rnd(3), b = (a + 1 + rnd(2)) % 3, ka = steamerAt(st, a), kb = steamerAt(st, b), xa = SLOTS[a], xb = SLOTS[b];
    g.sfx('whoosh');
    await g.anim(dur, (t) => { place(st, ka, xa + (xb - xa) * t, SZ + Math.sin(t * Math.PI) * 0.55); place(st, kb, xb + (xa - xb) * t, SZ - Math.sin(t * Math.PI) * 0.35); }, 'inout');
    st.slot[ka] = b; st.slot[kb] = a;
  }
  st.phase = 'pick'; g.look(null);
  g.goal(N(`球球在哪一個蒸籠裡？（第 ${st.round + 1}/3 回）`, `Which steamer is Qiuqiu under? (round ${st.round + 1}/3)`), null);
}
async function pick(g, st, slot) {
  st.phase = 'reveal'; g.goal(null);
  const k = steamerAt(st, slot), q = st.qiu;
  await peek(g, st, k, true);
  if (k === q) {
    st.base[k].setCut(A.steamer('peek')); g.sfx('found'); g.pip(N('猜對了！', 'Right!'), SLOTS[slot], 1.6, SZ, 1.4);
    st.round++;
    if (st.round >= 3) { st.found = true; await g.wait(0.6); await winMarket(g, st, k, slot); return; }
    await g.wait(1.0); st.base[k].setCut(A.steamer('base')); await peek(g, st, k, false); await shuffleRound(g, st);
  } else {
    st.miss++; st.base[k].setCut(A.steamer('buns')); g.sfx('nope'); g.pip(N('只有包子！', 'Just buns!'), SLOTS[slot], 1.6, SZ, 1.4);
    await g.wait(0.7); await peek(g, st, q, true); st.base[q].setCut(A.steamer('peek')); await g.wait(1.0);
    st.base[k].setCut(A.steamer('base')); st.base[q].setCut(A.steamer('base')); await Promise.all([peek(g, st, k, false), peek(g, st, q, false)]);
    await g.say('rab', N('嘿嘿，猜錯了！這一回再來一次。', 'Hee hee, wrong! Let\'s play this round again.'), { auto: 1.6 });
    await shuffleRound(g, st);
  }
}
async function winMarket(g, st, k, slot) {
  st.base[k].setCut(A.steamer('base'));
  await g.found(4, SLOTS[slot], SZ + 0.6, { from: 0.6 });
  await g.say('b4', N('嗝！包子好好吃～你眼睛好利喔！', 'Burp! Yummy buns! You have sharp eyes!'));
  await g.say('rab', N('哈哈，連贏三回，我服了你！', 'Ha ha, three in a row. You beat me!'));
  if (st.miss === 0) { await g.star(SLOTS[slot], SZ + 1.0, 0.9); g.pip(N('一次都沒猜錯！', 'Not one wrong guess!'), SLOTS[slot], 2.2, SZ + 1.0, 1.8); }
  await g.say('rab', N('這些包子送給你們，帶回家吃吧！', 'Take some buns home with you!'));
  await g.say('n', N('五個寶寶都找到了！快帶他們回家吧！', 'All five babies are found! Time to take them home!'));
  g.done(N('走到右下角的箭頭，帶寶寶們回家', 'Walk to the arrow in the corner to take the babies home'));
}

// ================================================================ 6. home again
const back = {
  id: 'back', title: N('回家囉', 'Home Again'), music: 'home', seed: 11, start: [8.4, 2.0], exit: [9.2, 2.9],
  light: { sky: '#ffd0a8', ground: '#7a4a40', hemi: 0.95, sun: '#ffb070', sunI: 1.75, sunPos: [10, 10, 8], exp: 1.05, bg: '#26161a' },
  paint: (a, k) => paintHome(a, k, true),
  setup(g, st) {
    homePieces(g, st, true);
    st.rainbow = g.stand(A.rainbow(), 0, -3.45, { hidden: true });
    st.banner = g.stand(A.banner(g.lang === 'en' ? 'Thank you, Jasper!' : '謝謝你，Jasper！'), -0.4, -1.9, { hidden: true });
  },
  update(g, st) {
    if (!st.ended && !g.busy && g.near(-3.6, -0.75, 2.5)) { st.ended = true; g.run(() => finale(g, st)); }
  },
  async intro(g) {
    await g.say('n', N('太陽下山了。Jasper 帶著五個寶寶，回到了竹林的家。', 'The sun was setting as Jasper brought all five babies home to the bamboo forest.'));
    g.goal(N('帶寶寶們去找熊貓媽媽', 'Take the babies to Panda Mom'), [-3.6, -0.75, 2.6]);
  },
};
async function finale(g, st) {
  g.goal(null);
  await g.morph(st.mom, A.pandaMom('happy'));
  await g.say('mom', N('我的寶寶！你們都回來了！', 'My babies! You\'re all home!'));
  const spots = [[-5.1, 0.1], [-4.4, 0.45], [-3.6, 0.6], [-2.8, 0.45], [-2.1, 0.1]];
  await Promise.all(g.followers.map((f, k) => { f.free = true; const x0 = f.x, z0 = f.z, [tx, tz] = spots[k % 5]; f.face = tx > x0 ? 1 : -1; return g.anim(1.0, (t) => { f.x = x0 + (tx - x0) * t; f.z = z0 + (tz - z0) * t; f.piece.hinge.position.set(f.x, 0.012, f.z); f.piece.flip(f.face < 0); f.piece.wob.position.y = Math.abs(Math.sin(t * 14 + k)) * 0.15; }, 'inout', k * 0.08); }));
  g.followers.forEach((f) => { f.piece.flip(f.x > -3.6); f.piece.wob.position.y = 0; });
  g.sfx('squeak'); g.burst(-3.6, 1.6, -0.3, 'heart', 14);
  await Promise.all(g.followers.map((f, k) => g.wait(k * 0.1).then(() => g.hop(f.piece, 0.5, 0.4))));
  await g.say('b0', N('媽媽！我們好想你！', 'Mommy! We missed you!'));
  await g.say('mom', N('謝謝你，Jasper。你是最棒的小英雄！', 'Thank you, Jasper. You are the best little hero!'));
  g.cheer(true); g.sfx('cheer'); g.camOverview(true);
  g.raise(st.rainbow, 1, 1.2); await g.wait(0.3); g.raise(st.banner, 1, 0.9);
  for (let i = 0; i < 4; i++) { g.burst(-8 + i * 5, 2.5, -1 + (i % 2), 'conf', 30); await g.wait(0.25); }
  await g.say('jasper', N('耶——！', 'Hooray!'));
  g.followers.forEach((f, k) => g.wait(k * 0.12).then(() => g.hop(f.piece, 0.45, 0.4)));
  await g.say('n', N('從那天起，熊貓一家每個星期都請 Jasper 來家裡吃竹筍包子。', 'And from that day on, the panda family invited Jasper over every week for bamboo-shoot buns.'));
  await g.say('n', N('全劇終', 'The End'));
  g.end();
}

export const SPREADS = [home, meadow, night, snow, market, back];

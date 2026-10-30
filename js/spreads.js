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

// ================================================================ 1. the bamboo home
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
  s(A.bush(1), -1.6, -1.6, { solid: 0.55 });
  st.bush = s(A.bush(0), 6.9, 0.8, { solid: 0.55 });
  s(A.rock(0), 1.2, 2.6, { solid: 0.45 }); s(A.rock(0), 8.6, -0.3, { scale: 0.7, solid: 0.3 });
  g.flat(A.lily(), 3.1, -1.2, { scale: 0.6, face: 0.3 }); g.solid({ c: true, x: 3.7, z: -1.3, r: 1.45 });
  st.mom = s(A.pandaMom('sad'), -3.6, -0.75, { solid: 0.65 }); g.who('mom', st.mom, MOM, 1.0);
}
const home = {
  id: 'home', title: N('竹林的家', 'The Bamboo Home'), music: 'day', seed: 11, start: [-1.2, 1.6], exit: [9.1, 2.8],
  paint: (a, k) => paintHome(a, k, false),
  setup(g, st) {
    homePieces(g, st, false);
    st.pile = g.flap(A.leafPile(), -7.6, 1.45, { layer: 2 });
    g.item({ x: -7.6, z: 2.1, r: 1.5, y: 0.5, icon: '🍂', label: N('掀開落葉堆', 'Lift the leaves'), once: true, act: async () => {
      g.goal(null); await g.liftFlap(st.pile, 1, 0.7);
      await g.found(0, -7.6, 2.35);
      await g.say('b0', N('嘻嘻，被你找到了！', 'Hee hee, you found me!'));
      await g.morph(st.mom, A.pandaMom('happy'));
      await g.say('mom', N('圓圓！太好了，謝謝你，Jasper！', 'Yuanyuan! Oh, thank you, Jasper!'));
      await g.say('b0', N('我看到大家往小河那邊跑了！', 'I saw the others run off toward the river!'));
      await g.morph(st.mom, A.pandaMom('sad'));
      await g.say('mom', N('還有四個寶寶……拜託你了！', 'Four more babies to find... please help them!'));
      g.done();
    } });
    g.item({ x: -3.6, z: -0.75, r: 1.7, y: 2.4, icon: '💬', label: N('和熊貓媽媽說話', 'Talk to Panda Mom'), act: async () => {
      if (st.done || g.save.babies.includes(0)) await g.say('mom', N('其他寶寶往小河那邊去了，要小心喔！', 'The others went toward the river. Be careful!'));
      else await g.say('mom', N('圓圓最喜歡躲在落葉堆裡了……就在我家旁邊！', 'Yuanyuan loves to hide in piles of leaves... right by my house!'));
    } });
    g.item({ x: 6.9, z: 0.8, r: 1.4, y: 0.9, icon: '🌿', label: N('搖一搖草叢', 'Shake the bush'), once: true, act: async () => { g.sfx('paper'); await g.wobble(st.bush, 0.22, 0.7); await g.star(6.9, 1.3); } });
  },
  async intro(g) {
    g.goal(null);
    await g.say('n', N('在竹林的最深處，住著熊貓媽媽和她的五個熊貓寶寶。', 'Deep in the bamboo forest lived Panda Mom and her five panda babies.'));
    await g.say('n', N('今天早上，寶寶們在玩捉迷藏，玩著玩著……全部都不見了！', 'This morning the babies played hide-and-seek... and then they were all gone!'));
    await g.say('mom', N('Jasper！我的寶寶都不見了，你可以幫我找找嗎？', 'Jasper! My babies are lost. Can you help me find them?'));
    await g.say('jasper', N('交給我吧，熊貓媽媽！', 'Leave it to me, Panda Mom!'));
    await g.say('mom', N('他們是圓圓、豆豆、毛毛、糖糖和球球。圓圓最喜歡躲在落葉堆裡了……', 'They are Yuanyuan, Doudou, Maomao, Tangtang and Qiuqiu. Yuanyuan loves to hide in piles of leaves...'));
    g.goal(N('掀開落葉堆看看（走過去按空白鍵，或直接點它）', 'Look under the pile of leaves (walk up and press Space, or tap it)'), [-7.6, 2.1, 1.2]);
  },
};

// ================================================================ 2. the flower meadow and the river
const RIVER = [[3.7, -3.7], [4.25, -1.8], [3.8, 0], [4.25, 1.8], [3.9, 3.7]];
const PATH1 = [[-9.9, 2.3], [-6.5, 1.6], [-3, 1.9], [0, 1.2], [2.8, 1.0]], PATH1b = [[5.2, 1.0], [6.4, 1.8], [8, 1.6], [9.9, 2.4]];
const TUL = [[5.9, -1.4, '#ff6b8a'], [7.4, -0.6, '#ffd34d'], [8.9, -1.5, '#b98cff']];
const meadow = {
  id: 'meadow', title: N('花花草原', 'The Flower Meadow'), music: 'meadow', seed: 23, start: [-8.6, 2.2], exit: [9.2, 2.9],
  light: { sunI: 2.0, exp: 1.08 },
  paint(a, k) {
    k.fill('#c9eba0'); k.blobs(50, ['#b0e080', '#e4f6b8', '#a0d878', '#f6f2b0'], 0.35, 0.8, 2.6);
    k.band(RIVER, 1.95, '#8fd0f0', '#cfe8a8', 1); k.band(RIVER, 1.75, '#7cc3ec', '#5aa6d6'); waves(a, k, RIVER);
    k.band(PATH1, 0.85, '#f3dfb3', '#e5c990'); k.band(PATH1b, 0.85, '#f3dfb3', '#e5c990');
    grass(k, (x, z) => nearLine(PATH1, x, z, 0.6) || nearLine(PATH1b, x, z, 0.6) || nearLine(RIVER, x, z, 1.2), '#62a848', ['#ff8fb1', '#ffffff', '#ffd34d', '#b98cff', '#ff9a3d'], 1.5);
  },
  setup(g, st) {
    const s = g.stand;
    s(A.cloud(0), -6.0, -3.35, { scale: 0.85 }); s(A.cloud(0), 1.4, -3.4, { scale: 0.7 }); s(A.sun(), -2.6, -3.35, { scale: 0.85 });
    s(A.tree(1), -8.6, -2.5, { solid: 0.45 }); s(A.tree(0), -4.4, -2.85, { scale: 0.9, solid: 0.4 }); s(A.tree(1), 6.7, -2.9, { scale: 0.85, solid: 0.4 });
    s(A.bush(1), -1.3, -2.2, { solid: 0.5 }); s(A.bush(0), 2.2, -2.6, { scale: 0.8, solid: 0.4 }); s(A.bush(2), 9.2, 0.4, { scale: 0.8, solid: 0.4 });
    s(A.tulip('#ff9a3d', true), -6.3, -0.6, { scale: 0.6 }); s(A.tulip('#ff8fb1', true), -5.6, -0.2, { scale: 0.5 }); s(A.tulip('#b98cff', true), -2.4, -0.4, { scale: 0.55 });
    st.rock = s(A.rock(0), -6.4, 1.0, { solid: 0.45 });
    g.solid({ x0: 3.05, z0: -3.6, x1: 4.95, z1: 3.6, on: () => true });
    g.walk({ x0: 2.6, z0: 0.45, x1: 5.5, z1: 1.55, on: () => st.bridge });
    st.plank = s(A.plank(), 2.85, 1.0, { face: -Math.PI / 2, fixed: true, rise: 0.86, delay: 0.2 });
    st.tab = g.flat(A.pullTab(g.lang === 'en' ? 'PULL' : '拉'), 2.0, 3.45, { layer: 3 });
    g.flat(A.lily(), 4.05, 2.75, { scale: 0.85 });
    st.frog = s(A.frog(), 4.05, 2.8, { delay: 0.3 }); g.who('frog', st.frog, N('青蛙', 'Frog'), 0.8);
    st.tul = TUL.map(([x, z, c]) => s(A.tulip(c, false), x, z, { solid: 0.35 }));
    st.wheel = g.flat(A.wheel(), 7.4, 2.7, { layer: 2, scale: 0.85 }); st.turns = 0; st.w0 = 0;
    g.item({ x: 4.05, z: 2.7, r: 1.7, y: 1.1, icon: '💬', label: N('和青蛙說話', 'Talk to the frog'), act: async () => {
      if (!st.bridge) { await g.say('frog', N('呱！要過河嗎？拉一拉書邊那張黃色的紙片吧！', 'Ribbit! Want to cross? Pull the yellow paper tab at the edge of the book!')); g.goal(N('拉一拉書邊的黃色紙片', 'Pull the yellow paper tab'), [2.0, 3.2, 0.8]); }
      else if (st.turns < 3) await g.say('frog', N('呱呱！我聽到花朵裡有人在打呼……轉一轉那個圓圓的轉盤吧！', 'Ribbit! I heard someone snoring inside a flower... turn the round wheel!'));
      else await g.say('frog', N('呱～祝你們一路順風！', 'Ribbit! Have a good trip!'));
    } });
    g.item({ x: 2.0, z: 3.1, r: 1.25, y: 0.4, icon: '👉', label: N('拉紙片', 'Pull the tab'), once: true, act: async () => {
      g.goal(null); g.sfx('tab'); await g.anim(0.5, (t) => { st.tab.pos.z = 3.45 + t * 0.55; }, 'out');
      g.sfx('rise'); await g.raise(st.plank, 0, 0.9, 'out'); g.sfx('bump'); g.burst(4, 0.2, 1, 'conf', 16); await g.wobble(st.plank, 0.04, 0.3);
      st.bridge = true;
      await g.say('n', N('啪！一座紙做的小橋放下來了！', 'Flap! A little paper bridge folds down across the river!'));
      await g.say('frog', N('呱呱！我剛剛聽到花朵裡有人在打呼……轉一轉那個圓圓的轉盤吧！', 'Ribbit! I just heard someone snoring inside a flower... turn the round wheel!'));
      g.goal(N('過橋，轉一轉花朵轉盤', 'Cross the bridge and turn the flower wheel'), [7.4, 2.7, 0.9]);
    } });
    g.item({ x: 7.4, z: 2.6, r: 1.45, y: 0.4, icon: '🔄', label: N('轉一轉轉盤', 'Turn the wheel'), on: () => st.bridge && st.turns < 3, act: async () => {
      const n = st.turns++; g.goal(null); g.sfx('wheel');
      await g.anim(0.55, (t) => { st.wheel.face = st.w0 - t * Math.PI / 2; st.wheel.apply(); }, 'back'); st.w0 -= Math.PI / 2;
      const [x, z, c] = TUL[n];
      await g.morph(st.tul[n], A.tulip(c, true, ['bee', 'bfly', null][n])); g.sfx('pop');
      if (n === 0) { g.burst(x, 1.8, z, 'glow', 6); await g.say('n', N('花開了！裡面是一隻小蜜蜂。嗡嗡～不是寶寶。', 'A flower opens! Just a little bee. Bzzz... not a baby.')); g.goal(N('再轉一次轉盤', 'Turn the wheel again'), [7.4, 2.7, 0.9]); }
      if (n === 1) { g.burst(x, 1.8, z, 'glow', 6); await g.say('n', N('是一隻紫色的蝴蝶！寶寶到底在哪裡呢？', 'A purple butterfly! Where can the baby be?')); g.goal(N('再轉一次轉盤', 'Turn the wheel again'), [7.4, 2.7, 0.9]); }
      if (n === 2) {
        await g.found(1, x, z + 0.5, { from: 1.3 });
        await g.say('b1', N('哈——啾！我在花裡睡著了……', 'Ah-choo! I fell asleep inside the flower...'));
        await g.say('b1', N('毛毛跑進森林裡了，可是他很怕黑耶！', 'Maomao ran into the forest, but he is scared of the dark!'));
        g.done();
      }
    } });
    g.item({ x: -6.4, z: 1.0, r: 1.3, y: 0.6, icon: '🪨', label: N('翻翻石頭', 'Tip the rock'), once: true, act: async () => { g.sfx('paper'); await g.raise(st.rock, 0.35, 0.5, 'out'); await g.star(-6.4, 1.5); } });
  },
  async intro(g) {
    await g.say('n', N('Jasper 和圓圓來到了開滿花的草原。', 'Jasper and Yuanyuan came to a meadow full of flowers.'));
    await g.say('jasper', N('咦？河上沒有橋，過不去耶……', 'Huh? There is no bridge over the river...'));
    g.goal(N('去問問河邊的青蛙', 'Ask the frog by the river'), [4.05, 2.8, 1.3]);
  },
};

// ================================================================ 3. the moonlit forest
const PATH2 = [[-9.9, 1.6], [-7, 1.2], [-4, 1.8], [-1, 1.1], [2, 1.5], [5, 0.9], [7, 1.6], [9.9, 2.3]];
const FLIES = [[-7.2, 2.2], [0.6, -0.9], [4.7, 2.5]];
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
    const gm = [[0.4, -2.1], [-6.6, 0.4], [8.7, 0.9]]; for (const [x, z] of gm) { s(A.mushroom(true), x, z, { scale: 0.6, solid: 0.3 }); const gl = g.glow(x, 0.6, z + 0.05, 1.6); gl.userData.pulse = 2 + Math.random(); }
    st.gmush = s(A.mushroom(true), 3.6, 2.3, { scale: 0.65, solid: 0.3 }); g.glow(3.6, 0.6, 2.35, 1.6).userData.pulse = 2.5;
    g.lamps[1].position.set(-2.6, 1.6, -0.6); g.lamps[1].color.set('#9fe6ff'); g.lamps[1].intensity = 2.5;
    s(A.rock(0), -4.0, -0.7, { solid: 0.45 }); st.owl = s(A.owl(), -4.0, -0.68, { y: 0.5, delay: 0.25 }); g.who('owl', st.owl, N('貓頭鷹', 'Owl'), 0.75);
    st.log = s(A.log(false, false), 7.3, -1.4, { solid: 1.15, sx: 7.5 });
    st.flies = FLIES.map(([x, z]) => ({ x, z, got: false, s: g.glow(x, 1.0, z, 0.7) })); st.count = 0;
    g.item({ x: -4.0, z: -0.7, r: 1.6, y: 1.8, icon: '💬', label: N('和貓頭鷹說話', 'Talk to the owl'), act: async () => {
      if (st.count < 3) await g.say('owl', N(`咕咕……還差 ${3 - st.count} 隻螢火蟲喔。`, `Hoo hoo... ${3 - st.count} more fireflies to go.`));
      else await g.say('owl', N('咕咕……那根大木頭好亮呢。', 'Hoo hoo... that big log is glowing.'));
    } });
    g.item({ x: 6.4, z: -0.8, r: 1.5, y: 1.0, icon: '🪵', label: N('看看木頭裡面', 'Look inside the log'), on: () => st.lit, once: true, act: async () => {
      g.goal(null); await g.morph(st.log, A.log(true, false));
      await g.found(2, 6.3, -0.4);
      await g.say('b2', N('嗚……謝謝你們，我好怕黑喔。', 'Sniff... thank you. I was so scared of the dark.'));
      await g.say('jasper', N('別怕，我們一起走！', 'Don\'t be scared, we\'ll go together!'));
      await g.say('b2', N('糖糖最喜歡雪了，她一定跑去雪山了！', 'Tangtang loves snow. She must have gone up the snowy mountain!'));
      g.done();
    } });
    g.item({ x: 3.6, z: 2.3, r: 1.3, y: 0.8, icon: '🍄', label: N('摸一摸發光的香菇', 'Touch the glowing mushroom'), once: true, act: async () => { g.sfx('sparkle'); await g.hop(st.gmush, 0.35, 0.35); await g.star(3.6, 2.7); } });
  },
  update(g, st, dt, time) {
    st.flies.forEach((f, k) => {
      if (st.toLog) return;
      if (!f.got) { f.s.position.set(f.x + Math.sin(time * 1.3 + k) * 0.3, 1.0 + Math.sin(time * 2.1 + k * 2) * 0.25, f.z + Math.cos(time * 1.1 + k) * 0.2); f.s.material.opacity = 0.7 + Math.sin(time * 7 + k) * 0.3;
        if (!g.busy && g.near(f.x, f.z, 0.95)) { f.got = true; st.count++; g.sfx('sparkle'); g.pip(`✨ ${st.count} / 3`, f.x, 1.6, f.z, 1.4);
          if (st.count < 3) g.goal(N(`找到三隻螢火蟲（${st.count}/3）`, `Find three fireflies (${st.count}/3)`), nextFly(st));
          else g.run(() => fliesToLog(g, st)); } }
      else { const a = time * 2.6 + (k * Math.PI * 2) / 3; f.s.position.set(g.J.x + Math.cos(a) * 0.7, 1.3 + Math.sin(time * 4 + k) * 0.15, g.J.z + Math.sin(a) * 0.4); }
    });
  },
  async intro(g, st) {
    await g.say('n', N('天黑了，森林裡好安靜……', 'Night fell, and the forest grew very quiet...'));
    await g.say('jasper', N('毛毛——你在哪裡？', 'Maomao! Where are you?'));
    await g.say('owl', N('咕咕……毛毛很怕黑，躲起來了。', 'Hoo hoo... Maomao is scared of the dark. He is hiding.'));
    await g.say('owl', N('去找三隻螢火蟲吧，牠們會幫你照亮！', 'Find three fireflies. They will light the way for you!'));
    g.goal(N('找到三隻螢火蟲（0/3）', 'Find three fireflies (0/3)'), nextFly(st));
  },
};
function nextFly(st) { return () => { const f = st.flies.find((q) => !q.got); return f ? [f.x, f.z, 1.9] : [6.4, -0.8, 1.6]; }; }
async function fliesToLog(g, st) {
  g.goal(null); st.toLog = true;
  await g.say('n', N('三隻螢火蟲一起飛向了大木頭……', 'The three fireflies flew off together toward the big log...'));
  const from = st.flies.map((f) => f.s.position.clone());
  await g.anim(1.4, (t) => st.flies.forEach((f, k) => { const tx = 6.4 + Math.cos(k * 2.1) * 0.35, ty = 0.75 + Math.sin(k * 2.1) * 0.25, tz = -1.25; f.s.position.set(from[k].x + (tx - from[k].x) * t, from[k].y + (ty - from[k].y) * t + Math.sin(t * Math.PI) * 1.2, from[k].z + (tz - from[k].z) * t); }), 'inout');
  g.lamps[3].position.set(6.5, 1.0, -0.6); g.lamps[3].color.set('#ffd27a');
  g.anim(0.8, (t) => { g.lamps[3].intensity = t * 4; }, 'out');
  await g.morph(st.log, A.log(true, true)); st.lit = true; g.sfx('sparkle');
  await g.say('n', N('木頭裡亮起來了，好像有一雙小眼睛在看著你……', 'The log lights up, and two little eyes peek out at you...'));
  g.goal(N('看看大木頭裡面', 'Look inside the big log'), [6.4, -0.8, 1.6]);
}

// ================================================================ 4. the snowy mountain
const ICE = { x: -2.9, z: 1.35, rx: 2.2, rz: 0.95 };
const SNOWMEN = [[2.9, -0.9, '#e8473c'], [5.6, 0.5, '#4caf6a'], [8.1, -1.1, '#4a90e2']];
const snow = {
  id: 'snow', title: N('雪山', 'The Snowy Mountain'), music: 'snow', seed: 41, start: [-8.8, 2.3], exit: [9.2, 2.9],
  light: { sky: '#eaf4ff', ground: '#9fb0c8', hemi: 1.05, sun: '#ffffff', sunI: 1.7, exp: 1.0, bg: '#232a38' },
  ice: (x, z) => ((x - ICE.x) / ICE.rx) ** 2 + ((z - ICE.z) / ICE.rz) ** 2 < 1,
  paint(a, k) {
    k.fill('#eef5fb'); k.blobs(46, ['#dbe8f6', '#ffffff', '#cfe0f2'], 0.5, 0.8, 2.6);
    k.ellipse(ICE.x, ICE.z, ICE.rx + 0.1, ICE.rz + 0.08, '#d8eef9', 1); k.ellipse(ICE.x, ICE.z, ICE.rx, ICE.rz, '#bfe4f7', 1, '#9fd0ee');
    a.save(); a.strokeStyle = 'rgba(255,255,255,.9)'; a.lineWidth = 6; a.lineCap = 'round'; for (const [x, z] of [[-4, 1.0], [-2.6, 1.5], [-1.6, 1.0]]) { a.beginPath(); a.moveTo((x + 10) * 102.4, (z + 3.5) * 102.4); a.lineTo((x + 10.5) * 102.4, (z + 3.3) * 102.4); a.stroke(); } a.restore();
    const steps = []; for (let i = 0; i < 16; i++) { const x = -9 + i * 1.1, z = 2.5 + Math.sin(i * 0.8) * 0.4; steps.push([x, z + (i % 2 ? 0.12 : -0.12)]); } k.dots(steps, '#b7cbe0', 7, 0.6);
    k.tufts(40, '#a8c4d8', undefined, (x, z) => snow.ice(x, z));
  },
  setup(g, st) {
    const s = g.stand;
    s(A.mountain(), -4.6, -3.4); s(A.mountain(), 5.3, -3.42, { scale: 0.85, delay: 0.05 }); s(A.cloud(0), 0.6, -3.2, { scale: 0.7 });
    for (const [x, z, sc] of [[-9.2, -2.2, 1], [-0.9, -2.5, 0.85], [1.4, -2.9, 0.7], [9.3, -2.0, 0.95], [-5.0, 2.6, 0.6]]) s(A.pine(true), x, z, { scale: sc, solid: 0.35 * sc + 0.05 });
    st.igloo = s(A.igloo(), -7.3, -1.5, { solid: 1.05, sz: -1.6 });
    st.peng = s(A.penguin(), -5.0, -0.2, { solid: 0.4 }); g.who('peng', st.peng, N('企鵝', 'Penguin'), 1.25);
    st.right = Math.floor(Math.random() * 3); st.sn = 2;
    st.men = SNOWMEN.map(([x, z, c]) => s(A.snowman('whole', c), x, z, { solid: 0.5 }));
    SNOWMEN.forEach(([x, z], k) => g.item({ x, z, r: 1.5, y: 1.6, icon: '⛄', label: N('拍拍雪人', 'Pat the snowman'), on: () => !st.found && !st.tried?.[k], act: async () => {
      const p = st.men[k];
      if (k !== st.right) { (st.tried ||= {})[k] = true; g.sfx('nope'); await g.wobble(p, 0.12, 0.5); g.pip(N('只是普通的雪人', 'Just an ordinary snowman'), x, 2.0, z, 1.6); return; }
      st.found = true; g.goal(null); g.sfx('poof'); g.burst(x, 1.0, z, 'snow', 40);
      await g.morph(p, A.snowman('pile'));
      await g.found(3, x, z + 0.55);
      await g.say('b3', N('哈啾！好冷喔……謝謝你，Jasper！', 'Ah-choo! It\'s so cold... thank you, Jasper!'));
      await g.say('b3', N('球球肚子餓了，他說要去市集找包子吃！', 'Qiuqiu was hungry. He said he was going to the market for buns!'));
      g.done();
    } }));
    g.item({ x: -5.0, z: -0.2, r: 1.5, y: 1.4, icon: '💬', label: N('和企鵝說話', 'Talk to the penguin'), act: async () => { await g.say('peng', st.found ? N('找到了！太好了！', 'You found her! Hooray!') : N('仔細聽，有一個雪人一直在打噴嚏！', 'Listen closely: one of the snowmen keeps sneezing!')); } });
    g.item({ x: -6.9, z: -1.0, r: 1.4, y: 0.8, icon: '🚪', label: N('敲敲冰屋的門', 'Knock on the igloo'), once: true, act: async () => { g.sfx('bump'); await g.wobble(st.igloo, 0.05, 0.3); g.sfx('bump'); await g.wobble(st.igloo, 0.05, 0.3); await g.star(-6.6, -0.6); } });
  },
  update(g, st, dt) {
    if (st.found) return;
    if ((st.sn -= dt) < 0) { st.sn = 3.2 + Math.random() * 2; if (g.busy) return; const [x, z] = SNOWMEN[st.right]; g.sfx('achoo'); g.wobble(st.men[st.right], 0.14, 0.6); g.pip(N('哈——啾！', 'Ah-CHOO!'), x, 2.0, z, 1.4); g.burst(x, 1.2, z + 0.1, 'snow', 8); }
  },
  async intro(g) {
    await g.say('n', N('哇，好冷！雪山上到處都是雪人。', 'Brrr! Up on the snowy mountain there are snowmen everywhere.'));
    await g.say('peng', N('嘿，Jasper！那邊有一個雪人一直在打噴嚏耶！', 'Hey, Jasper! One of those snowmen keeps sneezing!'));
    await g.say('peng', N('冰上很滑，小心喔！', 'The ice is slippery, be careful!'));
    g.goal(N('找出會打噴嚏的雪人', 'Find the snowman who sneezes'), [5.6, 0.5, 2.2]);
  },
};

// ================================================================ 5. the market
const STEAM = [[2.5, 0.35], [3.7, 0.35], [4.9, 0.35]];
const market = {
  id: 'market', title: N('熱鬧的市集', 'The Busy Market'), music: 'market', seed: 53, start: [-8.8, 2.2], exit: [9.2, 2.9],
  light: { sky: '#fff0dc', ground: '#9a7058', sun: '#ffe2b8', sunI: 1.85 },
  paint(a, k) {
    k.fill('#efd9bb'); k.blobs(30, ['#e8cba6', '#f6e6cc'], 0.4, 0.8, 2.4);
    a.save(); for (let i = 0; i < 520; i++) { const x = -10 + k.r() * 20, z = -3.5 + k.r() * 7, X = (x + 10) * 102.4, Y = (z + 3.5) * 102.4; a.beginPath(); a.ellipse(X, Y, 16 + k.r() * 10, 10 + k.r() * 6, k.r(), 0, 7); a.fillStyle = ['#e6c9a4', '#dcbd96', '#f0dcc0'][i % 3]; a.fill(); a.lineWidth = 2; a.strokeStyle = 'rgba(150,110,80,.35)'; a.stroke(); } a.restore();
    k.band([[-9.9, 2.3], [-5, 1.8], [0, 2.2], [5, 1.9], [9.9, 2.5]], 1.1, 'rgba(255,240,210,.7)');
    k.dots([[-3, 0.5], [-2.2, 0.9], [-1.4, 0.6], [0.6, 0.8], [1.4, 0.5]], '#e8c38a', 6, 0.8);
  },
  setup(g, st) {
    const s = g.stand;
    s(A.townhouse(0), -8.3, -2.95, { solid: 1.0 }); s(A.townhouse(1), -5.5, -3.15, { scale: 0.95 }); s(A.townhouse(2), 5.8, -3.15, { scale: 0.95 }); s(A.townhouse(0), 8.6, -2.95, { solid: 1.0 });
    s(A.lanterns(), 0, -2.3, { delay: 0.2 }); g.solid({ c: true, x: -3.45, z: -2.3, r: 0.2 }); g.solid({ c: true, x: 3.45, z: -2.3, r: 0.2 });
    st.fruit = s(A.stall('fruit'), -4.2, -1.3); g.solid({ x0: -5.6, z0: -1.6, x1: -2.8, z1: -1.05 });
    s(A.stall('bun'), 3.7, -1.2); g.solid({ x0: 2.2, z0: -1.5, x1: 5.2, z1: -0.95 });
    st.right = Math.floor(Math.random() * 3); st.wig = 2;
    st.base = STEAM.map(([x, z]) => s(A.steamer('base'), x, z, { solid: 0.42 }));
    st.lid = STEAM.map(([x, z]) => s(A.steamer('lid'), x, z, { y: 0.56, delay: 0.1 }));
    st.rab = s(A.rabbit(), 6.5, 0.0, { solid: 0.45 }); g.who('rab', st.rab, N('兔子老闆', 'Mr. Rabbit'), 1.2);
    s(A.sign(g.lang === 'en' ? 'BUNS' : '包子'), 1.3, 1.0, { scale: 0.8 });
    STEAM.forEach(([x, z], k) => g.item({ x, z, r: 1.15, y: 0.9, icon: '🥟', label: N('打開蒸籠', 'Open the steamer'), on: () => !st.found && !st.open?.[k], act: async () => {
      (st.open ||= {})[k] = true; const lid = st.lid[k];
      g.sfx('paper'); await g.anim(0.45, (t) => { lid.pos.y = 0.56 + t * 0.7; lid.pos.x = x + t * 0.5; lid.wob.rotation.z = -t * 0.7; }, 'back');
      if (k !== st.right) { g.burst(x, 0.9, z, 'snow', 8); await g.morph(st.base[k], A.steamer('buns')); g.pip(N('只有熱呼呼的包子', 'Only warm, fluffy buns'), x, 1.5, z, 1.6); return; }
      st.found = true; g.goal(null);
      await g.found(4, x, z + 0.5, { from: 0.6 });
      await g.say('b4', N('嗝！包子好好吃～', 'Burp! The buns are yummy!'));
      await g.say('rab', N('哈哈，原來偷吃包子的是小熊貓呀！', 'Ha ha! So the bun thief was a little panda!'));
      await g.say('rab', N('這些包子送給你們，帶回家吃吧！', 'Take some buns home with you!'));
      await g.say('n', N('五個寶寶都找到了！快帶他們回家吧！', 'All five babies are found! Time to take them home!'));
      g.done(N('走到右下角的箭頭，帶寶寶們回家', 'Walk to the arrow in the corner to take the babies home'));
    } }));
    g.item({ x: 6.5, z: 0.0, r: 1.5, y: 1.9, icon: '💬', label: N('和兔子老闆說話', 'Talk to Mr. Rabbit'), act: async () => { await g.say('rab', st.found ? N('慢走喔，歡迎再來！', 'Come again soon!') : N('仔細看，有一個蒸籠在動來動去……', 'Look closely: one of the steamers is wiggling...')); } });
    g.item({ x: -4.2, z: -0.9, r: 1.5, y: 1.4, icon: '🍎', label: N('看看水果攤', 'Look at the fruit stall'), once: true, act: async () => { g.sfx('paper'); await g.wobble(st.fruit, 0.05, 0.5); await g.star(-4.2, -0.6, 0.9); } });
  },
  update(g, st, dt) {
    if (st.found) return;
    if ((st.wig -= dt) < 0) { st.wig = 2.8 + Math.random() * 1.6; if (g.busy) return; const [x, z] = STEAM[st.right]; g.sfx('gurgle'); g.wobble(st.base[st.right], 0.1, 0.6); g.hop(st.lid[st.right], 0.15, 0.3); g.pip(N('咕嚕咕嚕', 'Munch munch'), x, 1.3, z, 1.3); }
  },
  async intro(g) {
    await g.say('n', N('市集好熱鬧，到處都香香的！', 'The market is busy, and everything smells delicious!'));
    await g.say('rab', N('哎呀呀，我的包子一直變少……', 'Oh dear, my buns keep disappearing...'));
    await g.say('rab', N('蒸籠裡好像有誰在偷吃！', 'Someone must be nibbling them inside a steamer!'));
    g.goal(N('打開會動的蒸籠', 'Open the steamer that wiggles'), [3.7, 0.35, 1.5]);
  },
};

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

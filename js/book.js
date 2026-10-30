// The book on the table: two boards, two stacks of pages, the printed pages, the leaf that turns, and the paper
// pieces that stand up out of the pages.
import * as THREE from '../lib/three.module.min.js';
import { paintCover, paintStack, paintWood } from './pages.js';

const texCache = new Map();
export function tex(canvas, key) {
  if (key && texCache.has(key)) return texCache.get(key);
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (key) texCache.set(key, t); return t;
}

// ---------------------------------------------------------------- a paper piece
// kind 'stand': hinged at its foot, rise 0 lies flat on the page (pointing away), 1 stands up
// kind 'flap': lies flat, hinged at its far edge; lift 0..1 swings it up and back over the hinge
// kind 'flat': lies flat on the page (tabs, wheels, planks), moved by hand
export class Piece {
  static glow = '#3a3530'; // a little light of its own, so the paper stays bright (dimmer at night)
  constructor(cut, { kind = 'stand', x = 0, z = 0, y = 0, face = 0, scale = 1, flip = false } = {}) {
    this.kind = kind; this.hinge = new THREE.Group(); this.hinge.rotation.order = 'YXZ';
    this.wob = new THREE.Group(); this.hinge.add(this.wob);
    this.geo = new THREE.PlaneGeometry(1, 1);
    this.front = new THREE.MeshStandardMaterial({ alphaTest: 0.5, side: THREE.FrontSide, roughness: 0.92, metalness: 0 });
    this.backM = new THREE.MeshStandardMaterial({ alphaTest: 0.5, side: THREE.BackSide, roughness: 0.95, metalness: 0 });
    this.depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mf = new THREE.Mesh(this.geo, this.front); this.mb = new THREE.Mesh(this.geo, this.backM);
    this.mf.castShadow = true; this.mf.customDepthMaterial = this.depth; this.mf.receiveShadow = true; this.mb.receiveShadow = true;
    this.body = new THREE.Group(); this.body.add(this.mf, this.mb); this.wob.add(this.body);
    this.rise = kind === 'stand' ? 0 : 1; this.lift = 0; this.scale = scale; this.flipped = flip; this.face = face;
    this.hinge.position.set(x, y, z); this.setCut(cut); this.apply();
  }
  setCut(cut) {
    this.cut = cut; const f = tex(cut.img, cut.key + ':f'), b = tex(cut.back, cut.key + ':b');
    this.front.map = f; this.front.emissiveMap = f; this.front.emissive.set(Piece.glow); this.backM.map = b; this.depth.map = f; this.front.needsUpdate = this.backM.needsUpdate = this.depth.needsUpdate = true;
    const s = this.scale; this.body.scale.set(cut.w * s * (this.flipped ? -1 : 1), cut.h * s, 1);
    // the foot of the art sits on the page (the rim hangs a hair below it)
    if (this.kind === 'stand') this.body.position.set(0, (cut.h / 2 - cut.b * 0.7) * s, 0);
    else if (this.kind === 'flap') this.body.position.set(0, -cut.h * s / 2, 0);
    else { this.body.position.set(0, 0, 0); }
  }
  flip(v) { if (v === this.flipped) return; this.flipped = v; this.setCut(this.cut); }
  get w() { return this.cut.w * this.scale; } get h() { return this.cut.h * this.scale; }
  apply() {
    const H = this.hinge;
    if (this.kind === 'stand') { H.rotation.set(-(1 - this.rise) * Math.PI / 2, this.face * (0.3 + 0.7 * this.rise), 0); }
    else if (this.kind === 'flap') { H.rotation.set(-Math.PI / 2 - this.lift * Math.PI * 0.82, this.face, 0); }
    else { H.rotation.set(-Math.PI / 2, 0, this.face); }
  }
  get pos() { return this.hinge.position; }
  dispose() { this.hinge.removeFromParent(); this.geo.dispose(); this.front.dispose(); this.backM.dispose(); this.depth.dispose(); }
}

// ---------------------------------------------------------------- the book
const PW = 10, PD = 7;
export class Book {
  constructor(scene) {
    this.scene = scene;
    const wood = tex(paintWood()); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(4, 3);
    const table = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.8 }));
    table.rotation.x = -Math.PI / 2; table.position.y = -0.64; table.receiveShadow = true; scene.add(table);
    const stackT = tex(paintStack()), stackM = new THREE.MeshStandardMaterial({ map: stackT, roughness: 0.95 });
    const boardM = new THREE.MeshStandardMaterial({ color: 0xc94f3b, roughness: 0.65 });
    this.pageL = new THREE.MeshStandardMaterial({ roughness: 0.95 }); this.pageR = new THREE.MeshStandardMaterial({ roughness: 0.95 });
    const half = (sgn, pageMat) => {
      const g = new THREE.Group();
      const board = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.35, 0.12, PD + 0.6), boardM); board.position.set(sgn * (PW + 0.35) / 2, -0.56, 0); board.receiveShadow = true;
      const stack = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.48, PD), [stackM, stackM, pageMat, stackM, stackM, stackM]); stack.position.set(sgn * PW / 2, -0.25, 0); stack.receiveShadow = true;
      const page = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), pageMat); page.rotation.x = -Math.PI / 2; page.position.set(sgn * PW / 2, 0.001, 0); page.receiveShadow = true;
      g.add(board, stack, page); return g;
    };
    this.right = half(1, this.pageR); this.left = half(-1, this.pageL); scene.add(this.right, this.left);
    // the spine, a rounded strip under the gutter
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, PD + 0.6, 16, 1, false, Math.PI, Math.PI), boardM); spine.rotation.x = Math.PI / 2; spine.position.set(0, -0.5, 0); scene.add(spine);
    // the front cover lives under the left board (it faces up once the left half is folded over)
    this.coverM = new THREE.MeshStandardMaterial({ roughness: 0.6 });
    const cover = new THREE.Mesh(new THREE.PlaneGeometry(PW + 0.35, PD + 0.6), this.coverM); cover.rotation.x = Math.PI / 2; cover.position.set(-(PW + 0.35) / 2, -0.625, 0); this.left.add(cover);
    this.setCover('zh');
    // the turning leaf
    this.leaf = new Leaf(); scene.add(this.leaf.group); this.leaf.group.visible = false;
    this.open = 1; this.setOpen(1);
  }
  setCover(lang) { const t = tex(paintCover(lang), 'cover' + lang); t.center.set(0.5, 0.5); t.rotation = Math.PI; this.coverM.map = t; this.coverM.needsUpdate = true; }
  setPages(L, R) { this.pageL.map = L; this.pageR.map = R; this.pageL.needsUpdate = this.pageR.needsUpdate = true; }
  // 0 = closed (the left half folded over onto the right), 1 = lying open
  setOpen(v) { this.open = v; this.left.rotation.z = -Math.PI * (1 - v); }
}

// a page that bends as it turns: the free edge leads, the spine end follows
class Leaf {
  constructor() {
    this.N = 28; const N = this.N, pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
    for (let i = 0; i <= N; i++) { uv.set([i / N, 1, i / N, 0], i * 4); if (i < N) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); } }
    this.geo = new THREE.BufferGeometry(); this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); this.geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); this.geo.setIndex(idx);
    this.fm = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, roughness: 0.95 }); this.bm = new THREE.MeshStandardMaterial({ side: THREE.BackSide, roughness: 0.95 });
    const f = new THREE.Mesh(this.geo, this.fm), b = new THREE.Mesh(this.geo, this.bm); f.castShadow = true; f.receiveShadow = b.receiveShadow = true;
    this.group = new THREE.Group(); this.group.add(f, b); this.set(0);
  }
  textures(front, back) {
    this.fm.map = front; const bt = back.clone(); bt.wrapS = THREE.RepeatWrapping; bt.repeat.x = -1; bt.offset.x = 1; bt.needsUpdate = true; this.bm.map = bt;
    this.fm.needsUpdate = this.bm.needsUpdate = true;
  }
  set(p) {
    const N = this.N, P = this.geo.attributes.position, th = p * Math.PI, curl = 1.0 * Math.sin(p * Math.PI), ds = PW / N;
    let x = 0, y = 0.012;
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      P.setXYZ(i * 2, x, y, -PD / 2); P.setXYZ(i * 2 + 1, x, y, PD / 2);
      const a = Math.min(Math.PI, th + curl * s * s * 1.4); x += Math.cos(a) * ds; y += Math.sin(a) * ds;
    }
    P.needsUpdate = true; this.geo.computeVertexNormals(); this.geo.computeBoundingSphere();
  }
}

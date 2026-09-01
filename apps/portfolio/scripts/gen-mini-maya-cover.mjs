// Generate the Mini Maya card cover: a wireframe of a cube after two rounds of
// Catmull-Clark, drawn from real subdivided geometry rather than decoration.
// It is a DIAGRAM, not a screenshot — deliberately flat-shaded wireframe so it
// cannot be mistaken for a capture of the Qt application.
// Pure stdlib: geometry here, PNG written by hand with zlib (same approach as
// the desktop-pet tray icon).
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 1320, H = 990;                    // 2x of the 660x495 card slot
const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const mul = (a, s) => [a[0]*s, a[1]*s, a[2]*s];
const ekey = (i, j) => (i < j ? `${i}_${j}` : `${j}_${i}`);

function cube() {
  const p = [[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],
             [-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];
  const f = [[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]];
  return { p, f };
}
function subdivide({ p, f }) {
  const fp = f.map((face) => mul(face.reduce((a, i) => add(a, p[i]), [0,0,0]), 1/face.length));
  const ef = new Map();
  f.forEach((face, fi) => face.forEach((vi, k) => {
    const vj = face[(k+1)%face.length], kk = ekey(vi, vj);
    if (!ef.has(kk)) ef.set(kk, { a: vi, b: vj, faces: [] });
    ef.get(kk).faces.push(fi);
  }));
  const ep = new Map();
  for (const [kk, e] of ef) ep.set(kk, mul(e.faces.reduce((a, fi) => add(a, fp[fi]), add(p[e.a], p[e.b])), 1/(2+e.faces.length)));
  const vF = p.map(() => []), vE = p.map(() => []);
  f.forEach((face, fi) => face.forEach((vi) => vF[vi].push(fi)));
  for (const [kk, e] of ef) { vE[e.a].push(kk); vE[e.b].push(kk); }
  const np = p.map((P, i) => {
    const n = vF[i].length;
    const F = mul(vF[i].reduce((a, fi) => add(a, fp[fi]), [0,0,0]), 1/n);
    const R = mul(vE[i].map((kk) => ef.get(kk)).reduce((a, e) => add(a, mul(add(p[e.a], p[e.b]), .5)), [0,0,0]), 1/vE[i].length);
    return mul(add(add(F, mul(R, 2)), mul(P, n-3)), 1/n);
  });
  const out = [...np];
  const fpi = fp.map((q) => (out.push(q), out.length-1));
  const epi = new Map();
  for (const [kk, q] of ep) { out.push(q); epi.set(kk, out.length-1); }
  const quads = [];
  f.forEach((face, fi) => face.forEach((vi, k) => {
    const prev = face[(k-1+face.length)%face.length], next = face[(k+1)%face.length];
    quads.push([vi, epi.get(ekey(vi, next)), fpi[fi], epi.get(ekey(prev, vi))]);
  }));
  return { p: out, f: quads };
}

// ── project + draw ──────────────────────────────────────────────────────────
const px = Buffer.alloc(W * H * 4);                     // transparent
const put = (x, y, a) => {
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = (y * W + x) * 4;
  const A = Math.min(255, Math.round(a * 255));
  if (A <= px[i+3]) return;                              // keep the strongest hit
  px[i] = 0x6f; px[i+1] = 0x85; px[i+2] = 0xc9; px[i+3] = A;   // cobalt, matches the site
};
// Xiaolin Wu-ish antialiased line
function line(x0, y0, x1, y1, w = 1) {
  const dx = x1-x0, dy = y1-y0, n = Math.ceil(Math.hypot(dx, dy) * 1.6) || 1;
  for (let t = 0; t <= n; t++) {
    const x = x0 + dx*t/n, y = y0 + dy*t/n;
    const ix = Math.floor(x), iy = Math.floor(y), fx = x-ix, fy = y-iy;
    for (let ox = -w; ox <= w; ox++) for (let oy = -w; oy <= w; oy++) {
      const d = Math.hypot(ox+0.5-fx-0.5, oy+0.5-fy-0.5);
      put(ix+ox, iy+oy, Math.max(0, 1 - d / (w + 0.35)));
    }
  }
}

// Three stages across the frame: cube, one subdivision, two. The progression IS
// the project and it reads instantly at card size.
// Each stage is AUTO-FITTED to its own slot: Catmull-Clark shrinks a mesh toward
// its centroid every round, so a shared scale would draw the cube enormous and
// the sphere tiny.
const stages = [cube(), subdivide(cube()), subdivide(subdivide(cube()))];
const ry = 0.62, rx = -0.42;
const project = (m) => m.p.map(([x, y, z]) => {
  let X = x*Math.cos(ry) - z*Math.sin(ry), Z = x*Math.sin(ry) + z*Math.cos(ry);
  let Y = y*Math.cos(rx) - Z*Math.sin(rx); Z = y*Math.sin(rx) + Z*Math.cos(rx);
  const persp = 2.6 / (2.6 - Z);
  return [X*persp, -Y*persp, Z];
});
const SLOT = W * 0.285;                       // target width per stage
stages.forEach((m, si) => {
  const flat = project(m);
  const xs = flat.map((v) => v[0]), ys = flat.map((v) => v[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  const k = SLOT / Math.max(w, h);            // uniform fit, no distortion
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const CX = W * (0.185 + si * 0.315), CY = H * 0.5;
  const proj = flat.map(([x, y, z]) => [CX + (x - cx) * k, CY + (y - cy) * k, z]);
  const edges = new Map();
  m.f.forEach((face) => face.forEach((vi, kk2) => {
    const vj = face[(kk2+1)%face.length], kk = ekey(vi, vj);
    if (!edges.has(kk)) edges.set(kk, [vi, vj]);
  }));
  // back-to-front so nearer edges win the alpha test
  [...edges.values()]
    .sort((p1, p2) => (proj[p1[0]][2]+proj[p1[1]][2]) - (proj[p2[0]][2]+proj[p2[1]][2]))
    .forEach(([i, j]) => line(proj[i][0], proj[i][1], proj[j][0], proj[j][1], si === 0 ? 2 : (si === 1 ? 2 : 1)));
});
const m = stages[2];

// ── PNG ─────────────────────────────────────────────────────────────────────
const crcT = Array.from({length:256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c>>>1) : c>>>1; return c>>>0; });
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c^x)&0xff] ^ (c>>>8); return (c^0xffffffff)>>>0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t,"ascii"), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); };
const raw = Buffer.alloc(H * (W*4 + 1));
for (let y = 0; y < H; y++) { raw[y*(W*4+1)] = 0; px.copy(raw, y*(W*4+1)+1, y*W*4, (y+1)*W*4); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4); ihdr[8]=8; ihdr[9]=6;
const png = Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), chunk("IHDR",ihdr), chunk("IDAT", deflateSync(raw,{level:9})), chunk("IEND", Buffer.alloc(0))]);
const out = "D:/GitHub/careeros/apps/portfolio/src/assets/work/mini-maya.png";
writeFileSync(out, png);
console.log(`${out}\n${W}x${H}, ${(png.length/1024).toFixed(0)} KB, ${m.p.length} vertices / ${m.f.length} faces after 2 subdivisions`);

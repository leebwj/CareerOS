// Generate the Capsule card cover: a gachapon capsule sealed, cracking open,
// and open with a memory floating out — the product's locked-until-reveal arc
// as real geometry. Same wireframe-diagram approach and drawing code as
// gen-mini-maya-cover.mjs; pure stdlib, PNG written by hand with zlib.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 1320, H = 990;                    // 2x of the 660x495 card slot
const ekey = (i, j) => (i < j ? `${i}_${j}` : `${j}_${i}`);

// uv hemisphere: rings from the rim toward the pole, cap closed with triangles
function hemisphere(sign, meridians = 12, rings = 4) {
  const p = [], rows = [];
  for (let r = 0; r < rings; r++) {
    const phi = (r / rings) * (Math.PI / 2);
    const rad = Math.cos(phi), y = sign * Math.sin(phi);
    const row = [];
    for (let m = 0; m < meridians; m++) {
      const th = (m / meridians) * 2 * Math.PI;
      row.push(p.push([rad * Math.cos(th), y, rad * Math.sin(th)]) - 1);
    }
    rows.push(row);
  }
  const pole = p.push([0, sign, 0]) - 1;
  const f = [];
  for (let r = 0; r < rings - 1; r++) for (let m = 0; m < meridians; m++) {
    const n = (m + 1) % meridians;
    f.push([rows[r][m], rows[r][n], rows[r + 1][n], rows[r + 1][m]]);
  }
  for (let m = 0; m < meridians; m++) {
    const n = (m + 1) % meridians;
    f.push([rows[rings - 1][m], rows[rings - 1][n], pole]);
  }
  return { p, f };
}
function cube() {
  const p = [[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],
             [-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];
  const f = [[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]];
  return { p, f };
}

const xform = ({ p, f }, fn) => ({ p: p.map(fn), f });
const rotY = (a) => ([x, y, z]) => [x*Math.cos(a) + z*Math.sin(a), y, -x*Math.sin(a) + z*Math.cos(a)];
const scaleTo = (s, [tx, ty, tz]) => ([x, y, z]) => [x*s + tx, y*s + ty, z*s + tz];
const rotX = (a) => ([x, y, z]) => [x, y*Math.cos(a) - z*Math.sin(a), y*Math.sin(a) + z*Math.cos(a)];
const merge = (...parts) => {
  const p = [], f = [];
  for (const m of parts) {
    const base = p.length;
    p.push(...m.p);
    f.push(...m.f.map((face) => face.map((i) => i + base)));
  }
  return { p, f };
};

const GAP = 0.05;
const bowl = xform(hemisphere(-1), ([x, y, z]) => [x, y - GAP, z]);
const lid = (tilt, [tx, ty, tz]) => xform(xform(hemisphere(1), rotX(tilt)), ([x, y, z]) => [x + tx, y + ty + GAP, z + tz]);
const memory = xform(xform(cube(), rotY(0.45)), scaleTo(0.46, [-0.1, 1.05, 0.05]));

const stages = [
  merge(bowl, lid(0, [0, 0, 0])),
  merge(bowl, lid(-0.22, [0, 0.4, 0])),
  merge(bowl, lid(-0.6, [0.95, 0.7, -0.1]), memory),
];

// ── project + draw ──────────────────────────────────────────────────────────
const px = Buffer.alloc(W * H * 4);                     // transparent
const put = (x, y, a) => {
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = (y * W + x) * 4;
  const A = Math.min(255, Math.round(a * 255));
  if (A <= px[i+3]) return;                              // keep the strongest hit
  px[i] = 0x6f; px[i+1] = 0x85; px[i+2] = 0xc9; px[i+3] = A;   // cobalt, matches the site
};
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

const ry = 0.62, rx = -0.42;
const project = (m) => m.p.map(([x, y, z]) => {
  let X = x*Math.cos(ry) - z*Math.sin(ry), Z = x*Math.sin(ry) + z*Math.cos(ry);
  let Y = y*Math.cos(rx) - Z*Math.sin(rx); Z = y*Math.sin(rx) + Z*Math.cos(rx);
  const persp = 2.6 / (2.6 - Z);
  return [X*persp, -Y*persp, Z];
});
const SLOT = W * 0.285;
stages.forEach((m, si) => {
  const flat = project(m);
  const xs = flat.map((v) => v[0]), ys = flat.map((v) => v[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  const k = SLOT / Math.max(w, h);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const CX = W * (0.185 + si * 0.315), CY = H * 0.5;
  const proj = flat.map(([x, y, z]) => [CX + (x - cx) * k, CY + (y - cy) * k, z]);
  const edges = new Map();
  m.f.forEach((face) => face.forEach((vi, kk2) => {
    const vj = face[(kk2+1)%face.length], kk = ekey(vi, vj);
    if (!edges.has(kk)) edges.set(kk, [vi, vj]);
  }));
  [...edges.values()]
    .sort((p1, p2) => (proj[p1[0]][2]+proj[p1[1]][2]) - (proj[p2[0]][2]+proj[p2[1]][2]))
    .forEach(([i, j]) => line(proj[i][0], proj[i][1], proj[j][0], proj[j][1], 1));
});

// ── PNG ─────────────────────────────────────────────────────────────────────
const crcT = Array.from({length:256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c>>>1) : c>>>1; return c>>>0; });
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c^x)&0xff] ^ (c>>>8); return (c^0xffffffff)>>>0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t,"ascii"), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); };
const raw = Buffer.alloc(H * (W*4 + 1));
for (let y = 0; y < H; y++) { raw[y*(W*4+1)] = 0; px.copy(raw, y*(W*4+1)+1, y*W*4, (y+1)*W*4); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4); ihdr[8]=8; ihdr[9]=6;
const png = Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), chunk("IHDR",ihdr), chunk("IDAT", deflateSync(raw,{level:9})), chunk("IEND", Buffer.alloc(0))]);
const out = "D:/GitHub/careeros/apps/portfolio/src/assets/work/capsule.png";
writeFileSync(out, png);
console.log(`${out}\n${W}x${H}, ${(png.length/1024).toFixed(0)} KB`);

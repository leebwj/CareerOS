// Regression check for the hero/card shader noise (ShaderField.astro, CardShader.astro).
//
// Why this exists: on 2020 Intel MacBook Pros (Chrome + Safari both run WebGL
// through ANGLE→Metal with fast math on), `fract()` misbehaves for large or
// negative inputs (gpuweb#4144, Apple forums 747108). The original value-noise
// hash ran `fract()` on coordinates that grew without bound with `uTime`, and
// the blend weight `fract(p)` could disagree with the lattice `floor(p)`. When
// they disagree, `mix` extrapolates and every cell edge becomes a hard seam;
// five rotated octaves of seams read as "triangulated" noise.
//
// This script ports both the OLD and the NEW GLSL noise to JS with fp32
// emulation (Math.fround) and a pluggable `fract` so the Intel failure mode
// (fract as `x - trunc(x)`, plus a fast-math style precision loss) can be
// simulated on any machine. It then measures the largest jump between
// adjacent samples: continuous noise has tiny jumps; seams show as big ones.
//
//   node scripts/noise-robustness.mjs      → exits 1 if NEW noise is not robust

const f = Math.fround;

// ── the broken fract: what Intel's Metal compiler was observed to produce ──
// `x - float(int(x))` truncates toward zero → negative results for negative x,
// and the int conversion loses everything past 2^24 the way a fast-math
// reassociation of `fract(C) + x` does for large C.
const fractBuggy = (x) => f(x - Math.trunc(x));
const fractExact = (x) => f(x - Math.floor(x));

const mix = (a, b, t) => f(a + (b - a) * t);
const smooth = (x) => f(x * x * (3 - 2 * x));

// ───────────── OLD (fract-based "hash without sine") ─────────────
function oldNoiseFactory(fract) {
  const hash = (px, py) => {
    let x = fract(f(px * 123.34)), y = fract(f(py * 345.45));
    const d = f(x * f(x + 34.345) + y * f(y + 34.345));
    x = f(x + d); y = f(y + d);
    return fract(f(x * y));
  };
  return (px, py) => {
    const ix = Math.floor(px), iy = Math.floor(py);
    const fx = fract(px), fy = fract(py);          // ← may disagree with floor()
    const ux = smooth(fx), uy = smooth(fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return mix(mix(a, b, ux), mix(c, d, ux), uy);
  };
}

// ───────────── NEW (permutation-polynomial lattice hash, no fract) ─────────────
// Mirrors the GLSL exactly: integers only inside the hash, blend weight derived
// from the same floor() as the lattice, positive bias so no negative paths.
const BIAS = 2312; // 289 * 8 — a multiple of the lattice period, so it changes nothing
function newNoise(px, py) {
  const mod289 = (x) => f(x - Math.floor(f(x * (1 / 289))) * 289);
  const permute = (x) => mod289(f(f(x * 34 + 1) * x));
  const hash = (ix, iy) => {
    ix = mod289(ix); iy = mod289(iy);
    let h = permute(f(permute(ix) + iy));
    h = permute(f(h + ix));
    if (h > 288.5) h -= 289;
    return f(h * (1 / 289));
  };
  const bx = f(px + BIAS), by = f(py + BIAS);
  const ix = Math.floor(bx), iy = Math.floor(by);
  const fx = Math.min(1, Math.max(0, f(bx - ix))), fy = Math.min(1, Math.max(0, f(by - iy)));
  const ux = smooth(fx), uy = smooth(fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return mix(mix(a, b, ux), mix(c, d, ux), uy);
}

// ── fbm as the shaders run it: 5 octaves through the rotate+scale matrix ──
function fbm(noise, px, py) {
  let s = 0, a = 0.5;
  for (let i = 0; i < 5; i++) {
    s = f(s + a * noise(px, py));
    const nx = f(1.6 * px + 1.2 * py), ny = f(-1.2 * px + 1.6 * py); // mat2(1.6,1.2,-1.2,1.6)
    px = nx; py = ny; a *= 0.5;
  }
  return s;
}

// Largest jump between neighbouring samples along scanlines through a region.
// Value noise is C0-continuous, so with step 1/64 of a cell the true maximum
// jump is small; a seam (extrapolated mix, lattice/weight disagreement) is a
// jump of order 0.1–1.0.
function maxStep(noise, { x0, y0, w, h, step }) {
  let worst = 0;
  for (let y = y0; y < y0 + h; y += step) {
    let prev = fbm(noise, x0, y);
    for (let x = x0 + step; x < x0 + w; x += step) {
      const v = fbm(noise, x, y);
      worst = Math.max(worst, Math.abs(v - prev));
      prev = v;
    }
  }
  return worst;
}

// Field mode after 20 minutes: p = uv*3 (0..6) offset by t = 1200*0.05 = 60,
// and the second warp term goes NEGATIVE (vec2(5.2, -t)). Both regions matter.
const regions = [
  { name: "fresh load, negative quadrant (rotated octaves)", x0: -3, y0: -3, w: 6, h: 6, step: 1 / 64 },
  { name: "20 min in, positive drift", x0: 60, y0: 60, w: 6, h: 6, step: 1 / 64 },
  { name: "20 min in, negative drift", x0: 2, y0: -62, w: 6, h: 6, step: 1 / 64 },
];

const SEAM = 0.12; // anything above this is a visible edge; healthy fbm stays well under
let ok = true;
for (const r of regions) {
  const oldExact = maxStep(oldNoiseFactory(fractExact), r);
  const oldBuggy = maxStep(oldNoiseFactory(fractBuggy), r);
  const neu = maxStep(newNoise, r);
  const line = (l, v) => `  ${l.padEnd(22)} max jump ${v.toFixed(4)} ${v > SEAM ? "SEAMS" : "smooth"}`;
  console.log(r.name);
  console.log(line("old, exact fract", oldExact));
  console.log(line("old, Intel-style fract", oldBuggy));
  console.log(line("new (permutation)", neu));
  if (neu > SEAM) ok = false;
}

// Bounded intermediates: every value the new hash touches must be an exact
// fp32 integer (< 2^24) so no driver can round it.
let maxInter = 0;
for (let i = -3000; i <= 3000; i += 7) {
  const m = ((i % 289) + 289) % 289;
  maxInter = Math.max(maxInter, (m * 34 + 1) * m);
}
console.log(`\nlargest hash intermediate: ${maxInter} (${maxInter < 2 ** 24 ? "exact in fp32" : "NOT exact"})`);
if (maxInter >= 2 ** 24) ok = false;

console.log(ok ? "\nPASS — new noise is seam-free under the Intel fract failure mode" : "\nFAIL");
process.exit(ok ? 0 : 1);

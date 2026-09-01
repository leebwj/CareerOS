// Verifies the factual claims printed on the Mini Maya diagrams.
// Run against the course models: node scripts/verify-mini-maya-claims.mjs
// (point OBJ at a checkout of the half-edge repo; the models are not vendored
// here because that repository is private under course policy.)
// An earlier caption claimed "every new vertex has four edges" — this script is
// what caught that it is false, so the captions stay checkable rather than trusted.
import fs from "node:fs";
const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const mul = (a, s) => [a[0]*s, a[1]*s, a[2]*s];
const ek = (i, j) => (i < j ? i + "_" + j : j + "_" + i);

function loadOBJ(p) {
  const P = [], F = [];
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const w = line.trim().split(/\s+/);
    if (w[0] === "v") P.push([+w[1], +w[2], +w[3]]);
    else if (w[0] === "f") F.push(w.slice(1).map((t) => parseInt(t.split("/")[0], 10) - 1));
  }
  return { p: P, f: F };
}
function subdivide({ p, f }) {
  const fp = f.map((F) => mul(F.reduce((a, i) => add(a, p[i]), [0,0,0]), 1 / F.length));
  const ef = new Map();
  f.forEach((F, fi) => F.forEach((vi, k) => {
    const vj = F[(k+1) % F.length], kk = ek(vi, vj);
    if (!ef.has(kk)) ef.set(kk, { a: vi, b: vj, faces: [] });
    ef.get(kk).faces.push(fi);
  }));
  const ep = new Map();
  for (const [kk, e] of ef) ep.set(kk, mul(e.faces.reduce((a, fi) => add(a, fp[fi]), add(p[e.a], p[e.b])), 1 / (2 + e.faces.length)));
  const vF = p.map(() => []), vE = p.map(() => []);
  f.forEach((F, fi) => F.forEach((vi) => vF[vi].push(fi)));
  for (const [kk, e] of ef) { vE[e.a].push(kk); vE[e.b].push(kk); }
  const np = p.map((P, i) => {
    const n = vF[i].length;
    const Fv = mul(vF[i].reduce((a, fi) => add(a, fp[fi]), [0,0,0]), 1/n);
    const Rv = mul(vE[i].map((kk) => ef.get(kk)).reduce((a, e) => add(a, mul(add(p[e.a], p[e.b]), .5)), [0,0,0]), 1/vE[i].length);
    return mul(add(add(Fv, mul(Rv, 2)), mul(P, n-3)), 1/n);
  });
  const out = [...np];
  const fpi = fp.map((q) => (out.push(q), out.length - 1));
  const epi = new Map();
  for (const [kk, q] of ep) { out.push(q); epi.set(kk, out.length - 1); }
  const quads = [];
  f.forEach((F, fi) => F.forEach((vi, k) => {
    const pr = F[(k-1+F.length) % F.length], nx = F[(k+1) % F.length];
    quads.push([vi, epi.get(ek(vi, nx)), fpi[fi], epi.get(ek(pr, vi))]);
  }));
  return { p: out, f: quads, nOrig: p.length, nFace: fp.length, nEdge: ep.size, origSides: f.map((F) => F.length) };
}
const valences = (m) => {
  const v = m.p.map(() => new Set());
  m.f.forEach((F) => F.forEach((vi, k) => { const vj = F[(k+1)%F.length]; v[vi].add(vj); v[vj].add(vi); }));
  return v.map((s) => s.size);
};
const OBJ = "C:/Users/leebr/AppData/Local/Temp/claude/D--GitHub-leebwj-github-io/39a90496-5b2f-40a4-8f26-bda53f02df11/scratchpad/minimaya/obj_files";

for (const name of ["cube", "dodecahedron", "cow"]) {
  const src = loadOBJ(`${OBJ}/${name}.obj`);
  const sides = [...new Set(src.f.map((F) => F.length))].sort();
  const m = subdivide(src);
  const val = valences(m);
  const origVal = (() => { const v = src.p.map(() => new Set());
    src.f.forEach((F) => F.forEach((vi, k) => { const vj = F[(k+1)%F.length]; v[vi].add(vj); v[vj].add(vi); })); return v.map((s) => s.size); })();

  const oV = val.slice(0, m.nOrig), fV = val.slice(m.nOrig, m.nOrig + m.nFace), eV = val.slice(m.nOrig + m.nFace);
  const uniq = (a) => [...new Set(a)].sort((x, y) => x - y).join(",");
  const keptValence = oV.every((v, i) => v === origVal[i]);
  const facePtMatchesSides = fV.every((v, i) => v === m.origSides[i]);
  const allQuads = m.f.every((F) => F.length === 4);
  const quadsPerCorner = m.f.length === m.origSides.reduce((a, b) => a + b, 0);

  console.log(`\n=== ${name}.obj — original faces have ${sides.join("/")} sides, vertices valence ${uniq(origVal)} ===`);
  console.log(`  CLAIM every face becomes a quadrilateral ............ ${allQuads ? "TRUE" : "FALSE"}`);
  console.log(`  CLAIM one quad per original corner ................. ${quadsPerCorner ? "TRUE" : "FALSE"}  (${m.f.length} quads)`);
  console.log(`  CLAIM an edge point always has 4 neighbours ........ ${uniq(eV) === "4" ? "TRUE" : "FALSE"}  (observed ${uniq(eV)})`);
  console.log(`  CLAIM a face point has as many as its face's sides . ${facePtMatchesSides ? "TRUE" : "FALSE"}  (observed ${uniq(fV)})`);
  console.log(`  CLAIM originals keep the valence they started with . ${keptValence ? "TRUE" : "FALSE"}  (observed ${uniq(oV)})`);
}

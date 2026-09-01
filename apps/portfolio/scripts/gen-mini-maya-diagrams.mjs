// Render the two Mini Maya diagrams as real PNGs.
//
// No prose is baked into the images — the explanation lives in the caption
// underneath each one on the page. Only the labels the diagram needs to be
// readable stay inside (pointer names, panel titles).
//
// Both were verified against real subdivided meshes before drawing, by
// scripts/verify-mini-maya-claims.mjs:
//  * half-edge: mp_vert is the HEAD vertex ("the vertex between this half-edge
//    and mp_next"), mp_next continues the same face loop, mp_sym is antiparallel
//    in the adjacent face. All four half-edges of face A are drawn so the "next
//    circles the face" claim is shown rather than asserted.
//  * Catmull-Clark: an earlier caption said "every new vertex has four edges".
//    Measured, that is FALSE — original vertices keep the valence they had, and
//    a face point's valence equals its original face's side count (5 on the
//    dodecahedron, 3 on the cow). What is true, and what actually explains the
//    convergence, is that every face becomes a quad and the irregular vertices
//    stop multiplying after the first round.
//
// Markers use userSpaceOnUse: the default scales the arrowhead by stroke width,
// which turns a 3px line into a blob.
import sharp from "sharp";
import fs from "node:fs";

const BG = "#F7F8FC", INK = "#242938", DIM = "#8C93A8", ACC = "#3D57B8", FAINT = "#C6CBDC";
const MONO = "Consolas, 'Cascadia Mono', monospace";
const SANS = "'Segoe UI', system-ui, sans-serif";
const mark = (id, col, size = 11) =>
  `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="${size}" markerHeight="${size}" orient="auto-start-reverse"><path d="M0 0.8 L10 5 L0 9.2 z" fill="${col}"/></marker>`;

// -- A. what a half-edge stores ---------------------------------------------
const AL = 80, AR = 340, BR_ = 600, AT = 64, AB = 244, ins = 13;
const svgA = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="300" viewBox="0 0 680 300">
  <rect width="680" height="300" fill="${BG}"/>
  <defs>${mark("mAcc", ACC)}${mark("mAccS", ACC, 9)}${mark("mDim", DIM, 9)}${mark("mFai", FAINT, 9)}</defs>

  <path d="M${AL} ${AT} L${AR} ${AT} L${AR} ${AB} L${AL} ${AB} Z" fill="#FFFFFF" stroke="${FAINT}" stroke-width="1.5"/>
  <path d="M${AR} ${AT} L${BR_} ${AT} L${BR_} ${AB} L${AR} ${AB} Z" fill="#FCFDFF" stroke="${FAINT}" stroke-width="1.5"/>
  <text x="${(AL + AR) / 2}" y="${AB + 28}" font-family="${MONO}" font-size="11.5" fill="${DIM}" text-anchor="middle" letter-spacing="1.6">FACE A</text>
  <text x="${(AR + BR_) / 2}" y="${AB + 28}" font-family="${MONO}" font-size="11.5" fill="${DIM}" text-anchor="middle" letter-spacing="1.6">FACE B</text>

  <!-- the rest of face A's loop, faint: next -> next -> next returns to he -->
  <path d="M${AL + ins} ${AT + ins} L${AL + ins} ${AB - ins}" stroke="${FAINT}" stroke-width="1.8" fill="none" marker-end="url(#mFai)"/>
  <path d="M${AL + ins} ${AB - ins} L${AR - ins - 8} ${AB - ins}" stroke="${FAINT}" stroke-width="1.8" fill="none" marker-end="url(#mFai)"/>

  <!-- he, then its next -->
  <path d="M${AR - ins} ${AB - ins - 10} L${AR - ins} ${AT + ins}" stroke="${ACC}" stroke-width="3" fill="none" marker-end="url(#mAcc)"/>
  <path d="M${AR - ins - 8} ${AT + ins} L${AL + ins} ${AT + ins}" stroke="${ACC}" stroke-width="2" fill="none" marker-end="url(#mAccS)" opacity=".5"/>
  <!-- sym: antiparallel, in face B -->
  <path d="M${AR + ins} ${AT + ins} L${AR + ins} ${AB - ins}" stroke="${DIM}" stroke-width="2" stroke-dasharray="7 5" fill="none" marker-end="url(#mDim)"/>

  <circle cx="${AR}" cy="${AT}" r="6" fill="${ACC}"/>
  <circle cx="${AR}" cy="${AB}" r="4" fill="${FAINT}"/>

  <g font-family="${MONO}" font-size="13.5">
    <text x="${AR - ins - 14}" y="${(AT + AB) / 2 + 5}" fill="${ACC}" font-weight="700" text-anchor="end">he</text>
    <text x="${(AL + AR) / 2 - 10}" y="${AT + ins - 12}" fill="${ACC}" text-anchor="middle" opacity=".85">next()</text>
    <text x="${AR + ins + 12}" y="${(AT + AB) / 2 + 5}" fill="${DIM}">sym()</text>
    <text x="${AR + 14}" y="${AT - 18}" fill="${ACC}" font-weight="700">vert()</text>
    <text x="${AL + 26}" y="${(AT + AB) / 2 + 5}" fill="${DIM}">face()</text>
  </g>
</svg>`;

// -- B. the four passes ------------------------------------------------------
const S = 132, PITCH = 192, X0 = 44, TOP = 64;
const bx = (i) => X0 + i * PITCH;
const box = (i, col) =>
  `<path d="M${bx(i)} ${TOP} L${bx(i) + S} ${TOP} L${bx(i) + S} ${TOP + S} L${bx(i)} ${TOP + S} Z" fill="none" stroke="${col}" stroke-width="1.6"/>`;
const CORN = (i) => [[bx(i), TOP], [bx(i) + S, TOP], [bx(i) + S, TOP + S], [bx(i), TOP + S]];
const EDGE = (i) => [[bx(i) + S / 2, TOP], [bx(i) + S, TOP + S / 2], [bx(i) + S / 2, TOP + S], [bx(i), TOP + S / 2]];
const CTR = (i) => [bx(i) + S / 2, TOP + S / 2];
const dot = ([x, y], r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const cap = (i, n, t) =>
  `<text x="${bx(i)}" y="${TOP - 38}" font-family="${MONO}" font-size="11" fill="${DIM}" letter-spacing="1.6">${n}</text>
   <text x="${bx(i)}" y="${TOP - 18}" font-family="${SANS}" font-size="13.5" fill="${INK}" font-weight="600">${t}</text>`;
const IN = 17;
const inner = (i) => [[bx(i) + IN, TOP + IN], [bx(i) + S - IN, TOP + IN], [bx(i) + S - IN, TOP + S - IN], [bx(i) + IN, TOP + S - IN]];

const svgB = `<svg xmlns="http://www.w3.org/2000/svg" width="796" height="232" viewBox="0 0 796 232">
  <rect width="796" height="232" fill="${BG}"/>

  ${cap(0, "01", "face point")}
  ${box(0, FAINT)}${CORN(0).map((p) => dot(p, 4, INK)).join("")}${dot(CTR(0), 6, ACC)}

  ${cap(1, "02", "edge points")}
  ${box(1, FAINT)}${CORN(1).map((p) => dot(p, 3.2, FAINT)).join("")}${dot(CTR(1), 3.6, FAINT)}${EDGE(1).map((p) => dot(p, 5.5, ACC)).join("")}

  ${cap(2, "03", "move the originals")}
  ${box(2, FAINT)}
  <path d="M${inner(2)[0][0]} ${inner(2)[0][1]} L${inner(2)[1][0]} ${inner(2)[1][1]} L${inner(2)[2][0]} ${inner(2)[2][1]} L${inner(2)[3][0]} ${inner(2)[3][1]} Z" fill="none" stroke="${ACC}" stroke-width="1.6" stroke-dasharray="5 4"/>
  ${CORN(2).map((p) => dot(p, 3, FAINT)).join("")}${inner(2).map((p) => dot(p, 5, ACC)).join("")}

  ${cap(3, "04", "quadrangulate")}
  ${box(3, INK)}
  <path d="M${bx(3) + S / 2} ${TOP} L${bx(3) + S / 2} ${TOP + S} M${bx(3)} ${TOP + S / 2} L${bx(3) + S} ${TOP + S / 2}" stroke="${INK}" stroke-width="1.6"/>
  ${[...CORN(3), ...EDGE(3), CTR(3)].map((p) => dot(p, 4, ACC)).join("")}
</svg>`;

const OUT = "D:/GitHub/careeros/apps/portfolio/src/assets/work/mini-maya";
for (const [name, svg] of [["diagram-halfedge", svgA], ["diagram-catmull", svgB]]) {
  await sharp(Buffer.from(svg), { density: 288 }).resize({ width: 1640 }).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
  console.log(`${name}.png  ${(fs.statSync(`${OUT}/${name}.png`).size / 1024).toFixed(0)} KB`);
}

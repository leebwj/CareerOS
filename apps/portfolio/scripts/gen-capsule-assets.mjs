// Capsule case-study imagery, rebuilt from the team's Figma deck.
//
// The slides are not used as-is. Each carries its own heading and bullet copy,
// which reads as a pasted slide on a case-study page and repeats the prose
// beside it. Every image here is cut down to the artwork alone, at proportions
// chosen for the block it sits in. Crops come from the slides' own layer rects,
// so nothing is eyeballed; the feature shots and the 3D pass are pulled from 2x
// exports so the phone screens stay sharp on dense displays.
//
// Cover: the deck's "Thumbnail" frame clips its own artwork — the blue capsule
// on the left is sliced by the frame edge in every export and those pixels do
// not exist to recover. Rebuilding from the underlying layers was tried and
// rejected (mean 43/255 away from the real export, i.e. guesswork). The crop
// starts past the severed ball instead. If "Clip content" is ever switched off
// on that frame, re-export and the crop can go.
//
// The team slide is deliberately NOT exported: it carries eight people's
// headshots, which are not ours to publish.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "C:/Users/leebr/AppData/Local/Temp/claude/D--GitHub-leebwj-github-io/39a90496-5b2f-40a4-8f26-bda53f02df11/scratchpad/capsule";
const OUT = "src/assets/work/capsule";
const GROUND = { r: 245, g: 245, b: 245 };
const src = (n) => sharp(`${SRC}/${n}.png`).flatten({ background: GROUND });
const jpg = (q = 90) => ({ quality: q, mozjpeg: true });

// -- cover -------------------------------------------------------------------
await sharp(`${SRC}/thumbnail.png`).flatten({ background: GROUND })
  .extract({ left: 380, top: 0, width: 2044, height: 1533 })
  .resize({ width: 1320, height: 990, kernel: "lanczos3" })
  .png({ compressionLevel: 9 }).toFile("src/assets/work/capsule.png");

// -- hero: the machine on its gradient, clear of the title block -------------
await src("slide-title").extract({ left: 760, top: 180, width: 1160, height: 773 })
  .jpeg(jpg()).toFile(`${OUT}/hero.jpg`);

// -- camera roll -------------------------------------------------------------
// The slide sets bullet copy to the right of the phone, so rather than crop to a
// narrow portrait the phone is recomposed on a 3:2 ground. The ground is the
// slide's own gradient taken from the strip left of the phone (x0..140), which
// is the only full-height run carrying neither type nor the slide's hairline
// rule — stretching a strip that included the rule left a seam across the frame.
{
  const W = 1620, H = 1080, PW = 670;
  const bg = await src("slide-cameraroll").extract({ left: 0, top: 0, width: 140, height: H })
    .resize({ width: W, height: H, fit: "fill" }).toBuffer();
  const phone = await src("slide-cameraroll").extract({ left: 140, top: 0, width: PW, height: 975 }).toBuffer();
  await sharp(bg).composite([{ input: phone, left: Math.round((W - PW) / 2), top: 0 }])
    .jpeg(jpg()).toFile(`${OUT}/camera-roll.jpg`);
}

// -- 3D pass -----------------------------------------------------------------
// The slide lays this out as two cards with a lot of internal padding, which
// left the Spline capsule stranded in white space. Both renders are lifted out
// and recomposed. Three rules learned the hard way: the machines crop insets
// past the card's rounded corners so no white notches reach the edges; the
// capsule keeps a margin of its own card ground around it instead of being cut
// at its bounding box; and nothing is upscaled — the machines scale DOWN to
// meet the capsule, not the other way. Rects are 2x.
{
  const machines = await src("slide-3dprocess@2x").extract({ left: 288, top: 524, width: 1528, height: 1372 })
    .resize({ height: 1100 }).toBuffer();
  const mw = (await sharp(machines).metadata()).width;
  const capsule = await src("slide-3dprocess@2x").extract({ left: 2488, top: 794, width: 582, height: 902 }).toBuffer();
  const M = 60, GAP = 150, W = M + mw + GAP + 582 + M, H = 1100 + 2 * M;
  const sheet = await sharp({ create: { width: W, height: H, channels: 3, background: GROUND } })
    .composite([
      { input: machines, left: M, top: M },
      { input: capsule, left: M + mw + GAP, top: Math.round((H - 902) / 2) },
    ]).png().toBuffer();
  await sharp(sheet).resize({ width: 1700 }).jpeg(jpg()).toFile(`${OUT}/three-d.jpg`);
}

// -- feature shots: inset past the card's rounded corners, so the frame is a
// clean full-bleed rectangle instead of gradient with notched white corners ---
for (const [s, name] of [["slide-toggleview@2x", "toggle-view"], ["slide-opening@2x", "opening"]])
  await src(s).extract({ left: 538, top: 312, width: 846, height: 1536 }).jpeg(jpg(92)).toFile(`${OUT}/${name}.jpg`);

// customizing keeps its four rounded tiles whole and frames them in a definite
// border of the slide's own ground, rather than cutting through the corners
await src("slide-customizing").extract({ left: 178, top: 300, width: 1563, height: 654 })
  .extend({ top: 48, bottom: 48, left: 48, right: 48, background: GROUND })
  .jpeg(jpg()).toFile(`${OUT}/customizing.jpg`);
await src("slide-inspiration").extract({ left: 128, top: 282, width: 1664, height: 686 })
  .jpeg(jpg()).toFile(`${OUT}/inspiration.jpg`);

// -- diagrams: the user-flow heading sits inside the diagram's own bounds, so
// it is painted out rather than cropped; both then trim to content ------------
// both diagrams: trim to their actual content, then pad an even margin — this
// centres them optically and gives the border breathing space in one move
{
  const patch = await sharp({ create: { width: 340, height: 120, channels: 3, background: { r: 255, g: 255, b: 255 } } }).png().toBuffer();
  const masked = await src("slide-userflow").composite([{ input: patch, left: 100, top: 110 }]).png().toBuffer();
  const trimmed = await sharp(masked).trim({ threshold: 3 }).toBuffer();
  await sharp(trimmed).extend({ top: 72, bottom: 72, left: 72, right: 72, background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 }).toFile(`${OUT}/user-flow.png`);
}
{
  const trimmed = await src("slide-techstack").extract({ left: 100, top: 260, width: 1720, height: 640 })
    .png().toBuffer().then((b) => sharp(b).trim({ threshold: 3 }).toBuffer());
  await sharp(trimmed).extend({ top: 64, bottom: 64, left: 64, right: 64, background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 }).toFile(`${OUT}/tech-stack.png`);
}

const cov = await sharp("src/assets/work/capsule.png").metadata();
console.log(`capsule.png  ${cov.width}x${cov.height}  ${(fs.statSync("src/assets/work/capsule.png").size / 1024).toFixed(0)} KB`);
for (const f of fs.readdirSync(OUT)) {
  const m = await sharp(`${OUT}/${f}`).metadata();
  console.log(`  ${f.padEnd(16)} ${String(m.width).padStart(4)}x${String(m.height).padEnd(4)} ratio ${(m.width / m.height).toFixed(2)}  ${(fs.statSync(`${OUT}/${f}`).size / 1024).toFixed(0)} KB`);
}

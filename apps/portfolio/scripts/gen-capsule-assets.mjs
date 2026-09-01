// Capsule case-study imagery, exported from the team's Figma deck.
//
// Cover: the deck's own "Thumbnail" frame (the Blender/Spline gachapon render).
//
// That frame clips its own artwork — the blue capsule on the left is sliced by
// the frame edge in every export, and those pixels do not exist to recover.
// Rebuilding the composition from the underlying layers was tried and rejected:
// the reconstruction differed from the real export by a mean of 43/255, so it
// was guesswork, not his design. The cover is framed past the severed ball
// instead. The crop starts at x380, which leaves the teal machine, the red
// machine and the loose capsule whole with clear ground on both sides; the red
// and white machines bleed off the bottom, which reads as composition rather
// than as a clipping error. It downscales to the card size, so nothing is
// upscaled.
//
// If "Clip content" is ever switched off on that frame in Figma, re-export and
// the whole composition becomes available and this crop can be dropped.
//
// The team slide is deliberately NOT exported: it carries eight people's
// headshots, which are not ours to publish.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "C:/Users/leebr/AppData/Local/Temp/claude/D--GitHub-leebwj-github-io/39a90496-5b2f-40a4-8f26-bda53f02df11/scratchpad/capsule";
const OUT = "src/assets/work/capsule";
const GROUND = { r: 245, g: 245, b: 245 };
const CROP = { left: 380, top: 0, width: 2044, height: 1533 }; // exactly 4:3

await sharp(`${SRC}/thumbnail.png`)
  .flatten({ background: GROUND })
  .extract(CROP)
  .resize({ width: 1320, height: 990, kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toFile("src/assets/work/capsule.png");

// photographic slides keep JPEG; the flat diagram slides stay PNG so the type stays crisp
const JPG = [["slide-title", "hero"], ["slide-cameraroll", "camera-roll"], ["slide-inspiration", "inspiration"],
             ["slide-3dprocess", "three-d"], ["slide-toggleview", "toggle-view"], ["slide-opening", "opening"],
             ["slide-customizing", "customizing"]];
const PNG = [["slide-userflow", "user-flow"], ["slide-techstack", "tech-stack"]];

for (const [src, name] of JPG)
  await sharp(`${SRC}/${src}.png`).flatten({ background: GROUND }).jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
for (const [src, name] of PNG)
  await sharp(`${SRC}/${src}.png`).flatten({ background: GROUND }).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);

const cov = await sharp("src/assets/work/capsule.png").metadata();
console.log(`capsule.png  ${cov.width}x${cov.height}  ${(fs.statSync("src/assets/work/capsule.png").size / 1024).toFixed(0)} KB`);

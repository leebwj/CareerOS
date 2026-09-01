// Capsule case-study imagery, exported from the team's Figma deck.
//
// Cover: the deck's own "Thumbnail" frame (the Blender/Spline gachapon render).
// It is 2424x2154 and the card frame is 4:3, so it is padded sideways onto the
// render's own #F5F5F5 ground rather than cropped — nothing of the composition
// is cut, and the padding is invisible.
//
// The team slide is deliberately NOT exported: it carries eight people's
// headshots, which are not ours to publish.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "C:/Users/leebr/AppData/Local/Temp/claude/D--GitHub-leebwj-github-io/39a90496-5b2f-40a4-8f26-bda53f02df11/scratchpad/capsule";
const OUT = "src/assets/work/capsule";
const GROUND = { r: 245, g: 245, b: 245 };

const meta = await sharp(`${SRC}/thumbnail.png`).metadata();
const target = Math.round((meta.height * 4) / 3);
const side = Math.round((target - meta.width) / 2);
const padded = await sharp(`${SRC}/thumbnail.png`)
  .flatten({ background: GROUND })
  .extend({ left: side, right: target - meta.width - side, background: GROUND })
  .toBuffer();
await sharp(padded).resize({ width: 1320 }).png({ compressionLevel: 9 }).toFile("src/assets/work/capsule.png");

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
console.log(`capsule.png  ${cov.width}x${cov.height}  ${(fs.statSync("src/assets/work/capsule.png").size / 1024).toFixed(0)} KB  (pad ${side}px each side)`);
for (const f of fs.readdirSync(OUT)) console.log(`  ${f}  ${(fs.statSync(`${OUT}/${f}`).size / 1024).toFixed(0)} KB`);

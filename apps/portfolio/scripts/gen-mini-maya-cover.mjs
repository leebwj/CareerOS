// Card cover for Mini Maya: the subdivided cow, cropped out of the editor capture.
//
// The full window is 16:10 against a 4:3 card. Fitting it whole left the content
// small and awkward in the frame, and filling the frame with the whole window
// would either clip the cow or slice a list column in half, so the cover is the
// viewport alone — the cow full-bleed. The editor in full still opens the case
// study, so nothing is lost.
//
// Crop measured, not guessed: the viewport is the grey region at x 28..954,
// y 111..758, and the cow's own bounds inside it are x 243..921, y 205..680.
// The cow sits right of the viewport centre, so the 4:3 window is placed to give
// it even margins (about 33px) rather than being centred on the viewport.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "src/assets/work/mini-maya/cow-subdivided.png";
const OUT = "src/assets/work/mini-maya.png";
const CROP = { left: 210, top: 163, width: 744, height: 558 }; // exactly 4:3

await sharp(SRC)
  .extract(CROP)
  .resize({ width: 1320, height: 990, kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const m = await sharp(OUT).metadata();
console.log(`${OUT}  ${m.width}x${m.height}  from ${CROP.width}x${CROP.height}  ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);

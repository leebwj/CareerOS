// Card cover for Mini Maya: the editor with the subdivided cow loaded.
//
// The capture is 16:10 and the card frame is 4:3, so the image is fitted whole
// rather than cropped — nothing of the window is cut. The padding is filled with
// the window's own chrome colour (sampled: 32,32,32 at the top, 30,30,30 at the
// bottom) so the fit reads as extra margin, not as letterbox bars.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "src/assets/work/mini-maya/cow-subdivided.png";
const OUT = "src/assets/work/mini-maya.png";
const W = 1320, H = 990;

const fitted = await sharp(SRC).resize({ width: W }).toBuffer();
const { height: fh } = await sharp(fitted).metadata();
const top = Math.floor((H - fh) / 2), bottom = H - fh - top;

// two passes: chained .extend() calls overwrite each other, they do not compose
const withTop = await sharp(fitted).extend({ top, background: { r: 32, g: 32, b: 32 } }).toBuffer();
await sharp(withTop).extend({ bottom, background: { r: 30, g: 30, b: 30 } }).png({ compressionLevel: 9 }).toFile(OUT);

const m = await sharp(OUT).metadata();
console.log(`${OUT}  ${m.width}x${m.height}  (fitted ${W}x${fh}, pad ${top}/${bottom})  ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);

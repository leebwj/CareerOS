// Generates assets/tray.png — a 32×32 cobalt dot for the system tray.
// Written by hand rather than pulled from a dependency: the repo is zero-dep,
// and a tray icon is a few hundred bytes of PNG. Run: node make-icon.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const S = 32;
const px = Buffer.alloc(S * S * 4); // RGBA

// a filled circle with a soft edge, in the CareerOS cobalt
const [R, G, B] = [0x9a, 0xaf, 0xe2];
const cx = (S - 1) / 2, cy = (S - 1) / 2, rad = 13.5;
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const d = Math.hypot(x - cx, y - cy);
    // 1px of antialiasing at the rim so it does not look jagged at tray size
    const a = d <= rad - 1 ? 255 : d >= rad ? 0 : Math.round((rad - d) * 255);
    const i = (y * S + x) * 4;
    px[i] = R; px[i + 1] = G; px[i + 2] = B; px[i + 3] = a;
  }
}

// PNG wants a filter byte at the start of every scanline
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0; // filter: none
  px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;    // bit depth
ihdr[9] = 6;    // colour type: RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "assets");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "tray.png"), png);
console.log(`assets/tray.png — ${S}×${S}, ${png.length} bytes`);

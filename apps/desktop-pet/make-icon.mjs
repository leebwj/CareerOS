// Generates assets/tray.png — a 32×32 cobalt dot for the system tray.
// Written by hand rather than pulled from a dependency: the repo is zero-dep,
// and a tray icon is a few hundred bytes of PNG. Run: node make-icon.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const S = 32;
const px = Buffer.alloc(S * S * 4); // RGBA

// Three states, so the tray says something at a glance without hovering:
//   idle  — nothing needs you
//   new   — cobalt, a target role in your cycle just opened
//   due   — amber, follow-ups are due (the one that costs you if ignored)
const STATES = {
  idle:  [0x54, 0x5c, 0x66],
  new:   [0x9a, 0xaf, 0xe2],
  due:   [0xd9, 0xb3, 0x6a],
};
function paint([R, G, B], solid) {
  const cx = (S - 1) / 2, cy = (S - 1) / 2, rad = 13.5;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - cx, y - cy);
      // 1px of antialiasing at the rim so it does not look jagged at tray size
      let a = d <= rad - 1 ? 255 : d >= rad ? 0 : Math.round((rad - d) * 255);
      // idle is a ring rather than a disc — quieter, and unmistakably different
      // from the active states even for someone who cannot separate the hues
      if (!solid && d < rad - 4) a = 0;
      const i = (y * S + x) * 4;
      px[i] = R; px[i + 1] = G; px[i + 2] = B; px[i + 3] = a;
    }
  }
}

// PNG wants a filter byte at the start of every scanline
function scanlines() {
  const raw = Buffer.alloc(S * (S * 4 + 1));
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0; // filter: none
    px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
  }
  return raw;
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

function encode() {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines(), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const out = join(dirname(fileURLToPath(import.meta.url)), "assets");
mkdirSync(out, { recursive: true });
for (const [name, rgb] of Object.entries(STATES)) {
  paint(rgb, name !== "idle");
  const file = name === "idle" ? "tray.png" : `tray-${name}.png`;
  const bytes = encode();
  writeFileSync(join(out, file), bytes);
  console.log(`assets/${file} — ${S}×${S}, ${bytes.length} bytes`);
}

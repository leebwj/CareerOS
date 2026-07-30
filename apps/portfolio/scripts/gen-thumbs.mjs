// Build-time cover thumbnails for the art sandbox + homepage gallery wall.
// The grid was decoding the full ~1600px plates (67MB of JPEG → far more as
// GPU texture memory) to paint cards ~300px wide — the main source of pan lag
// on phones. Cards get a 720px webp instead; the reader keeps the full plates.
//
//   node apps/portfolio/scripts/gen-thumbs.mjs        (run from repo root)
//
// Output is committed (public/art/_thumbs/) so deploys don't depend on this
// script running; re-run whenever a cover changes in art.json.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("apps/portfolio");
const art = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/art.json"), "utf8"));
const OUT = path.join(ROOT, "public/art/_thumbs");
fs.mkdirSync(OUT, { recursive: true });

let made = 0, skipped = 0;
for (const p of art) {
  const cover = p.cover;
  if (!cover || /^https?:/.test(cover)) { skipped++; continue; }   // youtube thumbs are already small
  const src = path.join(ROOT, "public", cover);
  const dest = path.join(OUT, `${p.slug}.webp`);
  if (!fs.existsSync(src)) { console.warn(`  !! missing source: ${cover}`); continue; }
  // skip when up to date (source not newer than the thumb)
  if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) { skipped++; continue; }
  await sharp(src).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest);
  made++;
}
const total = fs.readdirSync(OUT).reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`thumbs: ${made} generated, ${skipped} skipped → ${(total / 1024).toFixed(0)} KB total in public/art/_thumbs/`);

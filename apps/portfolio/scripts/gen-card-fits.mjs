// Card thumbnails for the four covers whose aspect fights the 4:3 slot: pad
// each out to 4:3 in its own background color so the full artwork shows with
// no crop and no visible seam. Path@Penn has a navy bar against a white page,
// so it gets transparent padding instead and floats on the card surface.
// Re-run after changing any source; output is committed like the art thumbs.
import sharp from "sharp";

const OUT = "src/assets/work/thumbs";
const solid = (w, h, background) => ({ create: { width: w, height: h, channels: 4, background } });

// wikipedia cover is on the site canvas dark; extend it and give the phones air
{
  const img = await sharp("src/assets/work/wikipedia/cover.png").resize(1530).png().toBuffer();
  await sharp(solid(1594, 1196, { r: 11, g: 12, b: 14, alpha: 1 }))
    .composite([{ input: img, left: 32, top: 114 }])
    .png().toFile(`${OUT}/wikipedia-fit.png`);
}
// dewey is already 4:3; the cream just needs to breathe at the edges
{
  const img = await sharp("src/assets/work/dewey.png").png().toBuffer();
  await sharp(solid(1400, 1050, { r: 242, g: 242, b: 228, alpha: 1 }))
    .composite([{ input: img, left: 40, top: 30 }])
    .png().toFile(`${OUT}/dewey-fit.png`);
}
// playground sits on plain white
{
  const img = await sharp("src/assets/work/playground.jpg").resize(940).png().toBuffer();
  await sharp(solid(1334, 1000, { r: 255, g: 255, b: 255, alpha: 1 }))
    .composite([{ input: img, left: 197, top: 171 }])
    .png().toFile(`${OUT}/playground-fit.png`);
}
// path@penn: rounded screenshot on transparent, the dark card shows through
{
  const W = 1624, H = 1050, R = 24;
  const mask = Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="${R}"/></svg>`);
  const img = await sharp("src/assets/work/path-at-penn.png").resize(W, H)
    .composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  await sharp(solid(1728, 1296, { r: 0, g: 0, b: 0, alpha: 0 }))
    .composite([{ input: img, left: 52, top: 123 }])
    .png().toFile(`${OUT}/path-at-penn-fit.png`);
}
console.log("card fits written to", OUT);

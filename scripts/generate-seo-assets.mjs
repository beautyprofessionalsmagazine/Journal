// Generates the site's SEO image assets from the artwork already in the repo:
//
//   public/images/og-default.png   1200 x 630 default social share image
//   app/icon.png                   192 x 192 favicon (Google asks for > 48 px)
//   app/apple-icon.png             180 x 180 Apple touch icon
//   app/favicon.ico                16 / 32 / 48 px, for crawlers that request it
//   public/images/journal-bg.webp  the paper texture, 937 KB PNG -> a few dozen KB
//
// The icons use the gold "B" cut from the existing wordmark, so no new brand
// mark is invented. When the brand supplies an official square mark, drop it in
// as app/icon.png and app/apple-icon.png (and regenerate favicon.ico from it).
//
// Usage: node scripts/generate-seo-assets.mjs

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const at = (path) => resolve(root, path);

const LOGO = at("public/images/beauty-professionals-magazine-logo.png");
const BACKGROUND = "#0b0b0b";

/** Same near-black to warm charcoal sweep as the site header (.site-header-surface). */
function gradientSvg(width, height) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#080808"/>
          <stop offset="0.48" stop-color="#171717"/>
          <stop offset="1" stop-color="#302b24"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <rect y="${height - 2}" width="${width}" height="2" fill="#b89b62" fill-opacity="0.45"/>
    </svg>`);
}

/**
 * Finds the first letter ("B" of BEAUTY) by scanning the wordmark's alpha
 * channel: the left-most run of opaque columns inside the big-letter band.
 */
async function cutFirstLetter() {
  const { data, info } = await sharp(LOGO)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolution: undefined, resolveWithObject: true });
  const { width, height, channels } = info;
  const bandTop = Math.round(height * 0.17);
  const bandBottom = Math.round(height * 0.83);
  const opaqueCount = (x) => {
    let count = 0;
    for (let y = bandTop; y < bandBottom; y += 1) {
      if (data[(y * width + x) * channels + 3] > 40) count += 1;
    }
    return count;
  };

  let start = 0;
  while (start < width && opaqueCount(start) === 0) start += 1;

  // The serifs of "B" and "E" touch, so no column is ever empty between them.
  // The junction is the thinnest column in the window where the B must end.
  const windowStart = start + Math.round(width * 0.1);
  const windowEnd = start + Math.round(width * 0.22);
  let end = windowStart;
  for (let x = windowStart; x < windowEnd; x += 1) {
    if (opaqueCount(x) < opaqueCount(end)) end = x;
  }

  return sharp(LOGO)
    .extract({
      left: start,
      top: bandTop,
      width: end - start,
      height: bandBottom - bandTop,
    })
    .trim()
    .png()
    .toBuffer();
}

async function squareIcon(letter, size) {
  const inner = Math.round(size * 0.58);
  const mark = await sharp(letter)
    .resize({ width: inner, height: inner, fit: "inside" })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

/** An .ico container holding PNG images (supported by every current browser). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

async function main() {
  const letter = await cutFirstLetter();

  await writeFile(at("app/icon.png"), await squareIcon(letter, 192));
  await writeFile(at("app/apple-icon.png"), await squareIcon(letter, 180));
  await writeFile(
    at("app/favicon.ico"),
    buildIco(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({
          size,
          data: await squareIcon(letter, size),
        })),
      ),
    ),
  );

  const logo = await sharp(await readFile(LOGO))
    .resize({ width: 760 })
    .toBuffer();
  await writeFile(
    at("public/images/og-default.png"),
    await sharp(gradientSvg(1200, 630))
      .composite([{ input: logo, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  await writeFile(
    at("public/images/journal-bg.webp"),
    await sharp(at("public/images/journal-bg.PNG"))
      .webp({ quality: 82, effort: 6 })
      .toBuffer(),
  );

  console.log("SEO assets written.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

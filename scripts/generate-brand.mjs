// Package the approved artwork without retyping or reconstructing its letterforms.
// Run: node scripts/generate-brand.mjs && node scripts/generate-brand-icons.mjs
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../public/", import.meta.url);
const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const blue = styles.match(/--blue:\s*(#[\da-f]{6})\b/i)?.[1];
if (!blue) throw new Error("The site must define a six-digit --blue accent color.");
const brandRgb = [1, 3, 5].map(start => parseInt(blue.slice(start, start + 2), 16));
const { data: pixels, info } = await sharp(await readFile(new URL("assets/logo-artwork.webp", root)))
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
// Match blue fills to the site accent, preserving white edges and transparency.
for (let i = 0; i < pixels.length; i += 4) {
  const [r, g, b] = pixels.subarray(i, i + 3);
  if (b > r + 12 && b > g + 12) {
    const white = Math.min(r, g) / 255;
    for (let channel = 0; channel < 3; channel++) {
      pixels[i + channel] = Math.round(brandRgb[channel] * (1 - white) + 255 * white);
    }
    // Solid interiors must be opaque so compositing keeps the exact accent color.
    if (pixels[i + 3] >= 250) pixels[i + 3] = 255;
  }
}
const artwork = await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 }).toBuffer();
const { width, height } = await sharp(artwork).metadata();
const iconSize = height;
const icon = await sharp(artwork).extract({ left: 0, top: 0, width: iconSize, height: iconSize }).png({ compressionLevel: 9 }).toBuffer();
const data = buffer => `data:image/png;base64,${buffer.toString("base64")}`;
const image = (buffer, w, h) => `<image id="artwork" width="${w}" height="${h}" xlink:href="${data(buffer)}"/>`;
const whiteFilter = '<filter id="white" color-interpolation-filters="sRGB"><feFlood flood-color="white"/><feComposite in2="SourceAlpha" operator="in"/></filter>';
const svg = (w, h, content) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" role="img" aria-label="Mahesh Labs">${content}</svg>\n`;
const save = (path, value) => writeFile(new URL(path, root), value);

// Text-only wordmark for the header and footer, using the approved artwork.
await save(
  "assets/wordmark.svg",
  svg(width - 440, 288, `<g transform="translate(-440 -64)">${image(artwork, width, height)}</g>`),
);

// Center just the wordmark in the existing canvas to preserve its size and spacing.
const introArtwork = await sharp(artwork)
  .extract({ left: 440, top: 0, width: width - 440, height })
  .extend({ left: 220, right: 220, top: 0, bottom: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
await save(
  "assets/logo-intro.webp",
  await sharp(introArtwork).resize({ width: 640 }).webp({ lossless: true }).toBuffer(),
);

// Clip regions are in approved-artwork coordinates; they never alter glyph outlines.
const nameClip = '<clipPath id="name"><rect x="460" y="0" width="840" height="426"/></clipPath>';
const initialsClip = '<clipPath id="initials"><rect x="50" y="110" width="330" height="190"/></clipPath>';
const restClip = `<clipPath id="rest"><rect x="440" y="0" width="${width - 440}" height="${height}"/></clipPath>`;
const filledMark = `<circle cx="213" cy="213" r="212" fill="${blue}"/><use xlink:href="#artwork" filter="url(#white)" clip-path="url(#initials)"/>`;
// Give standalone marks more space while preserving the approved letterforms.
const standaloneInitials = (white = false) => `<g transform="translate(213 213) scale(.88) translate(-213 -213)"><use xlink:href="#artwork"${white ? ' filter="url(#white)"' : ""} clip-path="url(#initials)"/></g>`;
const outlinedStandalone = `<circle cx="213" cy="213" r="199" fill="none" stroke="${blue}" stroke-width="24"/>${standaloneInitials()}`;
const filledStandalone = `<circle cx="213" cy="213" r="212" fill="${blue}"/>${standaloneInitials(true)}`;

for (const filled of [false, true]) {
  const suffix = filled ? "-filled" : "";
  const mark = svg(iconSize, iconSize, `<defs>${image(icon, iconSize, iconSize)}${whiteFilter}${initialsClip}</defs>${filled ? filledStandalone : outlinedStandalone}`);
  await save(`assets/brand-mark${suffix}.svg`, mark);
  for (const light of [false, true]) {
    const defs = `<defs>${image(artwork, width, height)}${whiteFilter}${nameClip}${initialsClip}${restClip}</defs>`;
    const base = filled ? `<use xlink:href="#artwork" clip-path="url(#rest)"/>${filledMark}` : '<use xlink:href="#artwork"/>';
    const nameOverlay = light ? '<use xlink:href="#artwork" filter="url(#white)" clip-path="url(#name)"/>' : "";
    await save(`assets/logo${light ? "-light" : ""}${suffix}.svg`, svg(width, height, `${defs}${base}${nameOverlay}`));
  }
}
await save("icon.svg", svg(iconSize, iconSize, `<defs>${image(icon, iconSize, iconSize)}${whiteFilter}${initialsClip}</defs>${filledStandalone}`));
console.log(`Packaged approved artwork: ${width}×${height}; icon ${iconSize}×${iconSize}.`);

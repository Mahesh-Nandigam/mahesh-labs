// Package the approved artwork without retyping or reconstructing its letterforms.
// Run: node scripts/generate-brand.mjs && node scripts/generate-brand-icons.mjs
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../public/", import.meta.url);
const artwork = await sharp(await readFile(new URL("assets/logo-artwork.webp", root))).png({ palette: true, colours: 128, dither: 0 }).toBuffer();
const { width, height } = await sharp(artwork).metadata();
const iconSize = height;
const icon = await sharp(artwork).extract({ left: 0, top: 0, width: iconSize, height: iconSize }).png({ palette: true, colours: 128, dither: 0 }).toBuffer();
const data = buffer => `data:image/png;base64,${buffer.toString("base64")}`;
const image = (buffer, w, h) => `<image id="artwork" width="${w}" height="${h}" xlink:href="${data(buffer)}"/>`;
const whiteFilter = '<filter id="white" color-interpolation-filters="sRGB"><feFlood flood-color="white"/><feComposite in2="SourceAlpha" operator="in"/></filter>';
const svg = (w, h, content) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" role="img" aria-label="Mahesh Labs">${content}</svg>\n`;
const save = (path, value) => writeFile(new URL(path, root), value);

// Clip regions are in approved-artwork coordinates; they never alter glyph outlines.
const nameClip = '<clipPath id="name"><rect x="460" y="0" width="840" height="426"/></clipPath>';
const initialsClip = '<clipPath id="initials"><rect x="50" y="110" width="330" height="190"/></clipPath>';
const restClip = `<clipPath id="rest"><rect x="440" y="0" width="${width - 440}" height="${height}"/></clipPath>`;
const blue = "#0345E8";
const filledMark = `<circle cx="213" cy="213" r="212" fill="${blue}"/><use xlink:href="#artwork" filter="url(#white)" clip-path="url(#initials)"/>`;

for (const filled of [false, true]) {
  const suffix = filled ? "-filled" : "";
  const mark = svg(iconSize, iconSize, `<defs>${image(icon, iconSize, iconSize)}${whiteFilter}${initialsClip}</defs>${filled ? filledMark : '<use xlink:href="#artwork"/>'}`);
  await save(`assets/brand-mark${suffix}.svg`, mark);
  for (const light of [false, true]) {
    const defs = `<defs>${image(artwork, width, height)}${whiteFilter}${nameClip}${initialsClip}${restClip}</defs>`;
    const base = filled ? `<use xlink:href="#artwork" clip-path="url(#rest)"/>${filledMark}` : '<use xlink:href="#artwork"/>';
    const nameOverlay = light ? '<use xlink:href="#artwork" filter="url(#white)" clip-path="url(#name)"/>' : "";
    await save(`assets/logo${light ? "-light" : ""}${suffix}.svg`, svg(width, height, `${defs}${base}${nameOverlay}`));
  }
}
await save("icon.svg", svg(iconSize, iconSize, `<circle cx="213" cy="213" r="212" fill="white"/>${image(icon, iconSize, iconSize)}`));
console.log(`Packaged approved artwork: ${width}×${height}; icon ${iconSize}×${iconSize}.`);

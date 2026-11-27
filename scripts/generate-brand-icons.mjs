import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../public/icon.svg", import.meta.url));
await sharp(source).resize(180, 180).png().toFile(new URL("../public/apple-touch-icon.png", import.meta.url).pathname);
const sizes = [16, 32, 48, 64];
const pngs = await Promise.all(sizes.map(size => sharp(source).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const entry = 6 + i * 16;
  header[entry] = header[entry + 1] = sizes[i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile(new URL("../public/favicon.ico", import.meta.url), Buffer.concat([header, ...pngs]));
console.log("Generated Apple touch icon and 16/32/48/64px favicon.");

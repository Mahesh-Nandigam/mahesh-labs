import http from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../out/", import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8" };

try { await stat(path.join(root, "index.html")); }
catch { console.error("Run npm run build before npm start."); process.exit(1); }

http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400); return res.end("Invalid URL"); }
  let file = path.resolve(root, "." + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end("Forbidden"); }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const info = await stat(file);
    const headers = { "Content-Type": types[path.extname(file)] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes" };
    let start = 0;
    let end = info.size - 1;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) {
        res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
        return res.end();
      }
      if (!match[1]) start = Math.max(0, info.size - Number(match[2]));
      else { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end; }
      if (start > end || start >= info.size || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
        res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
        return res.end();
      }
      res.writeHead(206, { ...headers, "Content-Length": end - start + 1, "Content-Range": `bytes ${start}-${end}/${info.size}` });
    } else res.writeHead(200, { ...headers, "Content-Length": info.size });
    if (req.method === "HEAD" || info.size === 0) return res.end();
    createReadStream(file, { start, end }).on("error", () => res.destroy()).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(req.method === "HEAD" ? undefined : await readFile(path.join(root, "404.html")));
  }
}).listen(port, "127.0.0.1", () => console.log(`MaheshLabs is ready at http://localhost:${port}`));

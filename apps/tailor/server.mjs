// Tailor's local server — runs only on this machine, where the private résumé
// data and Word live. No dependencies.
//
//   node server.mjs        → http://localhost:5177

import { createServer } from "node:http";
import { readFileSync, existsSync, createReadStream } from "node:fs";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, runTailor, rebuildLetter, OUT } from "./tailor-core.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = +(process.env.PORT || 5177);
loadEnv();

const TYPES = { ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".html": "text/html; charset=utf-8" };

const json = (res, code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
const readBody = (req) => new Promise((resolve) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { resolve({}); } }); });

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": TYPES[".html"] });
      return res.end(readFileSync(join(ROOT, "index.html")));
    }
    if (req.method === "GET" && url.pathname.startsWith("/out/")) {
      const rel = normalize(decodeURIComponent(url.pathname.slice(5))).replace(/^([.\\/])+/, "");
      const file = join(OUT, rel);
      if (!file.startsWith(OUT) || !existsSync(file)) { res.writeHead(404); return res.end("not found"); }
      const ext = file.slice(file.lastIndexOf("."));
      res.writeHead(200, { "content-type": TYPES[ext] || "application/octet-stream", "content-disposition": `attachment; filename="${rel.split(/[\\/]/).pop()}"` });
      return createReadStream(file).pipe(res);
    }
    if (req.method === "POST" && url.pathname === "/api/tailor") {
      const { jd, company, role, pass } = await readBody(req);
      const r = await runTailor({ jd, company, role, pass });
      return json(res, 200, r);
    }
    if (req.method === "POST" && url.pathname === "/api/letter") {
      const body = await readBody(req);
      const r = await rebuildLetter(body);
      return json(res, 200, r);
    }
    res.writeHead(404); res.end("not found");
  } catch (e) {
    json(res, 400, { error: String(e.message || e) });
  }
}).listen(PORT, "127.0.0.1", () => console.log(`tailor → http://localhost:${PORT}${process.env.MOCK ? "   (MOCK mode: no model calls)" : ""}`));

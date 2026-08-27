// Shader compile smoke test — forces every hero field mode (Field / Flow /
// Dots / Water / ASCII) to compile in headless Chrome and reports GLSL errors.
// The page compiles extra modes lazily, so a broken Water or ASCII program
// only shows up when a visitor clicks the switcher; this catches it in CI.
//
//   node scripts/shader-smoke.mjs [url]     (default http://127.0.0.1:4321/)
//
// Needs Chrome on the default Windows/macOS path or CHROME env var. Uses raw
// Chrome DevTools Protocol over WebSocket (Node ≥ 22), no puppeteer.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const url = process.argv[2] || "http://127.0.0.1:4321/";
const PORT = 9333;
const candidates = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) { console.error("Chrome not found; set CHROME=path"); process.exit(2); }

const proc = spawn(chrome, [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--no-default-browser-check",
  "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
  "--window-size=1280,800", "--user-data-dir=" + (process.env.TEMP || "/tmp") + "/shader-smoke-profile",
  "about:blank",
], { stdio: "ignore" });
const kill = () => { try { proc.kill(); } catch {} };
process.on("exit", kill);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.length) break; } catch {}
  await sleep(250);
}
const page = targets?.find((t) => t.type === "page");
if (!page) { console.error("no page target"); kill(); process.exit(2); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map(); const logs = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); }
  if (m.method === "Runtime.consoleAPICalled") logs.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Runtime.enable");
await send("Page.enable");
// Wrap compileShader/linkProgram before any page script runs so failures are loud.
await send("Page.addScriptToEvaluateOnNewDocument", { source: `
  (() => {
    const P = WebGLRenderingContext.prototype;
    const cs = P.compileShader, lp = P.linkProgram;
    P.compileShader = function (sh) {
      cs.call(this, sh);
      if (!this.getShaderParameter(sh, this.COMPILE_STATUS)) console.log("SHADER_COMPILE_FAIL " + this.getShaderInfoLog(sh));
      else console.log("SHADER_COMPILE_OK");
    };
    P.linkProgram = function (pg) {
      lp.call(this, pg);
      if (!this.getProgramParameter(pg, this.LINK_STATUS)) console.log("SHADER_LINK_FAIL " + this.getProgramInfoLog(pg));
      else console.log("SHADER_LINK_OK");
    };
  })();` });
await send("Page.navigate", { url });
await sleep(4000);
// Ask for every mode the page knows about (each request compiles it on demand).
for (const m of [1, 2, 3, 4, 0]) {
  await send("Runtime.evaluate", { expression: `dispatchEvent(new CustomEvent("shadermode", { detail: ${m} }))` });
  await sleep(1200);
}
await sleep(1500);
ws.close(); kill();

const fails = logs.filter((l) => /FAIL/.test(l));
const oks = logs.filter((l) => /_OK/.test(l)).length;
console.log(`${oks} successful compiles/links, ${fails.length} failures`);
for (const f of fails) console.log("  " + f.slice(0, 600));
process.exit(fails.length ? 1 : 0);

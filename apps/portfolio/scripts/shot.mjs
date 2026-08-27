// Screenshot a page with headless Chrome via the DevTools protocol.
// Unlike `chrome --screenshot`, this can scroll, force scroll-reveal elements
// visible, wait for fonts, and capture the full page — which is what a site
// built on IntersectionObserver reveals needs.
//
//   node scripts/shot.mjs <url> <out.png> [--full] [--w=1440] [--h=900] [--to=#about] [--light] [--wait=2500]
//
// --full   capture the whole document height (max 8000px)
// --to     scroll to a CSS selector before capturing
// --light  set localStorage bl-mode=light before load
// Chrome path: CHROME env var or the default install locations.

import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const url = args[0]; const out = args[1];
if (!url || !out) { console.error("usage: shot.mjs <url> <out.png> [--full] [--w=] [--h=] [--to=] [--light] [--wait=]"); process.exit(2); }
const opt = Object.fromEntries(args.slice(2).map((a) => { const m = a.match(/^--([^=]+)=?(.*)$/); return m ? [m[1], m[2] === "" ? true : m[2]] : [a, true]; }));
const W = +(opt.w || 1440), H = +(opt.h || 900), WAIT = +(opt.wait || 2500);
const PORT = 9300 + Math.floor(Math.random() * 90);

const chrome = [process.env.CHROME, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].filter(Boolean).find((p) => existsSync(p));
if (!chrome) { console.error("Chrome not found; set CHROME=path"); process.exit(2); }
const proc = spawn(chrome, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--no-default-browser-check", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars", `--window-size=${W},${H}`, "--user-data-dir=" + (process.env.TEMP || "/tmp") + "/shot-profile-" + PORT, "about:blank"], { stdio: "ignore" });
const kill = () => { try { proc.kill(); } catch {} };
process.on("exit", kill);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.length) break; } catch {} await sleep(250); }
const page = targets?.find((t) => t.type === "page");
if (!page) { console.error("no page target"); kill(); process.exit(2); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }))?.result?.value;

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
if (opt.light) await send("Page.addScriptToEvaluateOnNewDocument", { source: `try{localStorage.setItem("bl-mode","light")}catch(e){}` });
await send("Page.navigate", { url });
await sleep(WAIT);
await evaluate(`document.fonts ? document.fonts.ready.then(() => true) : true`);
// force scroll-reveal content visible, then let transitions settle
await evaluate(`document.querySelectorAll(".reveal").forEach(e => e.classList.add("is-in")); document.querySelector(".hero")?.classList.add("lines-open"); true`);
await sleep(900);
// Scrolling is unreliable on pages that run a smooth-scroll library, so any
// region capture (--full / --to / --y) grows the viewport to the whole
// document and clips the region out of it instead of scrolling to it.
let clip;
if (opt.full || opt.to || opt.y !== undefined) {
  const docH = Math.min(8000, await evaluate(`Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)`));
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: docH, deviceScaleFactor: 1, mobile: false });
  await evaluate(`document.querySelectorAll(".reveal").forEach(e => e.classList.add("is-in")); true`);
  await sleep(1200);
  let y = 0, h = docH;
  if (opt.to) {
    y = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(opt.to)}); return el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY) - 24) : 0; })()`);
    h = Math.min(H, docH - y);
  } else if (opt.y !== undefined) { y = +opt.y; h = Math.min(H, docH - y); }
  clip = { x: 0, y, width: W, height: h, scale: 1 };
}
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!opt.full, ...(clip ? { clip } : {}) });
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("wrote", out);
ws.close(); kill(); process.exit(0);

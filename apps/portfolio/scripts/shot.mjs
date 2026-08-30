// Screenshot a page with headless Chrome via the DevTools protocol.
// Unlike `chrome --screenshot`, this can scroll, force scroll-reveal elements
// visible, wait for fonts, and capture the full page — which is what a site
// built on IntersectionObserver reveals needs.
//
//   node scripts/shot.mjs <url> <out.png> [--full] [--w=1440] [--h=900] [--to=#about] [--y=1200] [--light|--dark] [--font=instrument] [--wait=2500]
//
// --full   capture the whole document height (max 8000px)
// --to     clip the capture to start at a CSS selector (no scrolling involved)
// --y      clip the capture to start at a document y offset
// --light / --dark   set localStorage bl-mode before load
// --font   set localStorage bl-font before load (schibsted | instrument)
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
if (opt.dark) await send("Page.addScriptToEvaluateOnNewDocument", { source: `try{localStorage.setItem("bl-mode","dark")}catch(e){}` });
if (opt.font) await send("Page.addScriptToEvaluateOnNewDocument", { source: `try{localStorage.setItem("bl-font",${JSON.stringify(opt.font)})}catch(e){}` });
// --set=key:value  any localStorage entry before load (e.g. --set=bl-intro:name)
if (opt.set) { const [k, ...v] = String(opt.set).split(":"); await send("Page.addScriptToEvaluateOnNewDocument", { source: `try{localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v.join(":"))})}catch(e){}` }); }
await send("Page.navigate", { url });
await sleep(WAIT);
await evaluate(`document.fonts ? document.fonts.ready.then(() => true) : true`);
// force scroll-reveal content visible, then let transitions settle
await evaluate(`document.querySelectorAll(".reveal").forEach(e => e.classList.add("is-in")); document.querySelector(".hero")?.classList.add("lines-open"); true`);
// --hide=selector,selector : make elements invisible before capture (e.g. to photograph the shader alone)
if (opt.hide) await evaluate(`document.querySelectorAll(${JSON.stringify(String(opt.hide))}).forEach(e => e.style.visibility = "hidden"); true`);
await sleep(900);
// Scrolling is unreliable on pages that run a smooth-scroll library, so any
// region capture (--full / --to / --y) grows the viewport to the whole
// document and clips the region out of it instead of scrolling to it.
let clip;
const showReveals = `document.querySelectorAll(".reveal").forEach(e => e.classList.add("is-in")); true`;
if (opt.to || opt.y !== undefined) {
  // a real scroll at the real viewport: resizing the viewport would inflate
  // vh-sized sections and move the target. Smooth scrolling (CSS or a
  // smooth-scroll library) is switched off first so the jump is immediate.
  await evaluate(showReveals);
  await evaluate(`document.documentElement.style.scrollBehavior = "auto"; document.documentElement.classList.remove("lenis-smooth"); true`);
  const y = opt.to
    ? await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(opt.to)}); return el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY) - 24) : 0; })()`)
    : +opt.y;
  await evaluate(`window.scrollTo(0, ${y}); true`);
  await sleep(300);
  await evaluate(`window.scrollTo(0, ${y}); ${showReveals}`);   // again, in case a scroll library re-synced
  await sleep(900);
} else if (opt.full) {
  // freeze vh-sized heroes at their current height, then grow the viewport to the document
  await evaluate(`document.querySelectorAll(".hero, .cs-hero").forEach(e => { const h = e.getBoundingClientRect().height; e.style.minHeight = h + "px"; e.style.height = h + "px"; }); true`);
  const docH = Math.min(8000, await evaluate(`Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)`));
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: docH, deviceScaleFactor: 1, mobile: false });
  await evaluate(showReveals);
  await sleep(1200);
  clip = { x: 0, y: 0, width: W, height: docH, scale: 1 };
}
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!opt.full, ...(clip ? { clip } : {}) });
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("wrote", out);
ws.close(); kill(); process.exit(0);

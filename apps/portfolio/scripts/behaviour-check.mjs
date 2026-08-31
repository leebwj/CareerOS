// Behaviour checks for the polished landing page, in headless Chrome:
//   1. the audience switch reorders the grid in place (no navigation, no scroll jump, URL updated)
//   2. the first batch of cards fills whole rows (columns × 2)
//   3. hovering a company on the holo card swaps the About text for its brief
//
//   node scripts/behaviour-check.mjs [url]     (default http://127.0.0.1:4321/)

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const url = process.argv[2] || "http://127.0.0.1:4321/";
const PORT = 9400 + Math.floor(Math.random() * 90);
const chrome = [process.env.CHROME, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].filter(Boolean).find((p) => existsSync(p));
if (!chrome) { console.error("Chrome not found; set CHROME=path"); process.exit(2); }
const proc = spawn(chrome, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--no-default-browser-check", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--window-size=1440,900", "--user-data-dir=" + (process.env.TEMP || "/tmp") + "/behaviour-profile-" + PORT, "about:blank"], { stdio: "ignore" });
const kill = () => { try { proc.kill(); } catch {} };
process.on("exit", kill);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.length) break; } catch {} await sleep(250); }
const page = targets?.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map(); let navs = 0;
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); } if (m.method === "Page.frameNavigated" && !m.params.frame.parentId) navs++; };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }))?.result?.value;

await send("Page.enable"); await send("Runtime.enable");
// --reduce: run with prefers-reduced-motion so the smooth-scroll library stays out of the measurements
if (process.argv.includes("--reduce")) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await send("Page.navigate", { url }); await sleep(4000);
const navsAfterLoad = navs;
let ok = true;
const check = (name, cond, detail) => { console.log(`${cond ? "✓" : "✗"} ${name}${detail ? "  " + detail : ""}`); if (!cond) ok = false; };

// 2. first batch fills whole rows
const grid = await ev(`(() => { const g = document.getElementById("grid"); const cols = getComputedStyle(g).gridTemplateColumns.split(" ").filter(Boolean).length; const vis = [...g.querySelectorAll("article[data-slug]")].filter(a => !a.hasAttribute("hidden")).length; return { cols, vis, total: g.querySelectorAll("article[data-slug]").length }; })()`);
check("first batch fills whole rows", grid.vis === grid.cols * 2, JSON.stringify(grid));

// 1. audience switch in place
await ev(`document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.getElementById("work").getBoundingClientRect().top + scrollY - 40); true`);
await sleep(400);
// does the page drift on its own before we touch anything?
const drift = await ev(`new Promise((res) => { const a = scrollY; setTimeout(() => res([a, scrollY]), 800); })`);
console.log("  idle drift over 800ms:", drift.join(" → "));
const before = await ev(`({ y: scrollY, first: document.querySelector("#grid article[data-slug]").dataset.slug, path: location.pathname, h: document.documentElement.scrollHeight })`);
const timeline = await ev(`new Promise((res) => { const out = []; const t0 = performance.now(); document.querySelector('#filters [data-view="design"]').click(); out.push([0, scrollY]); const tick = () => { out.push([Math.round(performance.now() - t0), scrollY]); if (performance.now() - t0 < 620) requestAnimationFrame(tick); else res(out); }; requestAnimationFrame(tick); })`);
console.log("  scrollY timeline (ms, y):", timeline.filter((_, i) => i % 6 === 0).map((p) => p.join(":")).join("  "), " scrollHeight before:", before.h, "after:", await ev(`document.documentElement.scrollHeight`));
const after = await ev(`({ y: scrollY, first: document.querySelector("#grid article[data-slug]").dataset.slug, path: location.pathname, pressed: document.querySelector('#filters [aria-pressed="true"]').dataset.view, resume: document.querySelector("[data-resume]").getAttribute("href") })`);
check("switch did not navigate", navs === navsAfterLoad, `navigations: ${navs - navsAfterLoad}`);
check("switch kept the scroll position", Math.abs(after.y - before.y) < 4, `y ${before.y} → ${after.y}`);
check("switch reordered the grid", before.first !== after.first && after.first === "dewey", `${before.first} → ${after.first}`);
check("switch updated the URL", after.path === "/design", after.path);
check("switch updated the résumé link", /Design/.test(after.resume), after.resume);

// 3. about hover swap
// the swap waits ~90ms of hover intent before it commits, so give it that
const hover = await ev(`new Promise((res) => { const a = document.querySelector(".about-card a[href^='/work/']"); a.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false })); setTimeout(() => { const on = document.querySelector(".about-brief.is-on"); const off = document.querySelector(".about-default").classList.contains("is-off"); res({ slug: a.getAttribute("href"), brief: on ? on.dataset.brief : null, off }); }, 220); })`);
check("hovering a company shows its brief", hover.brief && hover.slug.endsWith(hover.brief) && hover.off, JSON.stringify(hover));
await ev(`document.querySelector(".about-card a[href^='/work/']").dispatchEvent(new PointerEvent("pointerleave")); true`);
await sleep(400);
const restored = await ev(`!document.querySelector(".about-default").classList.contains("is-off") && !document.querySelector(".about-brief.is-on")`);
check("leaving restores the description", restored === true);

// 4. the big name reacts to the cursor like the other headings (split into letters, lifted near the pointer)
const kin = await ev(`new Promise((res) => { const h = document.querySelector(".hero-name"); if (!h) return res({ chars: 0 }); window.scrollTo(0, 0); const r = h.getBoundingClientRect(); dispatchEvent(new PointerEvent("pointermove", { clientX: r.left + 40, clientY: r.top + r.height / 2 })); setTimeout(() => { const chars = [...h.querySelectorAll(".ch")]; const lifted = chars.filter((c) => parseFloat(c.style.getPropertyValue("--w") || "0") > 0).length; res({ chars: chars.length, lifted }); }, 200); })`);
check("hero name is cursor-reactive", kin.chars > 0 && kin.lifted > 0, JSON.stringify(kin));

// 5. the type set is Mona Sans + Geist Mono only
const fam = await ev(`({ body: getComputedStyle(document.body).fontFamily, mono: getComputedStyle(document.querySelector(".kicker")).fontFamily })`);
check("type set is Mona Sans + Geist Mono", /Mona Sans/.test(fam.body) && /Geist Mono/.test(fam.mono), `${fam.body} / ${fam.mono}`);

ws.close(); kill();
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);

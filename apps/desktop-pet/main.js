// CareerOS · desktop-pet — the character face of the secretary.
// A transparent, frameless, always-on-top, CLICK-THROUGH window that sits in
// the bottom-right corner. Only the character sprite + speech bubble are
// interactive; the rest of the window passes clicks through to your desktop.
//
// It fetches the live brief the role-grabber publishes and pops it in a speech
// bubble on launch and every morning at BRIEF_HOUR, so opening your laptop is
// enough to see what is new. Launches at login.
//
// This is a working scaffold — swap the placeholder character in index.html
// for your own art. Run: npm install && npm start

const { app, BrowserWindow, ipcMain, screen, shell, Tray, Menu, nativeImage, Notification } = require("electron");
const { join } = require("node:path");
const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { pathToFileURL } = require("node:url");

// LIVE, not local. This used to read apps/secretary/out/brief.md off disk — but
// the grabber and the brief both run on GitHub Actions now, so that file only
// changes when someone runs the script by hand, and the pet was cheerfully
// reporting days-old numbers as if they were today's. brief.json is rewritten
// 4x/day by the bot and is ~2KB, so fetching it on every launch costs nothing.
const BRIEF_URL = "https://raw.githubusercontent.com/leebwj/CareerOS/main/apps/role-grabber/data/brief.json";
const BRIEF_HOUR = 8; // 8am local — the second pop of the day

let win;
let tray;
// The character is opt-in. Brian asked for this to live in the taskbar tray
// instead of floating on the desktop, so the tray is the primary surface and
// the pet only appears when summoned.
let petVisible = false;

// ── what has already been seen ───────────────────────────────────────────────
// Totals repeat themselves; deltas do not. Remembering which role URLs have
// been shown turns "67 hot" into "3 new since you last looked", and is also
// what stops a notification firing twice for the same posting.
let seenPath = "";
let seen = { urls: [], lastOpened: null };
function loadSeen() {
  try { seen = JSON.parse(readFileSync(seenPath, "utf8")); }
  catch { seen = { urls: [], lastOpened: null }; }
  if (!Array.isArray(seen.urls)) seen.urls = [];
}
function saveSeen() {
  // keep it bounded — this file is read and written on every refresh
  seen.urls = seen.urls.slice(-400);
  try { writeFileSync(seenPath, JSON.stringify(seen)); } catch { /* never fatal */ }
}

// ── Brian's own tracker ──────────────────────────────────────────────────────
// The feed says what exists; only the tracker says what HE has done. Reads the
// same Google Sheet endpoint the secretary uses, from the secretary's gitignored
// config — so nothing secret lives in this app and it degrades to feed-only if
// the config is absent.
let sheetUrl = null;
async function loadSheetUrl() {
  const cfg = join(__dirname, "..", "secretary", "config.mjs");
  if (!existsSync(cfg)) return null;
  try { sheetUrl = (await import(pathToFileURL(cfg).href)).default?.sheetUrl || null; }
  catch { sheetUrl = null; }
  return sheetUrl;
}
async function readTracker() {
  if (!sheetUrl) return null;
  try {
    const r = await fetch(sheetUrl, { redirect: "follow" });
    if (!r.ok) return null;
    const d = JSON.parse(await r.text());
    const st = d && d.state ? JSON.parse(d.state) : null;
    if (!st || !st.s) return null;
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    let due = 0, interviews = 0, appliedWeek = 0, live = 0;
    const soon = [];
    for (const [k, v] of Object.entries(st.s)) {
      if (!v.st) continue;
      if (v.st === "Applied") live++;
      if (v.st === "Applied" && v.fu && v.fu <= today) due++;
      if (v.date && v.date >= weekAgo) appliedWeek++;
      if ((v.st === "Interview" || v.st === "OA / Screen")) {
        interviews++;
        if (v.idate && v.idate >= today) soon.push({ when: v.idate, what: k.split("|")[0] });
      }
    }
    soon.sort((a, b) => a.when.localeCompare(b.when));
    return { due, interviews, appliedWeek, live, soon: soon.slice(0, 3) };
  } catch { return null; }
}

async function readBrief() {
  try {
    const r = await fetch(BRIEF_URL, { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return { ok: true, data: await r.json() };
  } catch (e) {
    // a laptop that just woke up is often offline for a few seconds — say so
    // plainly rather than showing stale numbers as though they were current
    return { ok: false, error: String(e.message || e) };
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // H is generous because the brief now lists real roles; the bubble caps
  // itself at 100vh so it can never overflow whatever this is set to.
  const W = 380, H = 560;
  win = new BrowserWindow({
    width: W,
    height: H,
    x: width - W - 12,
    y: height - H - 12,
    show: false,          // tray-first: summoned, not always floating
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setAlwaysOnTop(true, "screen-saver");
  // Surface renderer errors in the terminal. A transparent frameless window
  // shows nothing when its script throws — it just sits there looking fine —
  // so without this a runtime error is completely invisible.
  win.webContents.on("console-message", (_e, level, message, line, source) => {
    console.log(`[renderer${level >= 2 ? " ERROR" : ""}] ${message}${line ? ` (${String(source).split(/[\\/]/).pop()}:${line})` : ""}`);
  });
  win.webContents.on("render-process-gone", (_e, d) => console.log("[renderer gone]", d.reason));
  if (process.env.PET_DEVTOOLS) win.webContents.openDevTools({ mode: "detach" });
  // One line saying whether the bubble actually rendered. A transparent window
  // that silently shows nothing is the failure mode here, so make it visible.
  win.webContents.on("did-finish-load", () => {
    setTimeout(() => win.webContents.executeJavaScript(
      `(() => { const b = document.getElementById("bubble"), r = b.getBoundingClientRect();
         return { shown: b.classList.contains("show"),
                  roles: document.querySelectorAll("#content .role").length,
                  top: Math.round(r.top), bottom: Math.round(r.bottom),
                  clipped: r.top < 0 || r.bottom > innerHeight,
                  scrolls: b.scrollHeight > b.clientHeight + 1 }; })()`
    ).then((s) => console.log(
      `[pet] bubble ${s.shown ? "SHOWN" : "hidden"} · ${s.roles} roles · top=${s.top} bottom=${s.bottom} · ${s.clipped ? "CLIPPED" : "fits"}${s.scrolls ? " (scrolls)" : ""}`
    )).catch(() => {}), 1500);
  });
  win.loadFile("index.html");
  // start fully click-through; the renderer toggles interactivity per-region
  win.setIgnoreMouseEvents(true, { forward: true });
}

// renderer asks to become interactive (pointer over sprite/bubble) or not
ipcMain.on("set-clickthrough", (_e, ignore) => {
  if (win) win.setIgnoreMouseEvents(ignore, { forward: true });
});
ipcMain.handle("get-brief", async () => lastState || await refreshTray({ notify: false }));
// links open in the real browser, never inside the transparent pet window
ipcMain.on("hide-pet", () => hidePet());
ipcMain.on("open-url", (_e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); });

// schedule the morning pop: check every 5 min, fire once when the hour flips
let lastFired = "";
async function scheduleTick() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  if (now.getHours() === BRIEF_HOUR && lastFired !== stamp) {
    lastFired = stamp;
    showPet(await refreshTray());
  }
}

// Launch at login — the whole point is that opening the laptop is enough. Set
// on every start so it survives the app being moved or reinstalled.
//
// The bare call registers electron.exe with NO arguments while running
// unpackaged (`electron .`), which on next login opens Electron's own welcome
// app instead of this one — verified in the registry, it really does this. So
// pass the app directory explicitly. Once this is packaged into a real .exe,
// process.execPath IS the app and the extra arg is harmless.
function setLaunchOnLogin() {
  if (process.platform === "linux") return;            // no standard mechanism
  try {
    const packaged = app.isPackaged;
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: false,
      path: process.execPath,
      args: packaged ? [] : [app.getAppPath()],
    });
  } catch { /* never let a startup preference stop the app running */ }
}

// ── system tray ──────────────────────────────────────────────────────────────
// Lives next to the clock rather than floating over the desktop. The tooltip
// carries the headline numbers, so hovering answers "anything new?" without
// opening anything at all — which is the actual ask.
function showPet(res) {
  if (!win) return;
  petVisible = true;
  win.showInactive();                       // appear without stealing focus
  win.webContents.send("show-brief", res);
  markSeen(res);
  // the badge should clear the moment he has actually looked
  setTimeout(() => refreshTray({ notify: false }), 300);
}
function hidePet() { petVisible = false; if (win) win.hide(); }

const iconFor = (name) => {
  const p = join(__dirname, "assets", name === "idle" ? "tray.png" : `tray-${name}.png`);
  const img = nativeImage.createFromPath(p);
  return img.isEmpty() ? nativeImage.createEmpty() : img;
};

// Only interrupt for something that is genuinely time-critical: a role at a
// TARGET company, in the current cycle, that has not been seen before. Anything
// looser and the notifications become wallpaper and get muted.
function notifyNew(roles) {
  if (!Notification.isSupported() || !roles.length) return;
  const r = roles[0];
  const more = roles.length - 1;
  const n = new Notification({
    title: more > 0 ? `${roles.length} new roles at target companies` : "New role at a target company",
    body: `${r.company} — ${r.title}${more > 0 ? `\n…and ${more} more` : ""}`,
    silent: false,
  });
  n.on("click", () => { if (r.url) shell.openExternal(r.url); });
  n.show();
}

// One place that knows everything: the feed, Brian's tracker, and what is new
// since he last looked. Tray icon, tooltip and bubble all render from this.
let lastState = null;
async function refreshTray({ notify = true } = {}) {
  const res = await readBrief();
  const tracker = await readTracker();

  let fresh = [];
  if (res.ok) {
    const top = Array.isArray(res.data.top) ? res.data.top : [];
    fresh = top.filter((t) => t.url && t.cycle && !seen.urls.includes(t.url));
  }

  const due = tracker?.due || 0;
  // amber wins: a follow-up you are already late on costs more than a role you
  // have not applied to yet
  const state = due > 0 ? "due" : fresh.length ? "new" : "idle";

  if (tray) {
    tray.setImage(iconFor(state));
    if (!res.ok) tray.setToolTip("CareerOS — offline");
    else {
      const b = res.data;
      tray.setToolTip([
        `CareerOS · ${b.cycle || "roles"}`,
        `${b.cycleRoles ?? 0} this cycle · ${b.cycleTargets ?? 0} at target companies`,
        fresh.length ? `${fresh.length} new since you last looked` : `${b.hot ?? 0} hot · ${b.fresh ?? 0} in 48h`,
        tracker ? `${tracker.live} live applications · ${due} follow-up${due === 1 ? "" : "s"} due` : "",
      ].filter(Boolean).join("\n"));
    }
  }

  if (notify && fresh.length) notifyNew(fresh);
  lastState = { ...res, tracker, fresh };
  console.log(`[pet] ${state} · ${fresh.length} new · ${tracker ? `${tracker.live} live, ${due} due, ${tracker.interviews} interviewing` : "tracker unavailable"}`);
  return lastState;
}

// Called when the bubble is actually shown — only then has he "looked".
function markSeen(st) {
  if (!st || !st.ok) return;
  const top = Array.isArray(st.data.top) ? st.data.top : [];
  for (const t of top) if (t.url && !seen.urls.includes(t.url)) seen.urls.push(t.url);
  seen.lastOpened = new Date().toISOString();
  saveSeen();
}

function buildTray() {
  tray = new Tray(iconFor("idle"));
  tray.setToolTip("CareerOS");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Show today's brief", click: async () => showPet(await refreshTray()) },
    { label: "Hide", click: hidePet },
    { type: "separator" },
    { label: "Open tracker", click: () => shell.openExternal("https://leebrian.dev/tracker") },
    { label: "Open prep", click: () => shell.openExternal("https://leebrian.dev/prep") },
    { type: "separator" },
    {
      label: "Start at login", type: "checkbox",
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        if (item.checked) setLaunchOnLogin();
        else app.setLoginItemSettings({ openAtLogin: false });
      },
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]));
  // left click toggles the character + bubble
  tray.on("click", async () => { petVisible ? hidePet() : showPet(await refreshTray()); });
}

app.whenReady().then(async () => {
  seenPath = join(app.getPath("userData"), "seen.json");
  loadSeen();
  await loadSheetUrl();
  console.log(`[pet] tracker ${sheetUrl ? "configured" : "NOT configured (feed-only — add sheetUrl to apps/secretary/config.mjs)"} · ${seen.urls.length} roles already seen`);
  setLaunchOnLogin();
  createWindow();
  buildTray();
  // first run must not toast for a board he has simply never opened
  const first = seen.urls.length === 0;
  await refreshTray({ notify: !first });
  if (first) { markSeen(lastState); await refreshTray({ notify: false }); }
  setInterval(scheduleTick, 5 * 60 * 1000);
  setInterval(() => refreshTray(), 10 * 60 * 1000);   // notice new roles during the day
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
// A tray app must NOT die when its window closes — that is the whole point.
app.on("window-all-closed", () => {});

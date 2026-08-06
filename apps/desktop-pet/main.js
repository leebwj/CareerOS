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

const { app, BrowserWindow, ipcMain, screen, shell } = require("electron");
const { join } = require("node:path");

// LIVE, not local. This used to read apps/secretary/out/brief.md off disk — but
// the grabber and the brief both run on GitHub Actions now, so that file only
// changes when someone runs the script by hand, and the pet was cheerfully
// reporting days-old numbers as if they were today's. brief.json is rewritten
// 4x/day by the bot and is ~2KB, so fetching it on every launch costs nothing.
const BRIEF_URL = "https://raw.githubusercontent.com/leebwj/CareerOS/main/apps/role-grabber/data/brief.json";
const BRIEF_HOUR = 8; // 8am local — the second pop of the day

let win;

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
ipcMain.handle("get-brief", () => readBrief());
// links open in the real browser, never inside the transparent pet window
ipcMain.on("open-url", (_e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); });

// schedule the morning pop: check every 5 min, fire once when the hour flips
let lastFired = "";
async function scheduleTick() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  if (now.getHours() === BRIEF_HOUR && lastFired !== stamp) {
    lastFired = stamp;
    if (win) win.webContents.send("show-brief", await readBrief());
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

app.whenReady().then(() => {
  setLaunchOnLogin();
  createWindow();
  setInterval(scheduleTick, 5 * 60 * 1000);
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

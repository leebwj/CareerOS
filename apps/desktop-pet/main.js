// CareerOS · desktop-pet — the character face of the secretary.
// A transparent, frameless, always-on-top, CLICK-THROUGH window that sits in
// the bottom-right corner. Only the character sprite + speech bubble are
// interactive; the rest of the window passes clicks through to your desktop.
//
// It reads the secretary's brief (apps/secretary/out/brief.md) and pops it in
// a speech bubble on launch and every morning at BRIEF_HOUR.
//
// This is a working scaffold — swap the placeholder character in index.html
// for your own art. Run: npm install && npm start

const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const BRIEF_PATH = join(__dirname, "..", "secretary", "out", "brief.md");
const BRIEF_HOUR = 8; // 8am local

let win;

function readBrief() {
  try {
    return readFileSync(BRIEF_PATH, "utf8");
  } catch {
    return "# ☀️ Morning brief\n\nNo brief yet — run the secretary:\n`node apps/secretary/run.mjs`\n\nThen I'll have something to tell you!";
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const W = 380, H = 460;
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
  win.loadFile("index.html");
  // start fully click-through; the renderer toggles interactivity per-region
  win.setIgnoreMouseEvents(true, { forward: true });
}

// renderer asks to become interactive (pointer over sprite/bubble) or not
ipcMain.on("set-clickthrough", (_e, ignore) => {
  if (win) win.setIgnoreMouseEvents(ignore, { forward: true });
});
ipcMain.handle("get-brief", () => readBrief());

// schedule the morning pop: check every 5 min, fire once when the hour flips
let lastFired = "";
function scheduleTick() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  if (now.getHours() === BRIEF_HOUR && lastFired !== stamp) {
    lastFired = stamp;
    if (win) win.webContents.send("show-brief", readBrief());
  }
}

app.whenReady().then(() => {
  createWindow();
  setInterval(scheduleTick, 5 * 60 * 1000);
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

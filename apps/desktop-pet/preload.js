// Safe bridge between the renderer and the main process.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pet", {
  getBrief: () => ipcRenderer.invoke("get-brief"),
  onShowBrief: (cb) => ipcRenderer.on("show-brief", (_e, res) => cb(res)),
  // open links in the real browser — the pet window is transparent and frameless
  openUrl: (url) => ipcRenderer.send("open-url", url),
  hidePet: () => ipcRenderer.send("hide-pet"),
  // toggle window click-through as the pointer enters/leaves interactive regions
  setInteractive: (on) => ipcRenderer.send("set-clickthrough", !on),
});

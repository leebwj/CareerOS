// Safe bridge between the renderer and the main process.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pet", {
  getBrief: () => ipcRenderer.invoke("get-brief"),
  onShowBrief: (cb) => ipcRenderer.on("show-brief", (_e, md) => cb(md)),
  // toggle window click-through as the pointer enters/leaves interactive regions
  setInteractive: (on) => ipcRenderer.send("set-clickthrough", !on),
});

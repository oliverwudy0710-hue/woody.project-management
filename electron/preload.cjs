const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopUpdater', {
  getVersion: () => ipcRenderer.invoke('desktop-updater:get-version'),
  checkForUpdates: () => ipcRenderer.invoke('desktop-updater:check'),
  downloadAndInstall: () => ipcRenderer.invoke('desktop-updater:download-and-install'),
  onStatus: (listener) => {
    const wrapped = (_event, payload) => listener(payload)
    ipcRenderer.on('desktop-updater:status', wrapped)
    return () => ipcRenderer.removeListener('desktop-updater:status', wrapped)
  },
})

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopReport', {
  onScheduledFeishuReport: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('feishu:scheduled-trigger', handler)
    return () => ipcRenderer.removeListener('feishu:scheduled-trigger', handler)
  },
  updateSchedule: (sendTimeLocal) => ipcRenderer.invoke('feishu:update-schedule', { sendTimeLocal }),
  sendFeishuMessage: (payload) => ipcRenderer.invoke('feishu:send-message', payload),
})

const path = require('node:path')
const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')

const DEV_URL = 'http://localhost:5175'

/** @type {BrowserWindow | null} */
let mainWindow = null

function sendUpdaterStatus(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('desktop-updater:status', payload)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 680,
    show: false,
    title: 'Woody Task Manager',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  } else {
    mainWindow.loadURL(DEV_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function wireAutoUpdater() {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('checking-for-update', () => {
    sendUpdaterStatus({ stage: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    sendUpdaterStatus({
      stage: 'available',
      version: info.version,
      releaseDate: info.releaseDate,
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendUpdaterStatus({ stage: 'idle' })
  })

  autoUpdater.on('download-progress', (progress) => {
    sendUpdaterStatus({
      stage: 'downloading',
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: progress.bytesPerSecond,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdaterStatus({
      stage: 'ready',
      version: info.version,
    })
  })

  autoUpdater.on('error', (error) => {
    sendUpdaterStatus({
      stage: 'error',
      message: error?.message ?? String(error),
    })
  })
}

ipcMain.handle('desktop-updater:get-version', () => app.getVersion())

ipcMain.handle('desktop-updater:check', async () => {
  if (!app.isPackaged) {
    sendUpdaterStatus({
      stage: 'error',
      message: '开发模式不检查更新，请使用打包后的桌面应用验证自动更新。',
    })
    return { ok: false }
  }
  await autoUpdater.checkForUpdates()
  return { ok: true }
})

ipcMain.handle('desktop-updater:download-and-install', async () => {
  if (!app.isPackaged) {
    return { ok: false, message: '开发模式不支持自动安装更新' }
  }
  await autoUpdater.downloadUpdate()
  setTimeout(() => {
    autoUpdater.quitAndInstall(false, true)
  }, 300)
  return { ok: true }
})

app.whenReady().then(async () => {
  wireAutoUpdater()
  createWindow()
  if (app.isPackaged) {
    try {
      await autoUpdater.checkForUpdates()
    } catch {
      // errors are already emitted on `error` event
    }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

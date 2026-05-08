const path = require('node:path')
const { app, BrowserWindow, ipcMain } = require('electron')

const DEV_URL = 'http://localhost:5175'
const DEFAULT_SEND_TIME_LOCAL = '18:00'

/** @type {BrowserWindow | null} */
let mainWindow = null
/** @type {NodeJS.Timeout | null} */
let sendTimer = null
let scheduleTimeLocal = DEFAULT_SEND_TIME_LOCAL

function parseSendTimeLocal(raw) {
  const m = String(raw ?? '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return DEFAULT_SEND_TIME_LOCAL
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return DEFAULT_SEND_TIME_LOCAL
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function nextTriggerDelayMs(sendTimeLocal) {
  const now = new Date()
  const [h, m] = sendTimeLocal.split(':').map(Number)
  const next = new Date(now)
  next.setHours(h, m, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return Math.max(1000, next.getTime() - now.getTime())
}

function emitScheduledTrigger() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('feishu:scheduled-trigger')
}

function scheduleDailyReportTick() {
  if (sendTimer) {
    clearTimeout(sendTimer)
    sendTimer = null
  }
  const delay = nextTriggerDelayMs(scheduleTimeLocal)
  sendTimer = setTimeout(() => {
    emitScheduledTrigger()
    scheduleDailyReportTick()
  }, delay)
}

async function sendFeishuWebhookMessage(payload) {
  const webhookUrl = String(payload?.webhookUrl ?? '').trim()
  const text = String(payload?.text ?? '').trim()
  if (!webhookUrl) {
    return { ok: false, error: 'Webhook URL 为空' }
  }
  if (!text) {
    return { ok: false, error: '日报内容为空' }
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: { text },
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, error: errText || `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
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
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
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

app.whenReady().then(() => {
  ipcMain.handle('feishu:update-schedule', async (_, args) => {
    scheduleTimeLocal = parseSendTimeLocal(args?.sendTimeLocal)
    scheduleDailyReportTick()
    return { ok: true }
  })
  ipcMain.handle('feishu:send-message', async (_, payload) => sendFeishuWebhookMessage(payload))
  createWindow()
  scheduleDailyReportTick()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
  if (sendTimer) {
    clearTimeout(sendTimer)
    sendTimer = null
  }
})

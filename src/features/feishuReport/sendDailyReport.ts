import { buildDailyReport } from './buildDailyReport'
import { getActivityEntriesForDate } from '../../stores/activityLogStore'
import { useAssistantSettingsStore } from '../../stores/assistantSettingsStore'
import { useFeishuReportStore } from '../../stores/feishuReportStore'
import { useTaskStore } from '../../stores/taskStore'
import { todayISODate } from '../../utils/dateFilter'

export interface SendDailyReportOptions {
  force?: boolean
  ignoreEnabled?: boolean
}

export interface SendDailyReportResult {
  ok: boolean
  reason?: string
  reportText?: string
}

export async function sendDailyReport(options?: SendDailyReportOptions): Promise<SendDailyReportResult> {
  const today = todayISODate()
  const feishu = useFeishuReportStore.getState()
  if (!options?.ignoreEnabled && !feishu.enabled) {
    return { ok: false, reason: '飞书日报未启用' }
  }
  if (!options?.force && feishu.lastSentDate === today) {
    return { ok: false, reason: '今日已发送过日报' }
  }
  const webhookUrl = feishu.webhookUrl.trim()
  if (!webhookUrl) {
    return { ok: false, reason: '请先填写飞书机器人 Webhook URL' }
  }
  const desktop = window.desktopReport
  if (!desktop) {
    return { ok: false, reason: '当前非桌面环境，无法通过主进程发送飞书请求' }
  }

  const ai = useAssistantSettingsStore.getState()
  if (!ai.apiKey.trim()) {
    return { ok: false, reason: '请先在个性化与模型中填写 API Key' }
  }
  const tasks = useTaskStore.getState().tasks
  const activities = getActivityEntriesForDate(today)
  const reportText = await buildDailyReport({
    date: today,
    tasks,
    activities,
    ai,
  })

  const sendResult = await desktop.sendFeishuMessage({
    webhookUrl,
    text: reportText,
  })
  if (!sendResult.ok) {
    return { ok: false, reason: sendResult.error ?? '飞书发送失败', reportText }
  }

  useFeishuReportStore.getState().setFeishuReportSettings({ lastSentDate: today })
  return { ok: true, reportText }
}

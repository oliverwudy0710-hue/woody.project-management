import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const STORAGE_KEY = 'taskApp_feishu_report'

export interface FeishuReportState {
  enabled: boolean
  webhookUrl: string
  /** 本地时区 HH:mm */
  sendTimeLocal: string
  /** 最近成功发送日报的本地日 YYYY-MM-DD */
  lastSentDate: string
  setFeishuReportSettings: (patch: Partial<Omit<FeishuReportState, 'setFeishuReportSettings'>>) => void
}

const defaults: Omit<FeishuReportState, 'setFeishuReportSettings'> = {
  enabled: false,
  webhookUrl: '',
  sendTimeLocal: '18:00',
  lastSentDate: '',
}

function normalizeSendTimeLocal(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return defaults.sendTimeLocal
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return defaults.sendTimeLocal
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export const useFeishuReportStore = create<FeishuReportState>()(
  persist(
    (set) => ({
      ...defaults,
      setFeishuReportSettings: (patch) =>
        set((s) => ({
          ...s,
          ...patch,
          sendTimeLocal:
            patch.sendTimeLocal === undefined ? s.sendTimeLocal : normalizeSendTimeLocal(patch.sendTimeLocal),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

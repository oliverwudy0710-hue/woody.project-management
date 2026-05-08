export interface FeishuMessagePayload {
  webhookUrl: string
  text: string
}

export interface DesktopReportBridge {
  onScheduledFeishuReport: (cb: () => void) => () => void
  updateSchedule: (sendTimeLocal: string) => Promise<{ ok: boolean; error?: string }>
  sendFeishuMessage: (payload: FeishuMessagePayload) => Promise<{ ok: boolean; error?: string }>
}

declare global {
  interface Window {
    desktopReport?: DesktopReportBridge
  }
}

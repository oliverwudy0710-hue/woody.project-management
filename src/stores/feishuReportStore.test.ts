import { beforeEach, describe, expect, it } from 'vitest'
import { useFeishuReportStore } from './feishuReportStore'

describe('feishuReportStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useFeishuReportStore.setState({
      enabled: false,
      webhookUrl: '',
      sendTimeLocal: '18:00',
      lastSentDate: '',
    })
  })

  it('normalizes valid send time', () => {
    useFeishuReportStore.getState().setFeishuReportSettings({ sendTimeLocal: '6:05' })
    expect(useFeishuReportStore.getState().sendTimeLocal).toBe('06:05')
  })

  it('falls back to default when send time invalid', () => {
    useFeishuReportStore.getState().setFeishuReportSettings({ sendTimeLocal: '66:99' })
    expect(useFeishuReportStore.getState().sendTimeLocal).toBe('18:00')
  })
})

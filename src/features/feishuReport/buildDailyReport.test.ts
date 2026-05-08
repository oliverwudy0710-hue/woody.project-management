import { describe, expect, it } from 'vitest'
import { buildDailyReport } from './buildDailyReport'
import type { Task } from '../tasks/types'

function makeTask(title: string): Task {
  return {
    id: `id-${title}`,
    title,
    description: '',
    priority: 'medium',
    domain: 'work',
    category: '',
    attachments: [],
    createdAt: '2026-05-08T09:00:00.000Z',
    implementationStart: '2026-05-08',
    implementationEnd: '2026-05-10',
    progressPercent: 30,
    status: 'in_progress',
    progressLog: [],
  }
}

describe('buildDailyReport', () => {
  it('returns fallback report when model call fails', async () => {
    const text = await buildDailyReport({
      date: '2026-05-08',
      tasks: [makeTask('准备周会材料')],
      activities: [],
      ai: {
        baseUrl: 'https://invalid.example.com',
        chatPath: '/v1/chat/completions',
        apiKey: '',
        model: 'deepseek-chat',
        useDevProxy: false,
      },
    })

    expect(text).toContain('今日完成')
    expect(text).toContain('明日计划')
    expect(text).toContain('阻碍')
  })
})

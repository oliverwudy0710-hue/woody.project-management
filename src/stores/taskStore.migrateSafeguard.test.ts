import { describe, expect, it } from 'vitest'
import { resolveMigrationSlice } from './taskStore'

function rawWithTasks() {
  return JSON.stringify({
    state: {
      tasks: [
        {
          id: 't-1',
          title: '保留任务',
          description: '',
          priority: 'medium',
          domain: 'work',
          category: '前端',
          createdAt: '2026-05-08T00:00:00.000Z',
          implementationStart: '2026-05-08',
          implementationEnd: '2026-05-08',
          progressPercent: 0,
          status: 'not_started',
          progressLog: [],
          attachments: [],
        },
      ],
      tagPresets: { work: ['前端'], life: [], study: [] },
      timeGranularity: 'month',
      referenceDate: '2026-05-08',
      customWindowStart: '2026-05-01',
      customWindowEnd: '2026-05-31',
    },
    version: 5,
  })
}

describe('resolveMigrationSlice', () => {
  it('restores tasks from raw storage when normalized tasks become empty', () => {
    const persisted = {
      tagPresets: { work: ['前端'], life: [], study: [] },
      timeGranularity: 'month',
      referenceDate: '2026-05-08',
      customWindowStart: '2026-05-01',
      customWindowEnd: '2026-05-31',
    }
    const out = resolveMigrationSlice(persisted, rawWithTasks())
    expect(out.usedSafeguard).toBe(true)
    expect(out.slice.tasks).toHaveLength(1)
    expect(out.slice.tasks[0].title).toBe('保留任务')
  })

  it('keeps empty when raw storage also has no tasks', () => {
    const persisted = {
      tasks: [],
      tagPresets: { work: [], life: [], study: [] },
      timeGranularity: 'month',
      referenceDate: '2026-05-08',
      customWindowStart: '2026-05-01',
      customWindowEnd: '2026-05-31',
    }
    const out = resolveMigrationSlice(persisted, JSON.stringify({ state: persisted, version: 5 }))
    expect(out.usedSafeguard).toBe(false)
    expect(out.slice.tasks).toHaveLength(0)
  })
})

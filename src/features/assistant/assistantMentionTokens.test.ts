import { describe, expect, it } from 'vitest'
import {
  formatTaskMention,
  parseLinkedTaskIdsFromText,
  stripMentionForTaskId,
} from './assistantMentionTokens'
import type { Task } from '../tasks/types'

const baseTask = (over: Partial<Task> & Pick<Task, 'id' | 'title'>): Task => ({
  id: over.id,
  title: over.title,
  description: over.description ?? '',
  priority: over.priority ?? 'medium',
  domain: over.domain ?? 'work',
  category: over.category ?? '',
  attachments: [],
  createdAt: over.createdAt ?? '2026-01-01T00:00:00.000Z',
  implementationStart: over.implementationStart ?? '2026-01-01',
  implementationEnd: over.implementationEnd ?? '2026-01-07',
  progressPercent: over.progressPercent ?? 0,
  status: over.status ?? 'not_started',
  progressLog: over.progressLog ?? [],
})

describe('assistantMentionTokens', () => {
  const id = '11111111-1111-1111-1111-111111111111'
  const tasks = [baseTask({ id, title: '任务A' })]

  it('formats title-only token and parses to id', () => {
    const raw = `hello ${formatTaskMention('任务A')} done`
    expect(raw).toContain('@[任务A]')
    expect(raw).not.toContain('task:')
    expect(parseLinkedTaskIdsFromText(raw, tasks)).toEqual([id])
  })

  it('dedupes repeated mentions', () => {
    const m = formatTaskMention('任务A')
    expect(parseLinkedTaskIdsFromText(`${m} ${m}`, tasks)).toEqual([id])
  })

  it('stripMentionForTaskId removes token', () => {
    const m = formatTaskMention('任务A')
    const s = stripMentionForTaskId(`x ${m} y`, id, tasks)
    expect(s.replace(/\s+/g, ' ').trim()).toBe('x y')
    expect(parseLinkedTaskIdsFromText(s, tasks)).toEqual([])
  })

  it('escapes bracket in title', () => {
    const t2 = baseTask({ id: '22222222-2222-2222-2222-222222222222', title: 'a]b' })
    const all = [t2]
    const m = formatTaskMention('a]b')
    expect(m).toBe('@[a›b]')
    expect(parseLinkedTaskIdsFromText(`see ${m}`, all)).toEqual([t2.id])
  })
})

import { describe, expect, it } from 'vitest'
import { filterTasksByDomain, filterTasksByTag } from './taskSortFilter'
import type { Task } from '../features/tasks/types'

function t(p: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    title: 'x',
    description: '',
    priority: 'medium',
    domain: 'work',
    category: '',
    createdAt: '2025-01-01',
    implementationStart: '2025-01-01',
    implementationEnd: '2025-01-02',
    progressPercent: 0,
    status: 'not_started',
    progressLog: [],
    attachments: [],
    ...p,
  }
}

describe('filterTasksByDomain', () => {
  const tasks = [
    t({ id: 'a', domain: 'work' }),
    t({ id: 'b', domain: 'life' }),
    t({ id: 'c', domain: 'study' }),
  ]

  it('returns all when filter is all', () => {
    expect(filterTasksByDomain(tasks, 'all')).toHaveLength(3)
  })

  it('filters by domain', () => {
    expect(filterTasksByDomain(tasks, 'life').map((x) => x.id)).toEqual(['b'])
  })
})

describe('filterTasksByTag', () => {
  const tasks = [t({ id: 'a', category: '前端' }), t({ id: 'b', category: '后端' })]

  it('returns all when tag empty', () => {
    expect(filterTasksByTag(tasks, '')).toHaveLength(2)
  })

  it('filters by sub-tag', () => {
    expect(filterTasksByTag(tasks, '前端').map((x) => x.id)).toEqual(['a'])
  })
})

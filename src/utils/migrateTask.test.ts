import { describe, expect, it } from 'vitest'
import { migrateTask } from './migrateTask'

describe('migrateTask', () => {
  it('maps legacy builtin 工作 to work domain and empty sub-tag', () => {
    const t = migrateTask({
      id: '1',
      title: 'A',
      category: '工作',
      implementationStart: '2025-01-01',
      implementationEnd: '2025-01-02',
      status: 'not_started',
    })
    expect(t.domain).toBe('work')
    expect(t.category).toBe('')
  })

  it('maps 个人 and 生活 to life domain', () => {
    const a = migrateTask({
      id: '1',
      title: 'A',
      category: '个人',
      implementationStart: '2025-01-01',
      implementationEnd: '2025-01-02',
      status: 'not_started',
    })
    expect(a.domain).toBe('life')
    const b = migrateTask({
      id: '2',
      title: 'B',
      category: '生活',
      implementationStart: '2025-01-01',
      implementationEnd: '2025-01-02',
      status: 'not_started',
    })
    expect(b.domain).toBe('life')
    expect(b.category).toBe('')
  })

  it('maps 学习 to study', () => {
    const t = migrateTask({
      id: '1',
      title: 'A',
      category: '学习',
      implementationStart: '2025-01-01',
      implementationEnd: '2025-01-02',
      status: 'not_started',
    })
    expect(t.domain).toBe('study')
    expect(t.category).toBe('')
  })

  it('maps custom category to work domain and keeps sub-tag', () => {
    const t = migrateTask({
      id: '1',
      title: 'A',
      category: '前端',
      implementationStart: '2025-01-01',
      implementationEnd: '2025-01-02',
      status: 'not_started',
    })
    expect(t.domain).toBe('work')
    expect(t.category).toBe('前端')
  })

  it('preserves explicit domain and sub-tag', () => {
    const t = migrateTask({
      id: '1',
      title: 'A',
      domain: 'life',
      category: '健身',
      implementationStart: '2025-01-01',
      implementationEnd: '2025-01-02',
      status: 'not_started',
    })
    expect(t.domain).toBe('life')
    expect(t.category).toBe('健身')
  })
})

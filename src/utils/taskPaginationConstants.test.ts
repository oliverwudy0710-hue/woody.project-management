import { describe, expect, it } from 'vitest'
import { clampTaskPageSize, DEFAULT_TASK_PAGE_SIZE } from '../features/tasks/taskPaginationConstants'

describe('clampTaskPageSize', () => {
  it('returns preset when valid', () => {
    expect(clampTaskPageSize(12)).toBe(12)
    expect(clampTaskPageSize(96)).toBe(96)
  })

  it('falls back to default for invalid', () => {
    expect(clampTaskPageSize(2)).toBe(DEFAULT_TASK_PAGE_SIZE)
    expect(clampTaskPageSize(undefined)).toBe(DEFAULT_TASK_PAGE_SIZE)
  })
})

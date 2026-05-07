import { describe, expect, it } from 'vitest'
import {
  describeImplementationWindow,
  filterTasksByImplementationWindow,
  taskVisibleInImplementationWindow,
  ymdRangesOverlap,
} from './implementationWindow'

describe('implementationWindow', () => {
  it('describeImplementationWindow summarises ranges', () => {
    expect(describeImplementationWindow('day', '2025-06-10', null)).toBe('2025-06-10')
    expect(describeImplementationWindow('month', '2025-06-10', null)).toBe('2025-06-01 — 2025-06-30')
    expect(
      describeImplementationWindow('custom', '2025-06-10', { start: '2025-06-05', end: '2025-06-20' }),
    ).toBe('2025-06-05 — 2025-06-20')
  })

  it('ymdRangesOverlap detects intersection', () => {
    expect(ymdRangesOverlap('2025-06-01', '2025-06-30', '2025-06-10', '2025-06-10')).toBe(true)
    expect(ymdRangesOverlap('2025-06-01', '2025-06-05', '2025-06-10', '2025-06-15')).toBe(false)
  })

  it('day view: D must fall within [start,end] inclusive', () => {
    const t = { implementationStart: '2025-06-08', implementationEnd: '2025-06-12' }
    expect(taskVisibleInImplementationWindow(t, 'day', '2025-06-07')).toBe(false)
    expect(taskVisibleInImplementationWindow(t, 'day', '2025-06-10')).toBe(true)
    expect(taskVisibleInImplementationWindow(t, 'day', '2025-06-13')).toBe(false)
  })

  it('month view: task spanning two months shows in both', () => {
    const t = { implementationStart: '2025-05-28', implementationEnd: '2025-06-05' }
    expect(taskVisibleInImplementationWindow(t, 'month', '2025-05-15')).toBe(true)
    expect(taskVisibleInImplementationWindow(t, 'month', '2025-06-15')).toBe(true)
    expect(taskVisibleInImplementationWindow(t, 'month', '2025-07-01')).toBe(false)
  })

  it('week view: overlaps week containing ref', () => {
    const t = { implementationStart: '2025-06-09', implementationEnd: '2025-06-20' }
    expect(taskVisibleInImplementationWindow(t, 'week', '2025-06-10')).toBe(true)
    const outside = { implementationStart: '2025-06-01', implementationEnd: '2025-06-05' }
    expect(taskVisibleInImplementationWindow(outside, 'week', '2025-06-10')).toBe(false)
  })

  it('filterTasksByImplementationWindow works', () => {
    const tasks = [
      { implementationStart: '2025-06-01', implementationEnd: '2025-06-30' },
      { implementationStart: '2025-05-01', implementationEnd: '2025-05-31' },
    ]
    expect(filterTasksByImplementationWindow(tasks, 'month', '2025-06-10', null)).toHaveLength(1)
  })

  it('custom window uses date range overlap', () => {
    const tasks = [
      { implementationStart: '2025-06-01', implementationEnd: '2025-06-10' },
      { implementationStart: '2025-07-01', implementationEnd: '2025-07-31' },
    ]
    expect(
      filterTasksByImplementationWindow(tasks, 'custom', '2025-06-01', {
        start: '2025-06-05',
        end: '2025-06-15',
      }),
    ).toHaveLength(1)
  })
})

import { describe, expect, it } from 'vitest'
import {
  dateInSameMonth,
  dateInSameWeek,
  dateOnSameDay,
  filterTasksByGranularity,
} from './dateFilter'

describe('dateFilter', () => {
  it('dateOnSameDay matches exact YYYY-MM-DD', () => {
    expect(dateOnSameDay('2025-06-10', '2025-06-10')).toBe(true)
    expect(dateOnSameDay('2025-06-09', '2025-06-10')).toBe(false)
  })

  it('dateInSameMonth matches year-month prefix', () => {
    expect(dateInSameMonth('2025-06-01', '2025-06-30')).toBe(true)
    expect(dateInSameMonth('2025-05-31', '2025-06-01')).toBe(false)
  })

  it('dateInSameWeek uses Monday-Sunday local week', () => {
    // 2025-06-09 is Monday, 2025-06-15 is Sunday same week
    expect(dateInSameWeek('2025-06-09', '2025-06-15')).toBe(true)
    expect(dateInSameWeek('2025-06-08', '2025-06-10')).toBe(false)
    expect(dateInSameWeek('2025-06-16', '2025-06-10')).toBe(false)
  })

  it('filterTasksByGranularity filters day, week, month', () => {
    const tasks = [
      { scheduledDate: '2025-06-10' },
      { scheduledDate: '2025-06-11' },
      { scheduledDate: '2025-05-01' },
    ]
    expect(filterTasksByGranularity(tasks, 'day', '2025-06-10')).toEqual([
      { scheduledDate: '2025-06-10' },
    ])
    const week = filterTasksByGranularity(tasks, 'week', '2025-06-11')
    expect(week).toHaveLength(2)
    expect(
      filterTasksByGranularity(tasks, 'month', '2025-06-01'),
    ).toHaveLength(2)
  })
})

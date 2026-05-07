import { describe, expect, it } from 'vitest'
import {
  dateInSameMonth,
  dateInSameWeek,
  dateOnSameDay,
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
    expect(dateInSameWeek('2025-06-09', '2025-06-15')).toBe(true)
    expect(dateInSameWeek('2025-06-08', '2025-06-10')).toBe(false)
    expect(dateInSameWeek('2025-06-16', '2025-06-10')).toBe(false)
  })
})

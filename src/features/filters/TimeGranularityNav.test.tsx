import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TimeGranularityNav } from './TimeGranularityNav'
import { useTaskStore } from '../../stores/taskStore'

describe('TimeGranularityNav', () => {
  beforeEach(() => {
    localStorage.clear()
    useTaskStore.setState({
      tasks: [],
      timeGranularity: 'month',
      referenceDate: '2025-06-01',
    })
  })

  it('renders month, week, day controls', () => {
    render(<TimeGranularityNav />)
    expect(screen.getByRole('button', { name: '本月' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '本周' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '今日' })).toBeInTheDocument()
  })

  it('updates store granularity on click', () => {
    render(<TimeGranularityNav />)
    fireEvent.click(screen.getByRole('button', { name: '今日' }))
    expect(useTaskStore.getState().timeGranularity).toBe('day')
    expect(screen.getByRole('button', { name: '今日' })).toHaveAttribute('aria-pressed', 'true')
  })
})

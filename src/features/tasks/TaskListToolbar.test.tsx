import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskListToolbar } from './TaskListToolbar'
import { emptyTagPresetsByDomain } from './domainOptions'
import { useTaskStore } from '../../stores/taskStore'

function renderToolbar() {
  return render(
    <TaskListToolbar
      statusFilter="all"
      onStatusFilterChange={vi.fn()}
      domainFilter="all"
      onDomainFilterChange={vi.fn()}
      tagFilter=""
      onTagFilterChange={vi.fn()}
      sortKey="default"
      onSortKeyChange={vi.fn()}
      subTagOptions={[]}
      visibleCount={0}
    />,
  )
}

describe('TaskListToolbar', () => {
  beforeEach(() => {
    localStorage.clear()
    useTaskStore.setState({
      tasks: [],
      tagPresets: emptyTagPresetsByDomain(),
      timeGranularity: 'month',
      referenceDate: '2025-06-01',
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
  })

  it('renders granularity buttons including custom', () => {
    renderToolbar()
    expect(screen.getByTestId('time-granularity-nav')).toBeInTheDocument()
    expect(screen.getByTestId('granularity-month')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('granularity-week')).toBeInTheDocument()
    expect(screen.getByTestId('granularity-day')).toBeInTheDocument()
    expect(screen.getByTestId('granularity-custom')).toBeInTheDocument()
  })

  it('updates store granularity on day click', () => {
    renderToolbar()
    fireEvent.click(screen.getByTestId('granularity-day'))
    expect(useTaskStore.getState().timeGranularity).toBe('day')
    expect(screen.getByTestId('granularity-day')).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches to custom and seeds window from reference month', () => {
    renderToolbar()
    fireEvent.click(screen.getByTestId('granularity-custom'))
    const s = useTaskStore.getState()
    expect(s.timeGranularity).toBe('custom')
    expect(s.customWindowStart).toBe('2025-06-01')
    expect(s.customWindowEnd).toBe('2025-06-30')
  })
})

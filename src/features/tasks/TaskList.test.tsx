import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Task } from './types'
import { TaskList } from './TaskList'
import { useTaskStore } from '../../stores/taskStore'

function makeTask(
  base: Pick<Task, 'id' | 'title' | 'implementationStart' | 'implementationEnd'>,
): Task {
  return {
    ...base,
    description: '',
    priority: 'low',
    category: 'A',
    createdAt: '2025-06-10T00:00:00.000Z',
    progressPercent: 0,
    status: 'not_started',
    progressLog: [],
    attachments: [],
  }
}

describe('TaskList', () => {
  beforeEach(() => {
    localStorage.clear()
    useTaskStore.setState({
      tasks: [
        makeTask({ id: 'a', title: '六月任务', implementationStart: '2025-06-01', implementationEnd: '2025-06-30' }),
        makeTask({ id: 'b', title: '仅在五月', implementationStart: '2025-05-01', implementationEnd: '2025-05-31' }),
        makeTask({ id: 'c', title: '跨月', implementationStart: '2025-05-28', implementationEnd: '2025-06-05' }),
      ],
      tagPresets: [],
      timeGranularity: 'month',
      referenceDate: '2025-06-10',
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
  })

  it('lists tasks whose implementation window intersects the month', () => {
    render(<TaskList />)
    expect(screen.getByTestId('task-list')).toBeInTheDocument()
    expect(screen.getByText('六月任务')).toBeInTheDocument()
    expect(screen.getByText('跨月')).toBeInTheDocument()
    expect(screen.queryByText('仅在五月')).not.toBeInTheDocument()
  })

  it('filters to day when granularity is day', () => {
    useTaskStore.setState({ timeGranularity: 'day', referenceDate: '2025-06-10' })
    render(<TaskList />)
    expect(screen.getByText('六月任务')).toBeInTheDocument()
    expect(screen.queryByText('跨月')).not.toBeInTheDocument()
  })

  it('shows empty state when no tasks match', () => {
    useTaskStore.setState({ referenceDate: '2025-12-01' })
    render(<TaskList />)
    expect(screen.queryByTestId('task-list')).not.toBeInTheDocument()
    expect(screen.getByText(/当前时间范围内暂无任务/)).toBeInTheDocument()
  })
})

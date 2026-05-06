import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TaskList } from './TaskList'
import { useTaskStore } from '../../stores/taskStore'

describe('TaskList', () => {
  beforeEach(() => {
    localStorage.clear()
    useTaskStore.setState({
      tasks: [
        {
          id: 'a',
          title: '今天',
          description: '',
          completed: false,
          priority: 'low',
          category: 'A',
          createdAt: '2025-06-10T00:00:00.000Z',
          scheduledDate: '2025-06-10',
        },
        {
          id: 'b',
          title: '其它月',
          description: '',
          completed: false,
          priority: 'low',
          category: 'B',
          createdAt: '2025-05-01T00:00:00.000Z',
          scheduledDate: '2025-05-15',
        },
      ],
      timeGranularity: 'month',
      referenceDate: '2025-06-10',
    })
  })

  it('lists tasks for current month filter', () => {
    render(<TaskList />)
    expect(screen.getByTestId('task-list')).toBeInTheDocument()
    expect(screen.getByText('今天')).toBeInTheDocument()
    expect(screen.queryByText('其它月')).not.toBeInTheDocument()
  })

  it('filters to day when granularity is day', () => {
    useTaskStore.setState({ timeGranularity: 'day', referenceDate: '2025-06-10' })
    render(<TaskList />)
    expect(screen.getByText('今天')).toBeInTheDocument()
  })

  it('shows empty state when no tasks match', () => {
    useTaskStore.setState({ referenceDate: '2025-12-01' })
    render(<TaskList />)
    expect(screen.queryByTestId('task-list')).not.toBeInTheDocument()
    expect(screen.getByText(/当前时间粒度下暂无任务/)).toBeInTheDocument()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskCard } from './TaskCard'
import type { Task } from '../features/tasks/types'
import { emptyTagPresetsByDomain } from '../features/tasks/domainOptions'
import { useTaskStore } from '../stores/taskStore'

const baseTask: Task = {
  id: '1',
  title: '测试任务',
  description: '说明文字',
  priority: 'high',
  domain: 'work',
  category: '开发',
  createdAt: '2025-06-01T00:00:00.000Z',
  implementationStart: '2025-06-10',
  implementationEnd: '2025-06-20',
  progressPercent: 40,
  status: 'in_progress',
  progressLog: [],
  attachments: [],
}

describe('TaskCard', () => {
  beforeEach(() => {
    localStorage.clear()
    useTaskStore.setState({
      tasks: [],
      tagPresets: emptyTagPresetsByDomain(),
      timeGranularity: 'month',
      referenceDate: '2025-06-10',
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
  })

  it('renders title, priority, category, status and implementation range', () => {
    const onOpen = vi.fn()
    render(<TaskCard task={baseTask} onOpenProgress={onOpen} />)
    expect(screen.getByText('测试任务')).toBeInTheDocument()
    expect(screen.getByTestId('task-priority')).toHaveTextContent('高')
    expect(screen.getByTestId('task-category')).toHaveTextContent('工作 · 开发')
    expect(screen.getByTestId('task-status')).toHaveTextContent('进行中')
    expect(screen.getByTestId('task-implementation')).toHaveTextContent('2025-06-10')
    expect(screen.getByTestId('task-implementation')).toHaveTextContent('2025-06-20')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40')
  })

  it('shows completed styling when status is completed', () => {
    const onOpen = vi.fn()
    render(
      <TaskCard
        task={{
          ...baseTask,
          status: 'completed',
          progressPercent: 100,
        }}
        onOpenProgress={onOpen}
      />,
    )
    expect(screen.getByTestId('task-status')).toHaveTextContent('已完成')
    expect(screen.getByText('测试任务')).toHaveClass('line-through')
  })

  it('shows domain label when sub-tag is empty', () => {
    const onOpen = vi.fn()
    render(<TaskCard task={{ ...baseTask, category: '' }} onOpenProgress={onOpen} />)
    expect(screen.getByTestId('task-category')).toHaveTextContent('工作')
  })

  it('opens progress panel when clicking the card body but not when clicking delete', () => {
    const onOpen = vi.fn()
    render(<TaskCard task={baseTask} onOpenProgress={onOpen} />)
    fireEvent.click(screen.getByText('测试任务'))
    expect(onOpen).toHaveBeenCalledTimes(1)
    onOpen.mockClear()
    fireEvent.click(screen.getByTestId('task-delete-button'))
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('opens delete confirm and removes task on confirm', () => {
    const onOpen = vi.fn()
    useTaskStore.setState({
      tasks: [baseTask],
      tagPresets: emptyTagPresetsByDomain(),
      timeGranularity: 'month',
      referenceDate: '2025-06-10',
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
    render(<TaskCard task={baseTask} onOpenProgress={onOpen} />)
    fireEvent.click(screen.getByTestId('task-delete-button'))
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    expect(useTaskStore.getState().tasks).toHaveLength(0)
  })

  it('cancel delete keeps task', () => {
    const onOpen = vi.fn()
    useTaskStore.setState({
      tasks: [baseTask],
      tagPresets: emptyTagPresetsByDomain(),
      timeGranularity: 'month',
      referenceDate: '2025-06-10',
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
    render(<TaskCard task={baseTask} onOpenProgress={onOpen} />)
    fireEvent.click(screen.getByTestId('task-delete-button'))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(useTaskStore.getState().tasks).toHaveLength(1)
    expect(document.querySelector('[data-testid="confirm-dialog"]')).not.toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TaskCard } from './TaskCard'
import type { Task } from '../features/tasks/types'

const baseTask: Task = {
  id: '1',
  title: '测试任务',
  description: '说明文字',
  completed: false,
  priority: 'high',
  category: '开发',
  createdAt: '2025-06-01T00:00:00.000Z',
  scheduledDate: '2025-06-10',
}

describe('TaskCard', () => {
  it('renders title, priority, category, completion and scheduled date', () => {
    render(<TaskCard task={baseTask} />)
    expect(screen.getByText('测试任务')).toBeInTheDocument()
    expect(screen.getByTestId('task-priority')).toHaveTextContent('高')
    expect(screen.getByTestId('task-category')).toHaveTextContent('开发')
    expect(screen.getByTestId('task-completed')).toHaveTextContent('未完成')
    expect(screen.getByTestId('task-scheduled')).toHaveTextContent('2025-06-10')
  })

  it('shows completed styling and label when task is completed', () => {
    render(<TaskCard task={{ ...baseTask, completed: true }} />)
    expect(screen.getByTestId('task-completed')).toHaveTextContent('已完成')
    expect(screen.getByText('测试任务')).toHaveClass('line-through')
  })

  it('shows fallback when category is empty', () => {
    render(<TaskCard task={{ ...baseTask, category: '' }} />)
    expect(screen.getByTestId('task-category')).toHaveTextContent('未分类')
  })
})

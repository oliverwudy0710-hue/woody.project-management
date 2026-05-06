import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddTaskModal } from './AddTaskModal'
import { useTaskStore } from '../../stores/taskStore'
import { todayISODate } from '../../utils/dateFilter'

describe('AddTaskModal', () => {
  beforeEach(() => {
    localStorage.clear()
    useTaskStore.setState({
      tasks: [],
      timeGranularity: 'month',
      referenceDate: '2025-06-10',
    })
  })

  it('creates a task when title is valid and closes the dialog', () => {
    const onClose = vi.fn()
    render(<AddTaskModal open onClose={onClose} />)

    fireEvent.change(screen.getByLabelText(/任务标题/), {
      target: { value: '  写月报  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '创建任务' }))

    const tasks = useTaskStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('写月报')
    expect(tasks[0].completed).toBe(false)
    expect(tasks[0].priority).toBe('medium')
    expect(tasks[0].scheduledDate).toBe(todayISODate())
    expect(tasks[0].id.length).toBeGreaterThan(4)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('blocks submit when title is empty or only whitespace', () => {
    const onClose = vi.fn()
    render(<AddTaskModal open onClose={onClose} />)

    fireEvent.change(screen.getByLabelText(/任务标题/), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: '创建任务' }))

    expect(useTaskStore.getState().tasks).toHaveLength(0)
    expect(screen.getByTestId('title-error')).toHaveTextContent('标题不能为空')
    expect(onClose).not.toHaveBeenCalled()
  })
})

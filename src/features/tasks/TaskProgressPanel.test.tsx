import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TaskProgressPanel } from './TaskProgressPanel'
import type { Task } from './types'
import { useTaskStore } from '../../stores/taskStore'

function seedTask(over: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    title: 'T',
    description: '',
    priority: 'medium',
    category: '',
    createdAt: '2025-01-01T00:00:00.000Z',
    implementationStart: '2025-06-01',
    implementationEnd: '2025-06-30',
    progressPercent: 10,
    status: 'in_progress',
    progressLog: [],
    attachments: [],
    ...over,
  }
}

describe('TaskProgressPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    useTaskStore.setState({
      tasks: [seedTask({ id: 'x', title: '进度任务' })],
      tagPresets: [],
      timeGranularity: 'month',
      referenceDate: '2025-06-10',
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
  })

  it('updates status to completed and sets percent to 100', () => {
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    fireEvent.change(screen.getByRole('combobox', { name: '状态' }), {
      target: { value: 'completed' },
    })
    const t = useTaskStore.getState().tasks[0]
    expect(t.status).toBe('completed')
    expect(t.progressPercent).toBe(100)
  })

  it('marks task completed when progress percent reaches 100', () => {
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText(/完成百分比/), { target: { value: '100' } })
    const t = useTaskStore.getState().tasks[0]
    expect(t.progressPercent).toBe(100)
    expect(t.status).toBe('completed')
  })

  it('appends progress log when note is non-empty', () => {
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText(/^进展说明/), {
      target: { value: '  写了接口  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存本条进展' }))
    const logs = useTaskStore.getState().tasks[0].progressLog
    expect(logs).toHaveLength(1)
    expect(logs[0].note).toBe('写了接口')
    expect(logs[0].progressSnapshot).toBe(10)
  })

  it('updates implementation dates from detail section', () => {
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText(/^实施开始/), { target: { value: '2025-06-15' } })
    expect(useTaskStore.getState().tasks[0].implementationStart).toBe('2025-06-15')
    fireEvent.change(screen.getByLabelText(/^实施结束/), { target: { value: '2025-07-01' } })
    expect(useTaskStore.getState().tasks[0].implementationEnd).toBe('2025-07-01')
  })

  it('does not show append form when task is completed', () => {
    useTaskStore.setState({
      tasks: [seedTask({ id: 'x', title: 'Done', status: 'completed', progressPercent: 100 })],
      tagPresets: [],
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    expect(screen.getByText(/不可再追加进展/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '保存本条进展' })).not.toBeInTheDocument()
  })
})

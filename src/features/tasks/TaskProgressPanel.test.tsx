import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskProgressPanel } from './TaskProgressPanel'
import type { Task } from './types'
import { emptyTagPresetsByDomain } from './domainOptions'
import { useTaskStore } from '../../stores/taskStore'

function seedTask(over: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    title: 'T',
    description: '',
    priority: 'medium',
    domain: 'work',
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
      tagPresets: emptyTagPresetsByDomain(),
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

  it('marks task completed when slider reaches 100 and user confirms', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    fireEvent.change(screen.getByRole('slider', { name: /完成进度/ }), {
      target: { value: '100' },
    })
    const t = useTaskStore.getState().tasks[0]
    expect(confirmSpy).toHaveBeenCalled()
    expect(t.progressPercent).toBe(100)
    expect(t.status).toBe('completed')
    confirmSpy.mockRestore()
  })

  it('does not complete task when slider reaches 100 but user cancels confirm', () => {
    useTaskStore.setState({
      tasks: [seedTask({ id: 'x', title: '进度任务', progressPercent: 99 })],
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    fireEvent.change(screen.getByRole('slider', { name: /完成进度/ }), {
      target: { value: '100' },
    })
    const t = useTaskStore.getState().tasks[0]
    expect(t.progressPercent).toBe(99)
    expect(t.status).toBe('in_progress')
    confirmSpy.mockRestore()
  })

  it('allows reverting status from completed to blocked', () => {
    useTaskStore.setState({
      tasks: [
        seedTask({
          id: 'x',
          title: 'Done',
          status: 'completed',
          progressPercent: 100,
        }),
      ],
    })
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    fireEvent.change(screen.getByRole('combobox', { name: '状态' }), {
      target: { value: 'blocked' },
    })
    const t = useTaskStore.getState().tasks[0]
    expect(t.status).toBe('blocked')
    expect(t.progressPercent).toBe(100)
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
      tagPresets: emptyTagPresetsByDomain(),
      customWindowStart: '2025-06-01',
      customWindowEnd: '2025-06-30',
    })
    render(<TaskProgressPanel taskId="x" onClose={() => {}} />)
    expect(screen.getByText(/不可再追加进展/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '保存本条进展' })).not.toBeInTheDocument()
  })
})

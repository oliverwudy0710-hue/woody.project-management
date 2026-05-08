import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Task } from './types'
import { emptyTagPresetsByDomain } from './domainOptions'
import { TaskList } from './TaskList'
import { useTaskStore } from '../../stores/taskStore'
import { useUiPreferencesStore } from '../../stores/uiPreferencesStore'

function makeTask(
  base: Pick<Task, 'id' | 'title' | 'implementationStart' | 'implementationEnd'>,
): Task {
  return {
    ...base,
    description: '',
    priority: 'low',
    domain: 'work',
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
    useUiPreferencesStore.setState({ tasksPerPage: 24 })
    useTaskStore.setState({
      tasks: [
        makeTask({ id: 'a', title: '六月任务', implementationStart: '2025-06-01', implementationEnd: '2025-06-30' }),
        makeTask({ id: 'b', title: '仅在五月', implementationStart: '2025-05-01', implementationEnd: '2025-05-31' }),
        makeTask({ id: 'c', title: '跨月', implementationStart: '2025-05-28', implementationEnd: '2025-06-05' }),
      ],
      tagPresets: emptyTagPresetsByDomain(),
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

  it('paginates after global filter: page 2 shows remaining tasks', () => {
    const titles = Array.from({ length: 14 }, (_, i) =>
      makeTask({
        id: `t${i}`,
        title: `任务-${i}`,
        implementationStart: '2025-06-01',
        implementationEnd: '2025-06-30',
      }),
    )
    useTaskStore.setState({ tasks: titles })
    useUiPreferencesStore.setState({ tasksPerPage: 12 })

    render(<TaskList />)
    expect(screen.getByTestId('task-list-pagination')).toBeInTheDocument()
    expect(screen.getByText('任务-0')).toBeInTheDocument()
    expect(screen.getByText('任务-11')).toBeInTheDocument()
    expect(screen.queryByText('任务-12')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '下一页' }))
    expect(screen.queryByText('任务-0')).not.toBeInTheDocument()
    expect(screen.getByText('任务-12')).toBeInTheDocument()
    expect(screen.getByText('任务-13')).toBeInTheDocument()
  })
})

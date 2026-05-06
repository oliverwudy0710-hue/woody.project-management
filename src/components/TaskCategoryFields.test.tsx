import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TASK_CATEGORY_CUSTOM, TASK_CATEGORY_SELECT_EMPTY } from '../features/tasks/categoryOptions'
import { TaskCategoryFields } from './TaskCategoryFields'

describe('TaskCategoryFields', () => {
  it('shows custom text field when 自定义 is selected', () => {
    const onSelect = vi.fn()
    const onCustom = vi.fn()
    const { rerender } = render(
      <TaskCategoryFields
        categorySelect={TASK_CATEGORY_SELECT_EMPTY}
        onCategorySelectChange={onSelect}
        categoryCustom=""
        onCategoryCustomChange={onCustom}
      />,
    )
    expect(screen.queryByTestId('task-category-custom')).not.toBeInTheDocument()

    rerender(
      <TaskCategoryFields
        categorySelect={TASK_CATEGORY_CUSTOM}
        onCategorySelectChange={onSelect}
        categoryCustom=""
        onCategoryCustomChange={onCustom}
      />,
    )
    expect(screen.getByTestId('task-category-custom')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('task-category-custom'), {
      target: { value: '副业' },
    })
    expect(onCustom).toHaveBeenCalledWith('副业')
  })
})

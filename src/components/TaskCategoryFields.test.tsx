import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskCategoryFields } from './TaskCategoryFields'

describe('TaskCategoryFields', () => {
  it('calls onSubTagChange when sub-tag input changes', () => {
    const onDomain = vi.fn()
    const onSub = vi.fn()
    render(
      <TaskCategoryFields
        domain="work"
        onDomainChange={onDomain}
        subTag=""
        onSubTagChange={onSub}
        savedSubTags={['前端']}
      />,
    )
    fireEvent.change(screen.getByTestId('task-subtag-input'), { target: { value: '副业' } })
    expect(onSub).toHaveBeenCalledWith('副业')
  })

  it('calls onDomainChange when domain select changes', () => {
    const onDomain = vi.fn()
    render(
      <TaskCategoryFields
        domain="work"
        onDomainChange={onDomain}
        subTag=""
        onSubTagChange={vi.fn()}
        savedSubTags={[]}
      />,
    )
    fireEvent.change(screen.getByLabelText(/领域/), { target: { value: 'study' } })
    expect(onDomain).toHaveBeenCalledWith('study')
  })
})

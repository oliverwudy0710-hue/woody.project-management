import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskPriorityFieldset } from './TaskPriorityFieldset'

describe('TaskPriorityFieldset', () => {
  it('reflects selected priority and wires onChange', () => {
    const onChange = vi.fn()
    render(<TaskPriorityFieldset value="medium" onChange={onChange} />)
    expect(screen.getByRole('radio', { name: '中' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: '高' }))
    expect(onChange).toHaveBeenCalledWith('high')
  })
})

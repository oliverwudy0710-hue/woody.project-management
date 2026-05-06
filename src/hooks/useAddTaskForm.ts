import type { TaskPriority } from '../features/tasks/types'
import type { CategorySelectValue } from '../features/tasks/categoryOptions'
import {
  TASK_CATEGORY_CUSTOM,
  TASK_CATEGORY_SELECT_EMPTY,
} from '../features/tasks/categoryOptions'
import { useTaskStore } from '../stores/taskStore'
import { todayISODate } from '../utils/dateFilter'
import { useCallback, useEffect, useState } from 'react'

export interface UseAddTaskFormOptions {
  open: boolean
  onSuccess: () => void
}

export function useAddTaskForm({ open, onSuccess }: UseAddTaskFormOptions) {
  const addTask = useTaskStore((s) => s.addTask)

  const [title, setTitleRaw] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [scheduledDate, setScheduledDate] = useState(() => todayISODate())
  const [categorySelect, setCategorySelect] = useState<CategorySelectValue>(
    TASK_CATEGORY_SELECT_EMPTY,
  )
  const [categoryCustom, setCategoryCustom] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)

  const setTitle = useCallback((value: string) => {
    setTitleRaw(value)
    setTitleError(null)
  }, [])

  useEffect(() => {
    if (!open) return
    setTitleRaw('')
    setDescription('')
    setPriority('medium')
    setScheduledDate(todayISODate())
    setCategorySelect(TASK_CATEGORY_SELECT_EMPTY)
    setCategoryCustom('')
    setTitleError(null)
  }, [open])

  const resolveCategory = useCallback((): string => {
    if (categorySelect === TASK_CATEGORY_CUSTOM) return categoryCustom.trim()
    return categorySelect
  }, [categoryCustom, categorySelect])

  const submit = useCallback(() => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('标题不能为空')
      return false
    }

    addTask({
      title: trimmedTitle,
      description: description.trim(),
      completed: false,
      priority,
      category: resolveCategory(),
      scheduledDate,
    })
    onSuccess()
    return true
  }, [
    addTask,
    description,
    onSuccess,
    priority,
    resolveCategory,
    scheduledDate,
    title,
  ])

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    scheduledDate,
    setScheduledDate,
    categorySelect,
    setCategorySelect,
    categoryCustom,
    setCategoryCustom,
    titleError,
    submit,
  }
}

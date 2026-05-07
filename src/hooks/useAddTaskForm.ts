import type { TaskAttachment, TaskPriority } from '../features/tasks/types'
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
  const [implementationStart, setImplementationStart] = useState(() => todayISODate())
  const [implementationEnd, setImplementationEnd] = useState(() => todayISODate())
  const [categorySelect, setCategorySelect] = useState<CategorySelectValue>(
    TASK_CATEGORY_SELECT_EMPTY,
  )
  const [categoryCustom, setCategoryCustom] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [periodError, setPeriodError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])

  const setTitle = useCallback((value: string) => {
    setTitleRaw(value)
    setTitleError(null)
  }, [])

  useEffect(() => {
    if (!open) return
    const d = todayISODate()
    setTitleRaw('')
    setDescription('')
    setPriority('medium')
    setImplementationStart(d)
    setImplementationEnd(d)
    setCategorySelect(TASK_CATEGORY_SELECT_EMPTY)
    setCategoryCustom('')
    setTitleError(null)
    setPeriodError(null)
    setAttachments([])
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
    if (implementationEnd < implementationStart) {
      setPeriodError('结束日期不能早于开始日期')
      return false
    }
    setPeriodError(null)

    addTask({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      category: resolveCategory(),
      implementationStart,
      implementationEnd,
      progressPercent: 0,
      status: 'not_started',
      progressLog: [],
      attachments,
    })
    onSuccess()
    return true
  }, [
    addTask,
    description,
    implementationEnd,
    implementationStart,
    onSuccess,
    priority,
    resolveCategory,
    title,
    attachments,
  ])

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    implementationStart,
    setImplementationStart,
    implementationEnd,
    setImplementationEnd,
    categorySelect,
    setCategorySelect,
    categoryCustom,
    setCategoryCustom,
    titleError,
    periodError,
    submit,
    attachments,
    setAttachments,
  }
}

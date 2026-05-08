import type { TaskAttachment, TaskDomain, TaskPriority } from '../features/tasks/types'
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
  const [domain, setDomain] = useState<TaskDomain>('work')
  const [subTag, setSubTag] = useState('')
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
    setDomain('work')
    setSubTag('')
    setTitleError(null)
    setPeriodError(null)
    setAttachments([])
  }, [open])

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
      domain,
      category: subTag.trim(),
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
    domain,
    implementationEnd,
    implementationStart,
    onSuccess,
    priority,
    subTag,
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
    domain,
    setDomain,
    subTag,
    setSubTag,
    titleError,
    periodError,
    submit,
    attachments,
    setAttachments,
  }
}

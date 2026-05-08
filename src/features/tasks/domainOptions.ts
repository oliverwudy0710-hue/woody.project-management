import type { TaskDomain } from './types'

export const TASK_DOMAINS: TaskDomain[] = ['work', 'life', 'study']

export const TASK_DOMAIN_LABELS: Record<TaskDomain, string> = {
  work: '工作',
  life: '生活',
  study: '学习',
}

export type TagPresetsByDomain = Record<TaskDomain, string[]>

export function emptyTagPresetsByDomain(): TagPresetsByDomain {
  return { work: [], life: [], study: [] }
}

export function isTaskDomain(v: unknown): v is TaskDomain {
  return v === 'work' || v === 'life' || v === 'study'
}

/** Legacy single-field category → domain + sub-tag (sub-tag field is `Task.category`). */
export function splitCategoryLegacy(raw: string): { domain: TaskDomain; category: string } {
  const c = raw.trim()
  if (!c) return { domain: 'work', category: '' }
  if (c === '工作') return { domain: 'work', category: '' }
  if (c === '个人' || c === '生活') return { domain: 'life', category: '' }
  if (c === '学习') return { domain: 'study', category: '' }
  return { domain: 'work', category: c }
}

export function pushUniqueTag(list: string[], tag: string): string[] {
  const t = tag.trim()
  if (!t || list.includes(t)) return list
  return [...list, t]
}

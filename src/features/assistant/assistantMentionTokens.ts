import type { Task, TaskStatus } from '../tasks/types'

/** Visible mention only: `@[title]` — title 内的 `]` 写作 `›`。 */
const MENTION_TOKEN_RE = /@\[([^\]]+)\]/g

export function escapeForMentionTitle(title: string): string {
  return title.replace(/\]/g, '›')
}

export function formatTaskMention(title: string): string {
  const safe = escapeForMentionTitle(title.trim() || '未命名')
  return `@[${safe}]`
}

const STATUS_RANK: Record<TaskStatus, number> = {
  in_progress: 0,
  blocked: 1,
  not_started: 2,
  completed: 3,
  cancelled: 4,
}

/** 稳定顺序：同名任务时按 id 决定「首条」 */
export function stableTasksOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.id.localeCompare(b.id))
}

function compareForPicker(a: Task, b: Task, q: string): number {
  const qa = q.trim().toLowerCase()
  if (qa) {
    const at = a.title.toLowerCase()
    const bt = b.title.toLowerCase()
    const aPre = at.startsWith(qa) ? 0 : 1
    const bPre = bt.startsWith(qa) ? 0 : 1
    if (aPre !== bPre) return aPre - bPre
    const ai = at.indexOf(qa)
    const bi = bt.indexOf(qa)
    if (ai !== bi) return ai - bi
    if (at.length !== bt.length) return at.length - bt.length
  }
  const sr = STATUS_RANK[a.status] - STATUS_RANK[b.status]
  if (sr !== 0) return sr
  return a.title.localeCompare(b.title, 'zh-CN')
}

export function sortTasksForMentionPicker(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase()
  const filtered = q
    ? tasks.filter((t) => t.title.toLowerCase().includes(q))
    : [...tasks]
  return filtered.sort((a, b) => compareForPicker(a, b, query))
}

function bracketKeyForTask(t: Task): string {
  return escapeForMentionTitle(t.title.trim() || '未命名')
}

/** 将正文里的 @[…] 按当前任务库解析为 id（标题需与插入时一致；同名取 id 字典序最小的一条） */
export function parseLinkedTaskIdsFromText(text: string, tasks: Task[]): string[] {
  const re = new RegExp(MENTION_TOKEN_RE.source, 'g')
  const ordered = stableTasksOrder(tasks)
  const byKey = new Map<string, Task>()
  for (const t of ordered) {
    const k = bracketKeyForTask(t)
    if (!byKey.has(k)) byKey.set(k, t)
  }
  const ids: string[] = []
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const key = m[1]
    const task = byKey.get(key)
    if (task && !seen.has(task.id)) {
      seen.add(task.id)
      ids.push(task.id)
    }
  }
  return ids
}

/** @ 后输入关键字筛选：允许空格；已闭合的 @[标题] 不参与本次菜单 */
export function getActiveMentionPickerState(
  text: string,
  cursor: number,
): { start: number; query: string } | null {
  const before = text.slice(0, cursor)
  let searchEnd = before.length
  while (searchEnd > 0) {
    const at = before.lastIndexOf('@', searchEnd - 1)
    if (at < 0) return null
    const afterAt = before.slice(at + 1)
    if (afterAt.startsWith('[')) {
      const closeRel = afterAt.indexOf(']')
      if (closeRel === -1) return null
      const mentionEndExclusive = at + 1 + closeRel + 1
      if (cursor >= mentionEndExclusive) {
        searchEnd = at
        continue
      }
      return null
    }
    return { start: at, query: before.slice(at + 1) }
  }
  return null
}

/** 光标在 @[…] 内或紧贴其后时，一次退格删除整块 */
export function mentionTokenBoundsForBackspace(
  text: string,
  cursor: number,
): [number, number] | null {
  const re = new RegExp(MENTION_TOKEN_RE.source, 'g')
  const spans: { start: number; end: number }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    spans.push({ start: m.index, end: m.index + m[0].length })
  }
  for (const { start, end } of spans) {
    if (cursor > start && cursor <= end) return [start, end]
  }
  return null
}

/** Delete 键：光标紧贴 @[ 之前时删除整块 */
export function mentionTokenBoundsForDelete(
  text: string,
  cursor: number,
): [number, number] | null {
  const re = new RegExp(MENTION_TOKEN_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const start = m.index
    const end = m.index + m[0].length
    if (cursor === start) return [start, end]
  }
  return null
}

export function stripMentionForTaskId(text: string, taskId: string, tasks: Task[]): string {
  const re = new RegExp(MENTION_TOKEN_RE.source, 'g')
  let out = ''
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    out += text.slice(last, m.index)
    const token = m[0]
    const ids = parseLinkedTaskIdsFromText(token, tasks)
    if (ids[0] !== taskId) out += token
    last = m.index + token.length
  }
  out += text.slice(last)
  return out
}

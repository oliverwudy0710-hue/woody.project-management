import {
  filterTasksByImplementationWindow,
  ymdRangesOverlap,
  describeImplementationWindow,
} from '../../utils/implementationWindow'
import { todayISODate } from '../../utils/dateFilter'
import type { Task, TimeGranularity } from '../tasks/types'
import { TASK_DOMAIN_LABELS } from '../tasks/domainOptions'
import { taskStatusLabel } from '../../utils/taskStatusLabels'
import { getActivityEntriesForDate } from '../../stores/activityLogStore'

const MAX_ACTIVITY_LINES = 100

/** Tasks whose implementation window includes `day` (YYYY-MM-DD). */
export function tasksOverlappingDay(tasks: Task[], day: string): Task[] {
  return tasks.filter((t) => ymdRangesOverlap(t.implementationStart, t.implementationEnd, day, day))
}

function taskDetailForLlm(t: Task): string {
  return [
    `id=${t.id}`,
    `title=${t.title}`,
    `domain=${t.domain}[${TASK_DOMAIN_LABELS[t.domain]}]`,
    `status=${t.status}`,
    `priority=${t.priority}`,
    `subTag=${t.category}`,
    `progressPercent=${t.progressPercent}`,
    `implementationStart=${t.implementationStart}`,
    `implementationEnd=${t.implementationEnd}`,
    `description=${t.description.slice(0, 1500)}`,
  ].join(' | ')
}

export interface BuildAssistantContextOptions {
  /** 用户在输入框中 @ 提及的任务 id；仅允许对这些任务执行 update_task */
  linkedTaskIds?: string[]
  /** 与主列表时间筛选一致，供「工作日志 / 明日计划」引用 */
  listWindow?: {
    granularity: TimeGranularity
    referenceDate: string
    customWindowStart: string
    customWindowEnd: string
  }
}

export function buildAssistantContextBlock(
  tasks: Task[],
  options?: BuildAssistantContextOptions,
): string {
  const today = todayISODate()
  const todayTasks = tasksOverlappingDay(tasks, today)
  const lines: string[] = [
    `今天是 ${today}。`,
    '',
    '【与今日实施区间有交集的任务】',
  ]
  if (todayTasks.length === 0) {
    lines.push('（无）')
  } else {
    for (const t of todayTasks) {
      lines.push(
        `- id=${t.id} | ${t.title} | 状态：${taskStatusLabel[t.status]} | 进度 ${t.progressPercent}% | 实施 ${t.implementationStart}~${t.implementationEnd}`,
      )
    }
  }

  const lw = options?.listWindow
  if (lw) {
    const customWindow =
      lw.granularity === 'custom'
        ? { start: lw.customWindowStart, end: lw.customWindowEnd }
        : null
    const windowLabel = describeImplementationWindow(lw.granularity, lw.referenceDate, customWindow)
    const inWindow = filterTasksByImplementationWindow(
      tasks,
      lw.granularity,
      lw.referenceDate,
      customWindow,
    )
    lines.push('', `【当前列表时间筛选窗口】${windowLabel}`)

    lines.push('', '【与该窗口相交的任务（用于「明天要做什么」等清单）】')
    if (inWindow.length === 0) {
      lines.push('（无）')
    } else {
      for (const t of inWindow) {
        lines.push(
          `- ${t.title} | 状态：${taskStatusLabel[t.status]} | 进度 ${t.progressPercent}% | 实施 ${t.implementationStart}~${t.implementationEnd}`,
        )
      }
    }
  }

  lines.push('', '【今日已填写的进展记录（含当时进度百分比）】')
  let progressLines = 0
  for (const t of tasks) {
    for (const e of t.progressLog) {
      if (e.date !== today) continue
      const snap =
        e.progressSnapshot !== undefined && Number.isFinite(e.progressSnapshot)
          ? `${e.progressSnapshot}%`
          : '—'
      lines.push(`- 任务「${t.title}」| 当时进度 ${snap} | ${e.note}`)
      progressLines += 1
    }
  }
  if (progressLines === 0) {
    lines.push('（今日尚无进展记录）')
  }

  lines.push('', '【当前阻塞任务（用于「困难与需要帮助」）】')
  const blocked = tasks.filter((t) => t.status === 'blocked')
  if (blocked.length === 0) {
    lines.push('（无）')
  } else {
    for (const t of blocked) {
      const hint = t.description.trim() ? ` | 说明摘录：${t.description.slice(0, 200)}` : ''
      lines.push(`- ${t.title} | 进度 ${t.progressPercent}%${hint}`)
    }
  }

  const linkedIds = options?.linkedTaskIds?.filter(Boolean) ?? []
  if (linkedIds.length) {
    const linked = tasks.filter((t) => linkedIds.includes(t.id))
    lines.push('', '【用户本轮关联的任务（只能对这些 id 使用 update_task）】')
    if (!linked.length) {
      lines.push('（提及的任务在库中未找到，请重新 @ 选择）')
    } else {
      for (const t of linked) {
        lines.push(`- ${taskDetailForLlm(t)}`)
      }
    }
  }

  const acts = getActivityEntriesForDate(today).slice(-MAX_ACTIVITY_LINES)
  lines.push('', '【今日系统内操作快照（新建/编辑/删任务与进展，用于工作总结）】')
  if (acts.length === 0) {
    lines.push('（今日尚无记录）')
  } else {
    for (const e of acts) {
      const t = e.at.slice(11, 19)
      lines.push(`- ${t} [${e.kind}] ${e.taskTitle} — ${e.summary}`)
    }
  }

  lines.push('', '【全部任务标题（创建工作日志/匹配时请用关键词）】')
  for (const t of tasks) {
    lines.push(`- ${t.title}`)
  }
  return lines.join('\n')
}

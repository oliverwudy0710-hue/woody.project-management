import { ymdRangesOverlap } from '../../utils/implementationWindow'
import { todayISODate } from '../../utils/dateFilter'
import type { Task } from '../tasks/types'
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

  const linkedIds = options?.linkedTaskIds?.filter(Boolean) ?? []
  if (linkedIds.length) {
    const linked = tasks.filter((t) => linkedIds.includes(t.id))
    lines.push('', '【用户本轮关联的任务（只能对这些 id 使用 update_task）】')
    if (!linked.length) {
      lines.push('（提及的 id 在库中未找到，请重新 @ 选择）')
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

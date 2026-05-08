import type { AssistantOperation } from './assistantTypes'
import type { Task } from '../tasks/types'
import { useTaskStore } from '../../stores/taskStore'
import { todayISODate } from '../../utils/dateFilter'
import { isTaskDomain } from '../tasks/domainOptions'

export interface ExecuteAssistantContext {
  /** 用户在输入框中 @ 提及的任务 id；非空时 update_task 仅允许这些 id */
  linkedTaskIds: string[]
}

export function executeAssistantOperations(
  operations: AssistantOperation[],
  ctx: ExecuteAssistantContext,
): string[] {
  const log: string[] = []
  const { addTask, appendProgressLog, updateTask } = useTaskStore.getState()
  const allowed = new Set(ctx.linkedTaskIds.filter(Boolean))

  for (const op of operations) {
    if (op.op === 'none') continue

    if (op.op === 'create_task') {
      const day = todayISODate()
      const start = op.implementationStart?.trim() || day
      const end = op.implementationEnd?.trim() || start
      addTask({
        title: op.title.trim(),
        description: (op.description ?? '').trim(),
        priority: op.priority ?? 'medium',
        domain: op.domain !== undefined && isTaskDomain(op.domain) ? op.domain : 'work',
        category: (op.category ?? '').trim(),
        implementationStart: start <= end ? start : end,
        implementationEnd: start <= end ? end : start,
        progressPercent: 0,
        status: 'not_started',
        progressLog: [],
        attachments: [],
      })
      log.push(`已创建任务：「${op.title.trim()}」`)
      continue
    }

    if (op.op === 'append_log') {
      const tasks = useTaskStore.getState().tasks
      const kw = op.taskTitleKeyword.trim()
      const note = op.note.trim()
      if (!kw) {
        log.push('未追加日志：缺少任务匹配关键词')
        continue
      }
      const date = op.date?.trim() || todayISODate()
      const match = findTaskByTitleKeyword(tasks, kw)
      if (!match) {
        log.push(`未找到标题包含「${kw}」的任务，未写入日志`)
        continue
      }
      if (match.status === 'completed' || match.status === 'cancelled') {
        log.push(`任务「${match.title}」已完成/已取消，无法追加进展`)
        continue
      }
      appendProgressLog(match.id, { date, note, progressSnapshot: match.progressPercent })
      log.push(`已为「${match.title}」追加 ${date} 的进展`)
      continue
    }

    if (op.op === 'update_task') {
      const taskId = op.taskId.trim()
      if (allowed.size === 0) {
        log.push('未修改：请先在输入框中用 @ 提及要编辑的任务，再对话修改')
        continue
      }
      if (!allowed.has(taskId)) {
        log.push('未修改：模型给出的 taskId 不在本轮关联列表中')
        continue
      }
      const tasksNow = useTaskStore.getState().tasks
      const exists = tasksNow.some((t) => t.id === taskId)
      if (!exists) {
        log.push(`未找到任务 id「${taskId.slice(0, 8)}…」，未修改`)
        continue
      }
      const patch: Parameters<typeof updateTask>[1] = {}
      if (op.title !== undefined && op.title.trim()) patch.title = op.title.trim()
      if (op.description !== undefined) patch.description = op.description
      if (op.priority !== undefined) patch.priority = op.priority
      if (op.domain !== undefined && isTaskDomain(op.domain)) patch.domain = op.domain
      if (op.category !== undefined) patch.category = op.category
      if (op.implementationStart !== undefined) patch.implementationStart = op.implementationStart
      if (op.implementationEnd !== undefined) patch.implementationEnd = op.implementationEnd
      if (op.progressPercent !== undefined) patch.progressPercent = op.progressPercent
      if (op.status !== undefined) patch.status = op.status

      if (Object.keys(patch).length === 0) {
        log.push('update_task 未包含可应用的字段')
        continue
      }

      const cur = tasksNow.find((t) => t.id === taskId)!
      if (
        patch.implementationStart !== undefined &&
        patch.implementationEnd !== undefined &&
        patch.implementationStart > patch.implementationEnd
      ) {
        const a = patch.implementationStart
        patch.implementationStart = patch.implementationEnd
        patch.implementationEnd = a
      }

      updateTask(taskId, patch)
      log.push(`已更新任务「${cur.title}」：${Object.keys(patch).join('、')}`)
    }
  }

  return log
}

function findTaskByTitleKeyword(tasks: Task[], keyword: string): Task | undefined {
  const k = keyword.trim().toLowerCase()
  if (!k) return undefined
  return tasks.find((t) => t.title.toLowerCase().includes(k))
}

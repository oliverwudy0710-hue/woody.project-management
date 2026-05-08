import { TASK_DOMAIN_LABELS } from '../tasks/domainOptions'
import type { Task } from '../tasks/types'
import { taskStatusLabel } from '../../utils/taskStatusLabels'
import type { ActivityLogEntry } from '../../stores/activityLogStore'
import { postOpenAICompatibleChat } from '../assistant/openaiCompatibleClient'

export interface BuildDailyReportInput {
  date: string
  tasks: Task[]
  activities: ActivityLogEntry[]
  ai: {
    baseUrl: string
    chatPath: string
    apiKey: string
    model: string
    useDevProxy: boolean
  }
}

function formatTaskLine(task: Task): string {
  return [
    `${task.title}`,
    `状态:${taskStatusLabel[task.status]}`,
    `进度:${task.progressPercent}%`,
    `领域:${TASK_DOMAIN_LABELS[task.domain]}`,
    `实施:${task.implementationStart}~${task.implementationEnd}`,
  ].join(' | ')
}

function formatActivityLine(entry: ActivityLogEntry): string {
  const hhmm = entry.at.slice(11, 16)
  return `${hhmm} [${entry.kind}] ${entry.taskTitle} - ${entry.summary}`
}

function fallbackReport(date: string, tasks: Task[], activities: ActivityLogEntry[]): string {
  const doneToday = tasks.filter((t) => t.status === 'completed')
  const planTomorrow = tasks
    .filter((t) => t.status === 'in_progress' || t.status === 'not_started' || t.status === 'blocked')
    .slice(0, 8)
  const blockers = tasks.filter((t) => t.status === 'blocked')
  const lines = [
    `日报 ${date}`,
    '',
    '今日完成',
    ...(doneToday.length ? doneToday.map((t) => `- ${t.title}`) : ['- 暂无已完成任务，详见下方活动记录。']),
    '',
    '明日计划',
    ...(planTomorrow.length ? planTomorrow.map((t) => `- ${t.title}`) : ['- 暂无待推进任务。']),
    '',
    '阻碍',
    ...(blockers.length ? blockers.map((t) => `- ${t.title}`) : ['- 暂无阻碍。']),
  ]
  if (activities.length) {
    lines.push('', '今日关键操作记录', ...activities.slice(-8).map((a) => `- ${formatActivityLine(a)}`))
  }
  return lines.join('\n')
}

export async function buildDailyReport(input: BuildDailyReportInput): Promise<string> {
  const activitySlice = input.activities.slice(-80)
  const taskLines = input.tasks.map((t) => `- ${formatTaskLine(t)}`).join('\n') || '- 无任务'
  const actLines = activitySlice.map((a) => `- ${formatActivityLine(a)}`).join('\n') || '- 无操作记录'

  const systemPrompt = [
    '你是项目日报助手。',
    '请基于输入信息输出纯中文日报，严格 3 个一级标题：今日完成、明日计划、阻碍。',
    '每个标题下使用项目符号列表（- 开头）。',
    '内容要具体、可执行，避免空话；不要输出 JSON；不要输出多余标题。',
  ].join('\n')

  const userPrompt = [
    `日期：${input.date}`,
    '',
    '任务快照：',
    taskLines,
    '',
    '今日操作记录：',
    actLines,
    '',
    '请生成日报正文。',
  ].join('\n')

  try {
    const text = await postOpenAICompatibleChat({
      baseUrl: input.ai.baseUrl,
      chatPath: input.ai.chatPath,
      apiKey: input.ai.apiKey,
      model: input.ai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      useDevProxy: input.ai.useDevProxy,
    })
    const cleaned = text.trim()
    if (!cleaned) return fallbackReport(input.date, input.tasks, activitySlice)
    return cleaned
  } catch {
    return fallbackReport(input.date, input.tasks, activitySlice)
  }
}

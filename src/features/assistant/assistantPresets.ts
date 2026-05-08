/** 供「今日要点」等一键发送：展示给用户的短气泡 vs 实际发给模型的指令 */
export const ASSISTANT_WORK_JOURNAL_USER_PROMPT = [
  '请根据系统注入的「当前任务库快照」生成一份工作日志，严格用三个一级标题（不要其它标题）：',
  '',
  '## 今天做了什么',
  '- 必须结合快照里【今日已填写的进展记录】逐条归纳；每条务必写出对应任务名称、进展摘要，以及当时的进度百分比（progressSnapshot）。',
  '- 若无今日进展记录，说明可依据活动快照与任务进度简要概括，并注明依据有限。',
  '',
  '## 明天要做什么',
  '- 仅列出【与当前列表时间筛选窗口相交的任务】：每行写任务名称，并注明实施起止日期；可按优先级与状态排序。',
  '',
  '## 困难与需要帮助',
  '- 仅聚焦状态为「阻塞」的任务：写任务名称与阻塞原因或需要协助的点；若无阻塞任务，写「暂无」。',
  '',
  '除上述 Markdown 正文外，你必须仍按系统规则返回唯一 JSON：message 字段放上述完整正文，operations 固定为 [{"op":"none"}]。',
].join('\n')

export const ASSISTANT_TODAY_HIGHLIGHTS_USER_PROMPT = [
  '用户刚上班，需要「今日要点」。请按系统规则返回唯一 JSON：message 字段放完整可读的中文要点正文，operations 固定为 [{"op":"none"}]。',
  '正文建议：今日最优先 3–5 件事、与任务的关系、可能阻塞、建议的第一步动作；语气简洁可执行。',
  '务必参考上下文：今日实施区间相关任务、今日已填进展、今日活动快照、当前时间窗内待推进任务。',
].join('\n')

export const ASSISTANT_BATCH_CREATE_TEMPLATE = [
  '下面每条用口语描述即可：请你自行拆解、提炼字段，并在 operations 里输出多条 create_task 一次性创建。缺的用合理默认（日期默认今天，领域默认 work，优先级默认 medium）。',
  '1. ',
].join('\n')

export type AssistantPreset =
  | { id: 'batch_create'; label: string; mode: 'inject_input'; body: string }
  | {
      id: 'work_journal' | 'today_highlights'
      label: string
      mode: 'send_auto'
      displayUser: string
      userPrompt: string
    }

export const ASSISTANT_PRESET_PROMPTS: AssistantPreset[] = [
  {
    id: 'batch_create',
    label: '批量创建任务',
    mode: 'inject_input',
    body: ASSISTANT_BATCH_CREATE_TEMPLATE,
  },
  {
    id: 'work_journal',
    label: '工作日志',
    mode: 'send_auto',
    displayUser: '「工作日志」（自动生成）',
    userPrompt: ASSISTANT_WORK_JOURNAL_USER_PROMPT,
  },
  {
    id: 'today_highlights',
    label: '今日要点',
    mode: 'send_auto',
    displayUser: '「今日要点」（自动生成）',
    userPrompt: ASSISTANT_TODAY_HIGHLIGHTS_USER_PROMPT,
  },
]

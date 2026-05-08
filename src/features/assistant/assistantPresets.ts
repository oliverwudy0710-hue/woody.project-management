export const ASSISTANT_PRESET_PROMPTS = [
  {
    label: '创建任务',
    body: '请根据我的说明创建一条新任务（可补充标题、优先级 high/medium/low、实施起止日期 YYYY-MM-DD、分类）：\n',
  },
  {
    label: '工作日志',
    body: '请结合今日操作快照，并为我「关联的任务」或我描述的任务追加一条今日工作进展（写清做了什么）：\n',
  },
  {
    label: '今日要点',
    body: '请根据任务库、今日实施区间内的任务以及「今日系统内操作快照」，总结我今天要关注的要点与下一步建议：\n',
  },
] as const

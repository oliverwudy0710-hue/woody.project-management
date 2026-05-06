export const TASK_CATEGORY_SELECT_EMPTY = ''
export const TASK_CATEGORY_CUSTOM = '__custom__'

export type CategorySelectValue =
  | typeof TASK_CATEGORY_SELECT_EMPTY
  | '工作'
  | '个人'
  | '学习'
  | typeof TASK_CATEGORY_CUSTOM

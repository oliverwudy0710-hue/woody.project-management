export const TASK_CATEGORY_SELECT_EMPTY = ''
export const TASK_CATEGORY_CUSTOM = '__custom__'

/** 内置标签值 */
export const TASK_CATEGORY_BUILTIN = ['工作', '个人', '学习'] as const

/** Select value: built-in tag, saved tag label, empty, or `TASK_CATEGORY_CUSTOM`. */
export type CategorySelectValue = string

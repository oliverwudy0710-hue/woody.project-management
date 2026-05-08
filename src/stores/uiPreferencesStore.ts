import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_TASK_PAGE_SIZE,
  clampTaskPageSize,
  type TaskPageSize,
} from '../features/tasks/taskPaginationConstants'

const STORAGE_KEY = 'taskApp_ui_preferences'

const DEFAULT_TITLE = 'Woody的任务管理系统'
const DEFAULT_WELCOME =
  '你好，Woody。这里只给你自己看：任务、标签和附件都保存在本机浏览器。'
const DEFAULT_BADGE = 'Workspace'

export interface UiPreferencesState {
  /** 顶栏主标题（系统名称） */
  appTitle: string
  /** 顶栏小标题（如 Workspace） */
  workspaceBadge: string
  /** 顶栏说明文案 */
  welcomeLine: string
  /**
   * 自定义 Logo：http(s) URL 或 data URL；空字符串则用内置 favicon.svg
   */
  logoDataUrl: string
  tasksPerPage: TaskPageSize
  setUiPreferences: (patch: Partial<Omit<UiPreferencesState, 'setUiPreferences'>>) => void
  resetBranding: () => void
}

const defaults: Omit<UiPreferencesState, 'setUiPreferences' | 'resetBranding'> = {
  appTitle: DEFAULT_TITLE,
  workspaceBadge: DEFAULT_BADGE,
  welcomeLine: DEFAULT_WELCOME,
  logoDataUrl: '',
  tasksPerPage: DEFAULT_TASK_PAGE_SIZE,
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      ...defaults,
      setUiPreferences: (patch) =>
        set((s) => {
          const next = { ...s, ...patch } as UiPreferencesState
          if ('tasksPerPage' in patch && patch.tasksPerPage !== undefined) {
            next.tasksPerPage = clampTaskPageSize(patch.tasksPerPage)
          }
          return next
        }),
      resetBranding: () =>
        set({
          appTitle: DEFAULT_TITLE,
          workspaceBadge: DEFAULT_BADGE,
          welcomeLine: DEFAULT_WELCOME,
          logoDataUrl: '',
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

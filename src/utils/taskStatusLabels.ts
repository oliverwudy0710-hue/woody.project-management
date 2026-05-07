import type { TaskStatus } from '../features/tasks/types'

export const taskStatusLabel: Record<TaskStatus, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  blocked: '阻塞',
  completed: '已完成',
  cancelled: '已取消',
}

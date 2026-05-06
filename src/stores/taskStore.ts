import type { CreateTaskInput, Task, TimeGranularity } from '../features/tasks/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { todayISODate } from '../utils/dateFilter'

const STORAGE_KEY = 'taskApp_tasks'

interface TaskStoreState {
  tasks: Task[]
  timeGranularity: TimeGranularity
  /** YYYY-MM-DD anchor for day/week/month filtering */
  referenceDate: string
  setTimeGranularity: (g: TimeGranularity) => void
  setReferenceDate: (d: string) => void
  addTask: (input: CreateTaskInput) => void
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  removeTask: (id: string) => void
}

function newTaskId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: [],
      timeGranularity: 'month',
      referenceDate: todayISODate(),

      setTimeGranularity: (g) => set({ timeGranularity: g }),

      setReferenceDate: (d) => set({ referenceDate: d }),

      addTask: (input) =>
        set((s) => {
          const now = new Date().toISOString()
          const task: Task = {
            id: input.id ?? newTaskId(),
            title: input.title,
            description: input.description,
            completed: input.completed,
            priority: input.priority,
            category: input.category,
            createdAt: input.createdAt ?? now,
            scheduledDate: input.scheduledDate,
          }
          return { tasks: [...s.tasks, task] }
        }),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        timeGranularity: state.timeGranularity,
        referenceDate: state.referenceDate,
      }),
    },
  ),
)

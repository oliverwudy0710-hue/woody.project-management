import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const STORAGE_KEY = 'taskApp_assistant_settings'

export interface AssistantSettingsState {
  /** OpenAI-Compatible API origin, e.g. https://api.deepseek.com */
  baseUrl: string
  /** Path only, e.g. /v1/chat/completions */
  chatPath: string
  model: string
  apiKey: string
  /** DEV only: POST via Vite /api-llm proxy to avoid CORS */
  useDevProxy: boolean
  setAssistantSettings: (patch: Partial<Omit<AssistantSettingsState, 'setAssistantSettings'>>) => void
}

const defaults: Omit<AssistantSettingsState, 'setAssistantSettings'> = {
  baseUrl: 'https://api.deepseek.com',
  chatPath: '/v1/chat/completions',
  model: 'deepseek-chat',
  apiKey: '',
  useDevProxy: true,
}

export const useAssistantSettingsStore = create<AssistantSettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setAssistantSettings: (patch) => set((s) => ({ ...s, ...patch })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

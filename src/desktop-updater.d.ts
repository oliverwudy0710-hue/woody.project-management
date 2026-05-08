export type DesktopUpdaterStatus =
  | { stage: 'idle' }
  | { stage: 'checking' }
  | { stage: 'available'; version?: string; releaseDate?: string }
  | {
      stage: 'downloading'
      percent?: number
      transferred?: number
      total?: number
      bytesPerSecond?: number
    }
  | { stage: 'ready'; version?: string }
  | { stage: 'error'; message: string }

export interface DesktopUpdaterApi {
  getVersion: () => Promise<string>
  checkForUpdates: () => Promise<{ ok: boolean; message?: string }>
  downloadAndInstall: () => Promise<{ ok: boolean; message?: string }>
  onStatus: (listener: (status: DesktopUpdaterStatus) => void) => () => void
}

declare global {
  interface Window {
    desktopUpdater?: DesktopUpdaterApi
  }
}

export {}

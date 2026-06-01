import { ElectronAPI } from '@electron-toolkit/preload'

type GetVersion = () => string

interface UpdaterAPI {
  check: () => Promise<void>
  download: () => Promise<void>
  install: () => Promise<void>
  onChecking: (cb: () => void) => () => void
  onAvailable: (cb: (info: any) => void) => () => void
  onNotAvailable: (cb: (info: any) => void) => () => void
  onError: (cb: (err: string) => void) => () => void
  onProgress: (cb: (progress: any) => void) => () => void
  onDownloaded: (cb: (info: any) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI & {
      getAppVersion: GetVersion
    }
    api: {
      execute: (...args: any[]) => Promise<any>
      updater: UpdaterAPI
    }
  }
}

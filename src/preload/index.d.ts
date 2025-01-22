import { ElectronAPI } from '@electron-toolkit/preload'

type GetVersion = () => string
declare global {
  interface Window {
    electron: ElectronAPI & {
      getAppVersion: GetVersion
    }
    api: unknown
  }
}

import { ElectronAPI } from '@electron-toolkit/preload'

type GetVersion = () => string
type PrintInvoice = (content: string) => void
declare global {
  interface Window {
    electron: ElectronAPI & {
      getAppVersion: GetVersion
      printInvoice: PrintInvoice
    }
    api: unknown
  }
}

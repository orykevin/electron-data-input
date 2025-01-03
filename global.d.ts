export {}

declare global {
  interface Window {
    electron: {
      process: {
        versions: {
          [key: string]: string
        }
      }
    }
  }
}

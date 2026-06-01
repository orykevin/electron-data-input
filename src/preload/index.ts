import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  execute: (...args) => ipcRenderer.invoke('db:execute', ...args),
  updater: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    onChecking: (cb: () => void) => {
      const listener = () => cb()
      ipcRenderer.on('update-checking', listener)
      return () => ipcRenderer.off('update-checking', listener)
    },
    onAvailable: (cb: (info: any) => void) => {
      const listener = (_event: any, info: any) => cb(info)
      ipcRenderer.on('update-available', listener)
      return () => ipcRenderer.off('update-available', listener)
    },
    onNotAvailable: (cb: (info: any) => void) => {
      const listener = (_event: any, info: any) => cb(info)
      ipcRenderer.on('update-not-available', listener)
      return () => ipcRenderer.off('update-not-available', listener)
    },
    onError: (cb: (err: string) => void) => {
      const listener = (_event: any, err: any) => cb(err)
      ipcRenderer.on('update-error', listener)
      return () => ipcRenderer.off('update-error', listener)
    },
    onProgress: (cb: (progress: any) => void) => {
      const listener = (_event: any, progress: any) => cb(progress)
      ipcRenderer.on('download-progress', listener)
      return () => ipcRenderer.off('download-progress', listener)
    },
    onDownloaded: (cb: (info: any) => void) => {
      const listener = (_event: any, info: any) => cb(info)
      ipcRenderer.on('update-downloaded', listener)
      return () => ipcRenderer.off('update-downloaded', listener)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      getAppVersion: () => ipcRenderer.invoke('get-app-version')
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = {
    ...electronAPI,
    getAppVersion: () => ipcRenderer.invoke('get-app-version')
  }
  // @ts-ignore (define in dts)
  window.api = api
}

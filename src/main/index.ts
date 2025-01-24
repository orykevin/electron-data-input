import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initializeApp, execute } from './db'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

let mainWindow
autoUpdater.logger = log

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  autoUpdater.checkForUpdatesAndNotify()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  autoUpdater.checkForUpdatesAndNotify()
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('db:execute', execute)
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  const dbInitialized = await initializeApp()
  if (dbInitialized) {
    createWindow()
  } else {
    // Handle database initialization failure
    // Maybe show an error dialog and quit the app
    app.quit()
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// autoUpdater

autoUpdater.on('update-available', () => {
  log.info('Update Available')
  const dialogOpts = {
    type: 'info' as 'info',
    buttons: ['Ok'],
    title: 'Update Aplikasi Tersedia',
    message: 'Update Aplikasi akan di download otomatis'
  }

  dialog.showMessageBox(mainWindow!, dialogOpts)
})

autoUpdater.on('update-downloaded', () => {
  log.info('Update Downloaded')
  const dialogOpts = {
    type: 'info' as 'info',
    buttons: ['Muat Ulang Aplikasi', 'Nanti saja'],
    title: 'Update Aplikasi Telah terdownload',
    message: 'Update Aplikasi sudah terdownload, muat ulang aplikasi untuk memakai versi baru'
  }

  dialog.showMessageBox(mainWindow!, dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info)
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  log.info('Download progress:', progressObj)
})

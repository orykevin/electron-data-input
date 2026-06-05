import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  Sparkles,
  Loader2
} from 'lucide-react'

interface AppUpdaterModalProps {
  isOpen: boolean
  onClose: () => void
  currentVersion: string
}

type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export function AppUpdaterModal({ isOpen, onClose, currentVersion }: AppUpdaterModalProps) {
  const [status, setStatus] = React.useState<UpdateStatus>('idle')
  const [newVersionInfo, setNewVersionInfo] = React.useState<any>(null)
  const [downloadProgress, setDownloadProgress] = React.useState<any>(null)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  // Listen to IPC events from main process
  React.useEffect(() => {
    if (!isOpen) return

    const updater = window.api?.updater
    if (!updater) return

    let unsubChecking: any
    let unsubAvailable: any
    let unsubNotAvailable: any
    let unsubError: any
    let unsubProgress: any
    let unsubDownloaded: any

    try {
      if (typeof updater.onChecking === 'function') {
        unsubChecking = updater.onChecking(() => {
          setStatus('checking')
          setErrorMessage('')
        })
      }

      if (typeof updater.onAvailable === 'function') {
        unsubAvailable = updater.onAvailable((info) => {
          setStatus('available')
          setNewVersionInfo(info)
        })
      }

      if (typeof updater.onNotAvailable === 'function') {
        unsubNotAvailable = updater.onNotAvailable(() => {
          setStatus('not-available')
        })
      }

      if (typeof updater.onError === 'function') {
        unsubError = updater.onError((err) => {
          setStatus('error')
          setErrorMessage(err || 'Gagal memeriksa pembaruan')
        })
      }

      if (typeof updater.onProgress === 'function') {
        unsubProgress = updater.onProgress((progress) => {
          setStatus('downloading')
          setDownloadProgress(progress)
        })
      }

      if (typeof updater.onDownloaded === 'function') {
        unsubDownloaded = updater.onDownloaded((info) => {
          setStatus('downloaded')
          setNewVersionInfo(info)
        })
      }
    } catch (err) {
      console.error('Error setting up update listeners:', err)
    }

    // Automatically check for update when modal is opened
    handleCheck()

    return () => {
      if (typeof unsubChecking === 'function') unsubChecking()
      if (typeof unsubAvailable === 'function') unsubAvailable()
      if (typeof unsubNotAvailable === 'function') unsubNotAvailable()
      if (typeof unsubError === 'function') unsubError()
      if (typeof unsubProgress === 'function') unsubProgress()
      if (typeof unsubDownloaded === 'function') unsubDownloaded()
    }
  }, [isOpen])

  const handleCheck = async () => {
    try {
      setStatus('checking')
      setErrorMessage('')
      if (window.api?.updater && typeof window.api.updater.check === 'function') {
        await window.api.updater.check()
      } else {
        throw new Error('Updater API tidak tersedia')
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Gagal memulai pemeriksaan pembaruan')
    }
  }

  const handleDownload = async () => {
    try {
      setStatus('downloading')
      if (window.api?.updater && typeof window.api.updater.download === 'function') {
        await window.api.updater.download()
      } else {
        throw new Error('Updater API tidak tersedia')
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Gagal memulai unduhan')
    }
  }

  const handleInstall = () => {
    if (window.api?.updater && typeof window.api.updater.install === 'function') {
      window.api.updater.install()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border border-gray-100 shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-gray-50">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Sparkles className="size-5 text-indigo-500 animate-pulse" />
            Pembaruan Sistem
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Periksa dan pasang versi terbaru aplikasi Rio Jaya Motor.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center min-h-[160px]">
          {status === 'checking' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute size-14 bg-indigo-50 rounded-full animate-ping" />
                <div className="relative size-14 bg-indigo-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="size-7 text-indigo-600 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Memeriksa Pembaruan...</h4>
                <p className="text-xs text-gray-400 mt-1">Menghubungkan ke server repositori</p>
              </div>
            </div>
          )}

          {status === 'not-available' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-14 bg-green-50 rounded-full flex items-center justify-center border border-green-150">
                <CheckCircle className="size-7 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Aplikasi Sudah Terbaru</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Anda menggunakan versi paling baru{' '}
                  <span className="font-semibold text-indigo-600">v{currentVersion}</span>
                </p>
              </div>
            </div>
          )}

          {status === 'available' && newVersionInfo && (
            <div className="flex flex-col items-center gap-4 text-center w-full">
              <div className="size-14 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
                <ArrowUpCircle className="size-7 text-indigo-500" />
              </div>
              <div className="w-full px-2">
                <h4 className="font-bold text-gray-800 text-lg">Versi Baru Tersedia!</h4>
                <div className="mt-3 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Versi Saat Ini:</span>
                    <span className="font-semibold text-gray-600">v{currentVersion}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1.5">
                    <span className="text-gray-400">Versi Terbaru:</span>
                    <span className="font-bold text-green-600">v{newVersionInfo.version}</span>
                  </div>
                  {newVersionInfo.releaseDate && (
                    <div className="flex justify-between items-center text-xs mt-1.5">
                      <span className="text-gray-400">Tanggal Rilis:</span>
                      <span className="font-medium text-gray-500">
                        {new Date(newVersionInfo.releaseDate).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'downloading' && (
            <div className="flex flex-col items-center gap-4 text-center w-full px-2">
              <div className="size-14 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                <Download className="size-7 text-indigo-500 animate-bounce" />
              </div>
              <div className="w-full">
                <h4 className="font-semibold text-gray-800">Mengunduh Pembaruan...</h4>
                {downloadProgress ? (
                  <div className="mt-4 w-full">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.round(downloadProgress.percent)}%` }}
                      />
                    </div>
                    {/* Progress details */}
                    <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2 font-medium">
                      <span>
                        {(downloadProgress.transferred / (1024 * 1024)).toFixed(1)}MB /{' '}
                        {(downloadProgress.total / (1024 * 1024)).toFixed(1)}MB
                      </span>
                      <span className="text-indigo-600 font-bold">
                        {Math.round(downloadProgress.percent)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 text-center font-mono">
                      Speed: {(downloadProgress.bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <Loader2 className="size-4 animate-spin text-indigo-500" />
                    Menyiapkan unduhan...
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'downloaded' && (
            <div className="flex flex-col items-center gap-4 text-center w-full">
              <div className="size-14 bg-green-50 rounded-full flex items-center justify-center border border-green-150 relative">
                <CheckCircle className="size-7 text-green-500" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
                </span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">Pembaruan Siap Dipasang!</h4>
                <p className="text-xs text-gray-500 mt-1.5 px-4">
                  Unduhan versi baru{' '}
                  <span className="font-semibold text-green-600">
                    v{newVersionInfo?.version || ''}
                  </span>{' '}
                  telah selesai. Klik pasang untuk memuat ulang aplikasi.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center w-full px-2">
              <div className="size-14 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                <AlertTriangle className="size-7 text-red-500 animate-bounce" />
              </div>
              <div className="w-full">
                <h4 className="font-semibold text-red-800">Pembaruan Gagal</h4>
                <p className="text-xs text-red-500 mt-2 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium text-left max-h-[80px] overflow-y-auto">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-gray-50 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={status === 'downloading'}
            className="rounded-xl border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
          >
            Tutup
          </Button>

          {status === 'error' && (
            <Button
              onClick={handleCheck}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-100 flex items-center gap-1.5"
            >
              <RefreshCw className="size-4" />
              Coba Lagi
            </Button>
          )}

          {status === 'available' && (
            <Button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-100 flex items-center gap-1.5"
            >
              <Download className="size-4" />
              Unduh Sekarang
            </Button>
          )}

          {status === 'downloaded' && (
            <Button
              onClick={handleInstall}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-100 flex items-center gap-1.5"
            >
              <CheckCircle className="size-4" />
              Pasang & Mulai Ulang
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  leaving: boolean
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const colorMap: Record<ToastType, string> = {
  success: 'border-success/30 bg-success-soft',
  error: 'border-error/30 bg-error-soft',
  info: 'border-accent-500/20 bg-accent-50',
}

const iconColorMap: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-accent-500',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, type, leaving: false }])
      setTimeout(() => removeToast(id), 3000)
    },
    [removeToast],
  )

  useEffect(() => {
    const handler = (e: CustomEvent<{ message: string; type?: ToastType }>) => {
      showToast(e.detail.message, e.detail.type)
    }
    window.addEventListener('toast' as any, handler)
    return () => window.removeEventListener('toast' as any, handler)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg bg-bg-surface backdrop-blur-sm transition-all duration-300 min-w-[280px] max-w-[420px] ${
                toast.leaving ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'
              } ${colorMap[toast.type]}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColorMap[toast.type]}`} />
              <span className="text-sm text-text-secondary flex-1 leading-relaxed">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

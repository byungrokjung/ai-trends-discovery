import React, { useEffect } from 'react'
import { useToast } from '../store/useToastStore'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

const Toast = () => {
  const { toasts, removeToast } = useToast()

  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration || 3000)

      return () => clearTimeout(timer)
    })
  }, [toasts, removeToast])

  const getToastStyles = (type) => {
    const baseStyles = 'flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform'
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-accent-green/10 border-accent-green text-accent-green`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`
      case 'warning':
        return `${baseStyles} bg-accent-warm/20 border-accent text-text-secondary`
      case 'info':
      default:
        return `${baseStyles} bg-primary-light border-primary text-text-secondary`
    }
  }

  const getToastIcon = (type) => {
    const iconStyles = 'w-5 h-5 flex-shrink-0'
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconStyles} text-accent-green`} />
      case 'error':
        return <XCircle className={`${iconStyles} text-red-400`} />
      case 'warning':
        return <AlertCircle className={`${iconStyles} text-accent`} />
      case 'info':
      default:
        return <Info className={`${iconStyles} text-primary`} />
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} animate-slide-in-right`}
        >
          {getToastIcon(toast.type)}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium break-words">
              {toast.message}
            </p>
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react'

interface Toast {
  id: number
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let addToastFunction: ((toast: Omit<Toast, 'id'>) => void) | null = null

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Store the addToast function in the closure
  addToastFunction = addToast

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`mb-2 rounded-md p-4 shadow-md ${
            toast.variant === 'destructive' ? 'bg-red-500' : 'bg-gray-800'
          } text-white`}
        >
          <h3 className='font-bold'>{toast.title}</h3>
          {toast.description && <p>{toast.description}</p>}
          <button onClick={() => removeToast(toast.id)} className='absolute right-1 top-1 text-white'>
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}

export const toast = (props: Omit<Toast, 'id'>) => {
  if (addToastFunction) {
    addToastFunction(props)
  } else {
    console.error('Toast function called before ToastProvider was initialized')
  }
}

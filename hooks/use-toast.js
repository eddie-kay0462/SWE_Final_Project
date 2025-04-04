"use client"

import { useState, createContext, useContext } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Create a context for the toast
const ToastContext = createContext({
  toast: () => {},
  dismissToast: () => {},
  toasts: [],
})

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // Function to add a toast
  const toast = ({ title, description, variant = "default", duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = {
      id,
      title,
      description,
      variant,
      duration,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto dismiss after duration
    if (duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }

  // Function to dismiss a toast
  const dismissToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast, dismissToast, toasts }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

// Hook to use the toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Toaster component to render the toasts
export function Toaster() {
  const { toasts, dismissToast } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "p-4 rounded-md shadow-md flex items-start gap-3 animate-in slide-in-from-right-full duration-300",
            toast.variant === "destructive"
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-white text-gray-800 border border-gray-200",
          )}
        >
          <div className="flex-1">
            {toast.title && <h3 className="font-medium">{toast.title}</h3>}
            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
          </div>
          <button onClick={() => dismissToast(toast.id)} className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  )
}


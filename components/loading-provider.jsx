"use client"

/**
 * Global Loading State Provider
 * 
 * Provides context and component for managing loading states throughout the application
 * Can be used to show loading states for navigation or global actions
 */

import { createContext, useState, useContext } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Create context for loading state
const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
  setLoadingState: () => {},
})

/**
 * Hook to access loading state and actions
 * @returns {Object} Loading state and control functions
 */
export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

/**
 * Provider component for loading state
 * Wraps children with loading context and renders loading overlay when active
 */
export function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    text: "Loading...",
    size: "large",
  })

  const startLoading = (text = "Loading...", size = "large") => {
    setLoadingState({
      isLoading: true,
      text,
      size,
    })
  }

  const stopLoading = () => {
    setLoadingState({
      ...loadingState,
      isLoading: false,
    })
  }

  return (
    <LoadingContext.Provider
      value={{
        isLoading: loadingState.isLoading,
        startLoading,
        stopLoading,
        setLoadingState,
      }}
    >
      {loadingState.isLoading && (
        <LoadingSpinner
          fullPage
          size={loadingState.size}
          text={loadingState.text}
        />
      )}
      {children}
    </LoadingContext.Provider>
  )
} 
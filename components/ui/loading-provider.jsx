"use client"

/**
 * Global Loading State Provider
 * 
 * Provides context and component for managing loading states throughout the application
 * Can be used to show loading states for navigation or global actions
 */

import React, { createContext, useContext, useState } from 'react'

// Create context for loading state
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
})

/**
 * Hook to access loading state and actions
 * @returns {Object} Loading state and control functions
 */
export function useLoading() {
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
  const [isLoading, setIsLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-lg dark:bg-neutral-800">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-[#A91827]"></div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Loading...</p>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  )
} 
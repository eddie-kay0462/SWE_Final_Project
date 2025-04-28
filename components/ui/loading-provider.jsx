"use client"

/**
 * Global Loading State Provider
 * 
 * Provides context and component for managing loading states throughout the application
 * Features animated transitions and progress tracking
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from './loading-spinner'

// Create context for loading state
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
  startLoading: () => {},
  stopLoading: () => {},
  setProgress: () => {},
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
  const [progress, setProgress] = useState(0)
  const timeoutRef = useRef(null)
  const maxLoadingTimeRef = useRef(null)

  // Cleanup function for timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxLoadingTimeRef.current) {
      clearTimeout(maxLoadingTimeRef.current)
      maxLoadingTimeRef.current = null
    }
  }, [])

  // Auto-increment progress when loading
  useEffect(() => {
    let interval
    if (isLoading && progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 15
          return Math.min(prev + increment, 90)
        })
      }, 500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLoading, progress])

  const startLoading = useCallback(() => {
    clearTimeouts()
    setIsLoading(true)
    setProgress(0)

    // Set maximum loading time to prevent infinite loading
    maxLoadingTimeRef.current = setTimeout(() => {
      stopLoading()
    }, 3000) // Reduced from 5000ms to 3000ms
  }, [clearTimeouts])

  const stopLoading = useCallback(() => {
    clearTimeouts()
    setProgress(100)
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 200) // Reduced from 300ms to 200ms
  }, [clearTimeouts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts()
    }
  }, [clearTimeouts])

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading,
        startLoading,
        stopLoading,
        setProgress,
      }}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingSpinner
            fullPage
            size="large"
            progress={progress}
          />
        )}
      </AnimatePresence>
      {children}
    </LoadingContext.Provider>
  )
} 
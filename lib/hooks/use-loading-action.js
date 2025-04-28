/**
 * useLoadingAction Hook
 * 
 * Custom hook to handle loading states for buttons and actions
 * Provides loading state and handler with automatic loading management
 */

"use client"

import { useState, useCallback } from 'react'

export function useLoadingAction() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadingAction = useCallback(async (action) => {
    try {
      setIsLoading(true)
      await action()
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    handleLoadingAction
  }
} 
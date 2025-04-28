/**
 * Navigation Loading Provider
 * 
 * Handles loading states during page navigation and route changes
 * Uses the LoadingProvider to show loading animations during transitions
 */

"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/components/ui/loading-provider'

export function NavigationLoadingProvider({ children }) {
  const pathname = usePathname()
  const { startLoading, stopLoading } = useLoading()

  // Handle route changes
  useEffect(() => {
    let timeoutId;

    const handleRouteChange = () => {
      startLoading()
      // Always ensure loading stops after a maximum duration
      timeoutId = setTimeout(() => {
        stopLoading()
      }, 100) // Reduced from 2000ms to 1000ms for faster transitions
    }

    handleRouteChange()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      stopLoading() // Ensure loading is stopped when component unmounts
    }
  }, [pathname, startLoading, stopLoading])

  return children
} 
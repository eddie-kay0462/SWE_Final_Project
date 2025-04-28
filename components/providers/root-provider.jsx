/**
 * Root Provider Component
 * 
 * Combines all application providers in the correct order
 * Ensures consistent loading states and animations across the app
 */

"use client"

import { LoadingProvider } from '@/components/ui/loading-provider'
import { NavigationLoadingProvider } from './navigation-loading-provider'

export function RootProvider({ children }) {
  return (
    <LoadingProvider>
      <NavigationLoadingProvider>
        {children}
      </NavigationLoadingProvider>
    </LoadingProvider>
  )
} 
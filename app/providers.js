'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster 
          position="top-right"
          expand={true}
          richColors
          theme="system"
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
} 
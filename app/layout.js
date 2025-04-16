import React from "react"
import { LoadingProvider } from "@/components/ui/loading-provider"
import { ThemeProvider } from "@/contexts/theme-context"
// import { ToastProvider } from "@/hooks/use-toast"
import "./globals.css"
import Providers from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* <ToastProvider>{children}</ToastProvider> */}
        <Providers>
          <ThemeProvider>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html> 
  )
}

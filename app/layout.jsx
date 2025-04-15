import React from "react"
import { LoadingProvider } from "@/components/ui/loading-provider"
import { ThemeProvider } from "@/contexts/theme-context"
// import { ToastProvider } from "@/hooks/use-toast"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* <ToastProvider>{children}</ToastProvider> */}
        <ThemeProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

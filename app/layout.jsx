import React from "react"
import { LoadingProvider } from "@/components/loading-provider"
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from "@/hooks/useAuth"
// import { ToastProvider } from "@/hooks/use-toast"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <ToastProvider>{children}</ToastProvider> */}
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

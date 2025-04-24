import React from "react"
import { LoadingProvider } from "@/components/ui/loading-provider"
// import { ThemeProvider } from "@/contexts/theme-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Providers } from './providers'
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <LoadingProvider>
            {children}
            <SpeedInsights />
          </LoadingProvider>
        </Providers>
      </body>
    </html> 
  )
}

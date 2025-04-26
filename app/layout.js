import React from "react"
import { LoadingProvider } from "@/components/ui/loading-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Providers } from './providers'
import "./globals.css"
import { cn } from "@/lib/utils"
import { fontSans } from "@/styles/fonts"
import { ThemeProvider } from "@/components/ui/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <LoadingProvider>
              {children}
              <SpeedInsights />
            </LoadingProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html> 
  )
}

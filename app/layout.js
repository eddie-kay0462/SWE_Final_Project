import React from "react"
import { LoadingProvider } from "@/components/ui/loading-provider"
// import { ThemeProvider } from "@/contexts/theme-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Providers } from './providers'
import "./globals.css"

export const metadata = {
  title: 'CSOFT',
  description: 'Career Services Online Facilitation Tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
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

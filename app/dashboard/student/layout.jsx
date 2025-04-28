// app/dashboard/student/layout.jsx
"use client"

import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { RootProvider } from "@/components/providers/root-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900 flex items-center justify-center">
    <LoadingSpinner size="xl" showText={true} />
  </div>
)

export default function StudentDashboardLayout({ children }) {
  return (
    <RootProvider>
      <Suspense fallback={<LoadingFallback />}>
        <DashboardLayout userRole="student">
          {children}
        </DashboardLayout>
      </Suspense>
      <SpeedInsights />
    </RootProvider>
  )
}
// app/dashboard/student/layout.jsx
"use client"

import { Suspense } from "react"
import { usePathname, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { SpeedInsights } from "@vercel/speed-insights/next"
import DashboardLayout from "@/components/layout/dashboard-layout"

// Dynamically import the dashboard component with loading state
const StudentDashboard = dynamic(
  () => import("@/app/dashboard/components/student-dashboard"),
  {
    loading: () => (
      <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
        </div>
      </div>
    )
  }
)

export default function StudentDashboardLayout({ children }) {
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
          </div>
        </div>
      }>
        <DashboardLayout userRole="student">
          {children}
        </DashboardLayout>
      </Suspense>
      <SpeedInsights />
    </>
  )
}
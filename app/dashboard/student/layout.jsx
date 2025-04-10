// app/dashboard/student/layout.jsx
"use client"

import { Suspense } from "react"
import { usePathname, useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamically import the dashboard layout with no SSR
const DashboardLayout = dynamic(
  () => import("@/components/layout/dashboard-layout"),
  { 
    ssr: false,
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
  const pathname = usePathname()
  const router = useRouter()
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
        </div>
      </div>
    }>
      <DashboardLayout 
        userRole="student" 
        userName="Sam Student" 
        userEmail="student@example.com"
      >
        {children}
      </DashboardLayout>
    </Suspense>
  )
}
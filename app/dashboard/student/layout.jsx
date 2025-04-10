// app/dashboard/student/layout.jsx
"use client"

<<<<<<< HEAD
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
=======
import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
>>>>>>> 8107b690c51f507047b1cdfb57ca607ebefd3f00

export default function StudentDashboardLayout({ children }) {
  return (
<<<<<<< HEAD
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
=======
    <DashboardLayout userRole="student">
      {children}
    </DashboardLayout>
>>>>>>> 8107b690c51f507047b1cdfb57ca607ebefd3f00
  )
}
// app/dashboard/student/layout.jsx
"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function StudentDashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  
  return (
    <DashboardLayout 
      userRole="admin" 
      userName="Carol Advisor" 
      userEmail="admin@example.com"
    >
      {children}
    </DashboardLayout>
  )
}
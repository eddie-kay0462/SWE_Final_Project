"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function CareerRoadmapLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  
  return (
    <DashboardLayout 
      userRole="student" 
      userName="Sam Student" 
      userEmail="student@example.com"
    >
      {children}
    </DashboardLayout>
  )
} 
// app/dashboard/student/layout.jsx
"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function StudentDashboardLayout({ children }) {
  return (
    <DashboardLayout userRole="student">
      {children}
    </DashboardLayout>
  )
}
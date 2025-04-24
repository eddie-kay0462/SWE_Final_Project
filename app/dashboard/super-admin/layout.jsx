// app/dashboard/student/layout.jsx
"use client"

import { useState } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function SuperAdminDashboardLayout({ children }) {
  return (
    <>
      <DashboardLayout userRole="superAdmin">
        {children}
      </DashboardLayout>
      <SpeedInsights />
    </>
  )
}
// app/dashboard/admin/layout.jsx
"use client"

import { useState } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function AdminDashboardLayout({ children }) {
  return (
    <>
      <DashboardLayout userRole="admin">
        {children}
      </DashboardLayout>
      <SpeedInsights />
    </>
  )
}
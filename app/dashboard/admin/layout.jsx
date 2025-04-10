// app/dashboard/admin/layout.jsx
"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function AdminDashboardLayout({ children }) {
  return (
    <DashboardLayout userRole="admin">
      {children}
    </DashboardLayout>
  )
}
// app/dashboard/admin/layout.jsx
"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { RootProvider } from "@/components/providers/root-provider"

export default function AdminDashboardLayout({ children }) {
  return (
    <RootProvider>
      <DashboardLayout userRole="admin">
        {children}
      </DashboardLayout>
      <SpeedInsights />
    </RootProvider>
  )
}
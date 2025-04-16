"use client"

import { useState, useEffect } from "react"
import SuperAdminDashboard from "../components/super-admin-dashboard"
import { getGreeting } from "@/app/utils/greetings"

// Mock data for demonstration (you can import this from a shared file)
const mockData = {
  activeUsers: 1245,
  recentLogins: 78,
  careerSessions: 12,
  internshipRequests: {
    total: 156,
    pending: 34,
    approved: 98,
    rejected: 24,
  },
  systemHealth: {
    serverLoad: 32,
    apiResponseTime: 120,
    databaseUptime: 99.98,
  },
  recentUsers: [
    { id: 1, name: "John Doe", role: "Student", status: "Active", lastLogin: "2 mins ago" },
    { id: 2, name: "Jane Smith", role: "Admin", status: "Active", lastLogin: "15 mins ago" },
    { id: 3, name: "Robert Johnson", role: "Student", status: "Active", lastLogin: "1 hour ago" },
    { id: 4, name: "Emily Davis", role: "Student", status: "Inactive", lastLogin: "2 days ago" },
  ],
}

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")

  // Initial load animation and greeting setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    // Set the greeting with a mock name (replace with actual user name from auth)
    setGreeting(getGreeting("Super Admin"))

    return () => clearTimeout(timer)
  }, [])

  return (
    <SuperAdminDashboard mockData={mockData} loading={loading} greeting={greeting} />
  )
}


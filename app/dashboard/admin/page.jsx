"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AdminDashboard from "../components/admin-dashboard"
import { getGreeting } from "@/app/utils/greetings"

// Mock data for demonstration (you can import this from a shared file)
const mockData = {
  pendingRequests: 34,
  approvedRequests: 98,
  rejectedRequests: 24,
  upcomingSessions: [
    { id: 1, title: "Resume Workshop", date: "2025-03-20", attendees: 45 },
    { id: 2, title: "Interview Skills", date: "2025-03-22", attendees: 32 },
    { id: 3, title: "LinkedIn Optimization", date: "2025-03-25", attendees: 28 },
  ],
  studentEngagement: {
    thisWeek: 156,
    lastWeek: 142,
    change: 9.8,
  },
  urgentNotifications: [
    { id: 1, type: "request", message: "New internship request from John Doe" },
    { id: 2, type: "session", message: "Resume Workshop RSVP deadline in 2 days" },
    { id: 3, type: "followup", message: "Student follow-up reminder: Emily Davis" },
  ],
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")

  // Initial load animation and greeting setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    // Set the greeting with a mock name (replace with actual user name from auth)
    setGreeting(getGreeting("Admin"))

    return () => clearTimeout(timer)
  }, [])

  return (
    <AdminDashboard mockData={mockData} loading={loading} greeting={greeting} />
  )
}


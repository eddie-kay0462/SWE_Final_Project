/*
*
*
*
*
Delete Later
*
*
*
*
*/



"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import SuperAdminDashboard from "./components/super-admin-dashboard"
import AdminDashboard from "./components/admin-dashboard"
import StudentDashboard from "./components/student-dashboard"

// Mock data for demonstration
const mockData = {
  superAdmin: {
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
  },
  admin: {
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
  },
  student: {
    internshipRequests: {
      pending: 1,
      approved: 2,
      rejected: 0,
    },
    upcomingSessions: [
      { id: 1, title: "Resume Workshop", date: "2025-03-20", location: "Career Center" },
      { id: 2, title: "Interview Skills", date: "2025-03-22", location: "Online" },
    ],
    careerEngagement: {
      progress: 65,
      sessionsAttended: 8,
      internshipsApplied: 3,
      resourcesUsed: 12,
    },
    notifications: [
      { id: 1, type: "status", message: "Your internship request has been approved!" },
      { id: 2, type: "reminder", message: "Resume Workshop starts in 3 days" },
      { id: 3, type: "recommendation", message: "New Resume Review Event This Week!" },
    ],
  },
}

export default function Dashboard() {
  // In a real app, you would fetch the user role from your auth system
  const [userRole, setUserRole] = useState("superAdmin")
  const [loading, setLoading] = useState(true)

  // For demo purposes, let's add a way to switch between roles
  const cycleRole = () => {
    setLoading(true)
    setTimeout(() => {
      if (userRole === "superAdmin") setUserRole("admin")
      else if (userRole === "admin") setUserRole("student")
      else setUserRole("superAdmin")
      setLoading(false)
    }, 300)
  }

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case "superAdmin":
        return <SuperAdminDashboard mockData={mockData.superAdmin} loading={loading} />
      case "admin":
        return <AdminDashboard mockData={mockData.admin} loading={loading} />
      case "student":
        return <StudentDashboard mockData={mockData.student} loading={loading} />
      default:
        return <StudentDashboard mockData={mockData.student} loading={loading} />
    }
  }

  return (

    <DashboardLayout
      userRole={userRole}
      userName={userRole === "superAdmin" ? "Alex Admin" : userRole === "admin" ? "Carol Advisor" : "Sam Student"}
      userEmail={`${userRole}@example.com`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-medium">Dashboard</h1>
        {/* Role switcher for demo purposes */}
        <button
          onClick={cycleRole}
          className="px-4 py-2 bg-[#A91827] text-white rounded-lg text-sm hover:bg-[#A91827]/90 transition-colors"
        >
          Switch to {userRole === "superAdmin" ? "Admin" : userRole === "admin" ? "Student" : "Super Admin"} View
        </button>
      </div>

      {/* Render the appropriate dashboard3 */}
      {renderDashboard()}
    </DashboardLayout>
  )
}


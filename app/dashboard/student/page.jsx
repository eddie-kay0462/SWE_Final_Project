"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import the student dashboard component
const StudentDashboard = dynamic(
  () => import("../components/student-dashboard"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    ),
    ssr: false
  }
)

// Mock data for demonstration (you can import this from a shared file)
const mockData = {
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
}

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true)

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    }>
      <StudentDashboard mockData={mockData} loading={loading} />
    </Suspense>
  )
}


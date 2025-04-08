"use client"

import { useState, useEffect } from "react"
import StudentDashboard from "../components/student-dashboard"
import { getGreeting } from "@/app/utils/greetings"

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
  const [greeting, setGreeting] = useState("")

  // Initial load animation and greeting setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    // Set the greeting with a mock name (replace with actual user name from auth)
    setGreeting(getGreeting("Student"))

    return () => clearTimeout(timer)
  }, [])

  return (   
    <StudentDashboard mockData={mockData} loading={loading} greeting={greeting} />
  )
}


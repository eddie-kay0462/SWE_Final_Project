"use client"

import { useState, useEffect } from "react"
import StudentDashboard from "../components/student-dashboard"
import { getGreeting } from "@/app/utils/greetings"

export default function StudentDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
<<<<<<< HEAD
  const [greeting, setGreeting] = useState("")

  // Initial load animation and greeting setup
=======
  const [error, setError] = useState(null)

>>>>>>> origin/main
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/dashboard/student')

<<<<<<< HEAD
    // Set the greeting with a mock name (replace with actual user name from auth)
    setGreeting(getGreeting("Student"))

    return () => clearTimeout(timer)
  }, [])

  return (   
    <StudentDashboard mockData={mockData} loading={loading} greeting={greeting} />
=======
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e)
        setError(e.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading dashboard: {error}</div>
  }

  if (!dashboardData) {
    return <div>No data available.</div>
  }

  return (
    <StudentDashboard dashboardData={dashboardData} loading={loading} />
>>>>>>> origin/main
  )
}


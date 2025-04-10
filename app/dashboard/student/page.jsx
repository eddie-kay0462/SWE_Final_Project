"use client"

<<<<<<< HEAD
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
=======
import { useState, useEffect } from "react"
import StudentDashboard from "../components/student-dashboard"
import getTimeBasedGreeting from "@/utils/greetings"
>>>>>>> 8107b690c51f507047b1cdfb57ca607ebefd3f00

export default function StudentDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [greetings, setGreetings] = useState({ greeting: "", wellWish: "" })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/dashboard/student')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setDashboardData(data)
        
        // Set greetings based on user's name
        if (data.user?.fname) {
          setGreetings(getTimeBasedGreeting(data.user.fname))
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e)
        setError(e.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

<<<<<<< HEAD
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
<<<<<<< HEAD
    <StudentDashboard dashboardData={dashboardData} loading={loading} />
=======
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    }>
      <StudentDashboard mockData={mockData} loading={loading} />
    </Suspense>
>>>>>>> eddies-branch
=======
    <div className="space-y-6">
      {/* Greetings Section */}
      <div className="space-y-1 pl-4 pt-2">
        <h1 className="text-3xl font-serif">{greetings.greeting}</h1>
        <p className="text-neutral-600 dark:text-neutral-400">{greetings.wellWish}</p>
      </div>
      
      <StudentDashboard dashboardData={dashboardData} loading={loading} />
    </div>
>>>>>>> 8107b690c51f507047b1cdfb57ca607ebefd3f00
  )
}


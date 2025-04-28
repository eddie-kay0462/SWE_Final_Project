"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLoading } from "@/components/ui/loading-provider"
import { useLoadingAction } from "@/lib/hooks/use-loading-action"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import StudentDashboard from "../components/student-dashboard"
import getTimeBasedGreeting from "@/utils/greetings"

export default function StudentDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [greetings, setGreetings] = useState({ greeting: "", wellWish: "" })
  const { startLoading, stopLoading } = useLoading()
  const { isLoading, handleLoadingAction } = useLoadingAction()

  useEffect(() => {
    const fetchData = async () => {
      try {
        startLoading()
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
        stopLoading()
      }
    }

    fetchData()
  }, [startLoading, stopLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" showText={true} />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-900/10"
      >
        Error loading dashboard: {error}
      </motion.div>
    )
  }

  if (!dashboardData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-neutral-600 dark:text-neutral-400"
      >
        No data available.
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {/* Greetings Section */}
        <motion.div
          key="greetings"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1 pl-4 pt-2"
        >
          <motion.h1 
            className="text-3xl font-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {greetings.greeting}
          </motion.h1>
          <motion.p 
            className="text-neutral-600 dark:text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {greetings.wellWish}
          </motion.p>
        </motion.div>
      </AnimatePresence>
      
      <StudentDashboard 
        dashboardData={dashboardData} 
        loading={isLoading}
        onAction={(action) => handleLoadingAction(action)}
      />
    </motion.div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLoading } from "@/components/ui/loading-provider"
import { useLoadingAction } from "@/lib/hooks/use-loading-action"
import AdminDashboard from "../components/admin-dashboard"
import { getGreeting } from "@/app/utils/greetings"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// // Mock data for demonstration (you can import this from a shared file)
// const mockData = {
//   pendingRequests: 34,
//   approvedRequests: 98,
//   rejectedRequests: 24,
//   upcomingSessions: [
//     { id: 1, title: "Resume Workshop", date: "2025-03-20", attendees: 45 },
//     { id: 2, title: "Interview Skills", date: "2025-03-22", attendees: 32 },
//     { id: 3, title: "LinkedIn Optimization", date: "2025-03-25", attendees: 28 },
//   ],
//   studentEngagement: {
//     thisWeek: 156,
//     lastWeek: 142,
//     change: 9.8,
//   },
//   urgentNotifications: [
//     { id: 1, type: "request", message: "New internship request from John Doe" },
//     { id: 2, type: "session", message: "Resume Workshop RSVP deadline in 2 days" },
//     { id: 3, type: "followup", message: "Student follow-up reminder: Emily Davis" },
//   ],
// }

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")
  const { startLoading, stopLoading } = useLoading()
  const { isLoading, handleLoadingAction } = useLoadingAction()

  // Simulate data loading
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        startLoading()
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setGreeting(getGreeting("Admin"))
      } finally {
        stopLoading()
        setLoading(false)
      }
    }

    loadDashboard()
  }, [startLoading, stopLoading])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" showText={true} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AdminDashboard 
        mockData={mockData} 
        loading={isLoading} 
        greeting={greeting}
        onAction={(action) => handleLoadingAction(action)}
      />
    </motion.div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLoading } from "@/components/ui/loading-provider"
import { useLoadingAction } from "@/lib/hooks/use-loading-action"
import AdminDashboard from "../components/admin-dashboard"
import { getGreeting } from "@/app/utils/greetings"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")
  const [dashboardData, setDashboardData] = useState(null)
  const { startLoading, stopLoading } = useLoading()
  const { isLoading, handleLoadingAction } = useLoadingAction()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        startLoading()
        // Fetch real data from the API
        const response = await fetch('/api/dashboard/admin')
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Please login to continue")
            router.push('/auth/login')
            return
          }
          if (response.status === 403) {
            toast.error("You don't have permission to access this page")
            router.push('/')
            return
          }
          throw new Error(data.error || 'Failed to fetch dashboard data')
        }

        setDashboardData(data)
        setGreeting(getGreeting("Admin"))
      } catch (error) {
        console.error('Error loading dashboard:', error)
        toast.error(error.message || "Failed to load dashboard data")
      } finally {
        stopLoading()
        setLoading(false)
      }
    }

    loadDashboard()
  }, [startLoading, stopLoading, router])

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
        data={dashboardData} 
        loading={isLoading} 
        greeting={greeting}
        onAction={(action) => handleLoadingAction(action)}
      />
    </motion.div>
  )
}


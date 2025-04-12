/**
 * Admin Dashboard Page
 * 
 * <p>Primary dashboard view for admin users, displaying an overview
 * of internship requests, sessions, student engagement, and notifications.</p>
 * 
 * @author Nana Amoako
 * @version 1.1.0
 */
"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useNotifications } from "@/hooks/useNotifications"

// Dynamically import the dashboard component with loading state
const AdminDashboard = dynamic(
  () => import("@/components/dashboard/admin-dashboard"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    ),
    ssr: false
  }
)

/**
 * Admin dashboard page component
 * 
 * @return {JSX.Element} The admin dashboard page
 */
export default function AdminDashboardPage() {
  const { userData, loading: authLoading } = useAuth()
  
  // Get notifications using our custom hook
  const { 
    notifications: adminNotifications, 
    unreadCount, 
    loading: notificationsLoading 
  } = useNotifications()

  // Fetch internship requests
  const { 
    data: internshipRequests, 
    count: totalRequests,
    loading: requestsLoading 
  } = useSupabaseData('internship_requests', {
    initialFilter: null, // Get all requests as an admin
  })

  // Count pending/approved/rejected requests
  const pendingRequests = internshipRequests?.filter(req => req.status === 'pending')?.length || 0
  const approvedRequests = internshipRequests?.filter(req => req.status === 'approved')?.length || 0
  const rejectedRequests = internshipRequests?.filter(req => req.status === 'rejected')?.length || 0

  // Fetch upcoming sessions
  const { 
    data: upcomingSessions, 
    loading: sessionsLoading 
  } = useSupabaseData('career_sessions', {
    initialFilter: (query) => {
      const today = new Date().toISOString().split('T')[0]
      return query
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3)
    }
  })

  // Fetch student engagement data (active students this week)
  const [studentEngagement, setStudentEngagement] = useState({
    thisWeek: 0,
    lastWeek: 0,
    change: 0
  })

  // Calculate student engagement data
  useEffect(() => {
    // This would typically be fetched from analytics data
    // For now, using mock data
    setStudentEngagement({
      thisWeek: 156,
      lastWeek: 142,
      change: 9.8
    })
  }, [])

  // Convert urgent notifications
  const urgentNotifications = adminNotifications?.slice(0, 3).map(notification => ({
    id: notification.id,
    type: notification.category || 'request',
    message: notification.message
  })) || []

  // Combined loading state
  const isLoading = 
    authLoading || 
    notificationsLoading || 
    requestsLoading || 
    sessionsLoading

  // Prepare dashboard data for the component
  const dashboardData = {
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    upcomingSessions: upcomingSessions || [],
    studentEngagement,
    urgentNotifications
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 pl-4 pt-2">
        <h1 className="text-3xl font-serif">Admin Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Overview of career services activities and student engagement
        </p>
      </div>
      
      <AdminDashboard 
        mockData={dashboardData} 
        loading={isLoading} 
      />
    </div>
  )
}


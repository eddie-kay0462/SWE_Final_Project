/**
 * Super Admin Dashboard Page
 * 
 * <p>Primary dashboard view for super admin users, displaying system-wide metrics,
 * user management overview, and system health information.</p>
 * 
 * @author Nana Amoako
 * @version 1.1.0
 */
"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useUserRole } from "@/hooks/useUserRole"

// Dynamically import the dashboard component with loading state
const SuperAdminDashboard = dynamic(
  () => import("@/components/dashboard/super-admin-dashboard"),
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
 * Super admin dashboard page component
 * 
 * @return {JSX.Element} The super admin dashboard page
 */
export default function SuperAdminDashboardPage() {
  const { userData, loading: authLoading } = useAuth()
  const { isSuperAdmin } = useUserRole()
  
  // Fetch all users
  const { 
    data: allUsers, 
    count: totalUsers,
    loading: usersLoading 
  } = useSupabaseData('users', {
    initialFilter: null,
  })

  // Fetch recent logins (this would be from an auth logs table in a real app)
  const [recentLogins, setRecentLogins] = useState(78)

  // Fetch career sessions
  const { 
    count: careerSessions,
    loading: sessionsLoading 
  } = useSupabaseData('career_sessions')

  // Fetch internship requests
  const { 
    data: internshipRequests, 
    count: totalRequests,
    loading: requestsLoading 
  } = useSupabaseData('internship_requests')

  // Count pending/approved/rejected requests
  const pendingRequests = internshipRequests?.filter(req => req.status === 'pending')?.length || 0
  const approvedRequests = internshipRequests?.filter(req => req.status === 'approved')?.length || 0
  const rejectedRequests = internshipRequests?.filter(req => req.status === 'rejected')?.length || 0

  // Fetch system health metrics (these would come from monitoring services in a real app)
  const [systemHealth, setSystemHealth] = useState({
    serverLoad: 0,
    apiResponseTime: 0,
    databaseUptime: 0
  })

  // Fetch recent users (most recently created accounts)
  const { 
    data: recentUsers,
    loading: recentUsersLoading 
  } = useSupabaseData('users', {
    initialFilter: (query) => {
      return query
        .order('created_at', { ascending: false })
        .limit(4)
    }
  })

  // Transform recent users for display
  const formattedRecentUsers = recentUsers?.map((user, index) => ({
    id: index + 1,
    name: `${user.fname} ${user.lname}`,
    role: user.role_id === 1 ? "Super Admin" : user.role_id === 2 ? "Admin" : "Student",
    status: "Active", // You'd need a status field in the users table for this
    lastLogin: "Recently" // You'd need to track login timestamps for this
  })) || []

  // Set system health mock data
  useEffect(() => {
    // In a real app, these would be fetched from monitoring services
    setSystemHealth({
      serverLoad: 32,
      apiResponseTime: 120,
      databaseUptime: 99.98,
    })
  }, [])

  // Combined loading state
  const isLoading = 
    authLoading || 
    usersLoading || 
    sessionsLoading || 
    requestsLoading ||
    recentUsersLoading

  // Prepare dashboard data for the component
  const dashboardData = {
    activeUsers: totalUsers || 0,
    recentLogins,
    careerSessions: careerSessions || 0,
    internshipRequests: {
      total: totalRequests || 0,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
    },
    systemHealth,
    recentUsers: formattedRecentUsers,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    )
  }

  // If not a super admin, show access denied
  if (!isSuperAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 pl-4 pt-2">
        <h1 className="text-3xl font-serif">System Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          System-wide metrics and administrative controls
        </p>
      </div>
      
      <SuperAdminDashboard 
        mockData={dashboardData} 
        loading={isLoading} 
      />
    </div>
  )
}


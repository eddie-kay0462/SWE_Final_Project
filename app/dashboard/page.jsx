"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Users, FileText, Calendar, ArrowUp, CheckCircle, Clock, XCircle, Server, Activity } from "lucide-react"

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

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userRole === "superAdmin" ? "Alex Admin" : userRole === "admin" ? "Carol Advisor" : "Sam Student"}
      userEmail={`${userRole}@example.com`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-medium">Dashboard</h1>
        {/* Role switcher for demo purposes */}
        <button onClick={cycleRole} className="px-4 py-2 bg-[#A91827] text-white rounded-lg text-sm hover:bg-[#A91827]/90 transition-colors">
          Switch to {userRole === "superAdmin" ? "Admin" : userRole === "admin" ? "Student" : "Super Admin"} View
        </button>
      </div>

      {/* Super Admin Dashboard */}
      {userRole === "superAdmin" && (
        <div className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Active Users",
                value: mockData.superAdmin.activeUsers,
                icon: Users,
                color: "blue",
                change: { value: "12%", text: "from last month", icon: ArrowUp, color: "green" }
              },
              {
                title: "Career Sessions",
                value: mockData.superAdmin.careerSessions,
                icon: Calendar,
                color: "purple",
                change: { value: "3", text: "new this week", icon: ArrowUp, color: "green" }
              },
              {
                title: "Internship Requests",
                value: mockData.superAdmin.internshipRequests.total,
                icon: FileText,
                color: "amber",
                change: { value: mockData.superAdmin.internshipRequests.pending, text: "pending", icon: Clock, color: "amber" }
              },
              {
                title: "System Health",
                value: `${mockData.superAdmin.systemHealth.databaseUptime}%`,
                icon: Server,
                color: "green",
                change: { value: "", text: "All systems operational", icon: Activity, color: "green" }
              }
            ].map((stat, index) => (
              <div 
                key={stat.title} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`h-12 w-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-full flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
                <p className={`text-xs text-${stat.change.color}-600 dark:text-${stat.change.color}-400 mt-2 flex items-center`}>
                  <stat.change.icon className="h-3 w-3 mr-1" /> {stat.change.value && `${stat.change.value} `}{stat.change.text}
                </p>
              </div>
            ))}
          </div>

          {/* System Health & Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <h3 className="text-lg font-medium mb-4">System Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Server Load</p>
                    <p className="text-sm font-medium">{mockData.superAdmin.systemHealth.serverLoad}%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${mockData.superAdmin.systemHealth.serverLoad}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">API Response Time</p>
                    <p className="text-sm font-medium">{mockData.superAdmin.systemHealth.apiResponseTime}ms</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(mockData.superAdmin.systemHealth.apiResponseTime / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Database Uptime</p>
                    <p className="text-sm font-medium">{mockData.superAdmin.systemHealth.databaseUptime}%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${mockData.superAdmin.systemHealth.databaseUptime}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center transition-colors">
                  View detailed report
                  <ArrowUp className="h-4 w-4 ml-1 rotate-45 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <h3 className="text-lg font-medium mb-4">Recent Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockData.superAdmin.recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">{user.name}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.role}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.lastLogin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                  View all users
                  <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
                </button>
              </div>
            </div>
          </div>

          {/* Internship Requests Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h3 className="text-lg font-medium mb-4">Internship Requests Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.superAdmin.internshipRequests.pending}</h3>
                  </div>
                  <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.superAdmin.internshipRequests.approved}</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.superAdmin.internshipRequests.rejected}</h3>
                  </div>
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                View all requests
                <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {userRole === "admin" && (
        <div className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Internship Requests Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h3 className="text-lg font-medium mb-4">Internship Requests Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.admin.pendingRequests}</h3>
                  </div>
                  <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.admin.approvedRequests}</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.admin.rejectedRequests}</h3>
                  </div>
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-[#A91827] text-white rounded-lg text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected
              </button>
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Reject Selected
              </button>
              <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                View Details
              </button>
            </div>
          </div>

          {/* Upcoming Career Sessions & Student Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Career Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <h3 className="text-lg font-medium mb-4">Upcoming Career Sessions</h3>
              <div className="space-y-4">
                {mockData.admin.upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{session.date}</p>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs font-medium text-blue-800 dark:text-blue-300">
                        {session.attendees} RSVPs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                  View all sessions
                  <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
                </button>
              </div>
            </div>

            {/* Student Engagement */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <h3 className="text-lg font-medium mb-4">Student Engagement Metrics</h3>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</p>
                  <h3 className="text-2xl font-bold mt-1">{mockData.admin.studentEngagement.thisWeek}</h3>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Week</p>
                  <h3 className="text-2xl font-bold mt-1">{mockData.admin.studentEngagement.lastWeek}</h3>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Change</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                    +{mockData.admin.studentEngagement.change}%
                  </h3>
                </div>
              </div>
              <div className="h-40 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Engagement Chart Placeholder</p>
              </div>
              <div className="mt-6">
                <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                  View detailed analytics
                  <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
                </button>
              </div>
            </div>
          </div>

          {/* Urgent Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h3 className="text-lg font-medium mb-4">Urgent Notifications</h3>
            <div className="space-y-4">
              {mockData.admin.urgentNotifications.map((notification) => (
                <div key={notification.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-start">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      notification.type === "request"
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : notification.type === "session"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-purple-100 dark:bg-purple-900/30"
                    }`}
                  >
                    {notification.type === "request" ? (
                      <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    ) : notification.type === "session" ? (
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1 bg-[#A91827] text-white rounded text-xs">Take Action</button>
                      <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Dashboard */}
      {userRole === "student" && (
        <div className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Internship Request Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h3 className="text-lg font-medium mb-4">Internship Request Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.student.internshipRequests.pending}</h3>
                  </div>
                  <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.student.internshipRequests.approved}</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
                    <h3 className="text-2xl font-bold mt-1">{mockData.student.internshipRequests.rejected}</h3>
                  </div>
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-[#A91827] text-white rounded-lg text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Submit New Request
              </button>
              <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                View Request Details
              </button>
            </div>
          </div>

          {/* Upcoming Career Sessions & Career Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Career Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <h3 className="text-lg font-medium mb-4">Upcoming Career Sessions</h3>
              <div className="space-y-4">
                {mockData.student.upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {session.date} • {session.location}
                        </p>
                      </div>
                      <button className="bg-[#A91827] px-3 py-1 rounded text-xs font-medium text-white">RSVP</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                  View all sessions
                  <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
                </button>
              </div>
            </div>

            {/* Career Engagement */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <h3 className="text-lg font-medium mb-4">Career Engagement Progress</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Overall Progress</p>
                  <p className="text-sm font-medium">{mockData.student.careerEngagement.progress}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#A91827] h-2 rounded-full"
                    style={{ width: `${mockData.student.careerEngagement.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sessions Attended</p>
                  <p className="text-xl font-bold mt-1">{mockData.student.careerEngagement.sessionsAttended}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Internships Applied</p>
                  <p className="text-xl font-bold mt-1">{mockData.student.careerEngagement.internshipsApplied}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Resources Used</p>
                  <p className="text-xl font-bold mt-1">{mockData.student.careerEngagement.resourcesUsed}</p>
                </div>
              </div>
              <div className="mt-6">
                <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                  View career roadmap
                  <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h3 className="text-lg font-medium mb-4">Important Notifications</h3>
            <div className="space-y-4">
              {mockData.student.notifications.map((notification) => (
                <div key={notification.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-start">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      notification.type === "status"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : notification.type === "reminder"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-purple-100 dark:bg-purple-900/30"
                    }`}
                  >
                    {notification.type === "status" ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : notification.type === "reminder" ? (
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    <div className="mt-2">
                      <button className="px-3 py-1 bg-[#A91827] text-white rounded text-xs">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}


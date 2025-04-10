"use client"

import { memo } from "react"
import { CheckCircle, Clock, XCircle, Calendar, ArrowUp, FileText, QrCode, History } from "lucide-react"
import Link from "next/link"

// Memoized components to prevent unnecessary re-renders
const StatusCard = memo(({ title, count, icon: Icon, color }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{count}</h3>
      </div>
      <div className={`h-10 w-10 ${color} rounded-full flex items-center justify-center`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
))

const SessionCard = memo(({ session }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
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
))

const NotificationCard = memo(({ notification }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-start">
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
))

const StudentDashboard = ({ mockData, loading }) => {
  return (
    <div
      className={`space-y-6 transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
    >
      {/* Internship Request Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Internship Request Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="Pending"
            count={mockData.internshipRequests.pending}
            icon={Clock}
            color="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatusCard
            title="Approved"
            count={mockData.internshipRequests.approved}
            icon={CheckCircle}
            color="bg-green-100 dark:bg-green-900/30"
          />
          <StatusCard
            title="Rejected"
            count={mockData.internshipRequests.rejected}
            icon={XCircle}
            color="bg-red-100 dark:bg-red-900/30"
          />
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

      {/* Upcoming Career Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Upcoming Career Sessions</h3>
          <div className="flex gap-2">
            <Link href="/dashboard/student/attendance" className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
              <QrCode className="h-4 w-4 mr-1" />
              Check-in
            </Link>
            <Link href="/dashboard/student/attendance-history" className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
              <History className="h-4 w-4 mr-1" />
              History
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          {mockData.upcomingSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Career Engagement Progress</h3>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Overall Progress</p>
            <p className="text-sm font-medium">{mockData.careerEngagement.progress}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#A91827] h-2 rounded-full transition-all duration-500"
              style={{ width: `${mockData.careerEngagement.progress}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Sessions Attended</p>
            <p className="text-xl font-bold mt-1">{mockData.careerEngagement.sessionsAttended}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Internships Applied</p>
            <p className="text-xl font-bold mt-1">{mockData.careerEngagement.internshipsApplied}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Resources Used</p>
            <p className="text-xl font-bold mt-1">{mockData.careerEngagement.resourcesUsed}</p>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/dashboard/student/career-roadmap" className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
            View career roadmap
            <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
          </Link>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Important Notifications</h3>
        <div className="space-y-4">
          {mockData.notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
        <div className="mt-6">
          <Link href="/dashboard/student/notifications">
            <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
              View all Notifications
              <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default memo(StudentDashboard)


"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, XCircle, Calendar, ArrowUp, FileText, QrCode, History, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'

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

const StudentDashboard = ({ dashboardData, loading }) => {
  const router = useRouter()

  if (loading || !dashboardData) {
    return <div>Loading Dashboard Components...</div>
  }

  const { user, internshipStats, upcomingSessions, engagementProgress, notifications } = dashboardData

  return (
    <div className={`flex-1 p-6 md:p-8 grid gap-6 md:gap-8 transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}>
      {/* Internship Request Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Internship Request Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard
              title="Pending"
              count={internshipStats.pending}
              icon={Clock}
              color="bg-amber-100 dark:bg-amber-900/30"
            />
            <StatusCard
              title="Approved"
              count={internshipStats.approved}
              icon={CheckCircle}
              color="bg-green-100 dark:bg-green-900/30"
            />
            <StatusCard
              title="Rejected"
              count={internshipStats.rejected}
              icon={XCircle}
              color="bg-red-100 dark:bg-red-900/30"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <Button asChild>
              <Link href="/dashboard/student/internship-request/new">Submit New Request</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/student/internship-request">View Request Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Career Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Career Sessions</CardTitle>
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
          </CardHeader>
          <CardContent className="grid gap-4">
            {upcomingSessions && upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 2).map((session) => (
                <SessionCard key={session.session_id} session={session} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming sessions.</p>
            )}
            <Link href="/dashboard/student/sessions" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all sessions <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Career Engagement Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Career Engagement Progress</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-lg font-bold">{engagementProgress.overallProgress ?? 'N/A'}%</span>
            </div>
            <Progress value={engagementProgress.overallProgress ?? 0} aria-label="Career engagement progress" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sessions Attended</p>
                <h4 className="text-xl font-bold mt-1">{engagementProgress.sessionsAttended}</h4>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Internships Applied</p>
                <h4 className="text-xl font-bold mt-1">{engagementProgress.internshipsApplied}</h4>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resources Used</p>
                <h4 className="text-xl font-bold mt-1">{engagementProgress.resourcesUsed}</h4>
              </div>
            </div>
            <Link href="/dashboard/student/career-roadmap" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View career roadmap <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No important notifications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default memo(StudentDashboard)

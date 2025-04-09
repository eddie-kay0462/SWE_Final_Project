import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slot } from "@radix-ui/react-slot"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, XCircle, Bell, Users, CalendarDays, FileText, ArrowRight } from "lucide-react"

export default function StudentDashboard({ dashboardData, loading }) {
  const router = useRouter();

  if (loading || !dashboardData) {
    return <div>Loading Dashboard Components...</div>;
  }

  const { user, internshipStats, upcomingSessions, engagementProgress, notifications } = dashboardData;

  return (
    <div className="flex-1 p-6 md:p-8 grid gap-6 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Internship Request Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</p>
                <h3 className="text-2xl font-bold mt-1">{internshipStats.totalRequests}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Career Sessions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {upcomingSessions && upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 2).map((session) => (
                <div key={session.session_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{session.description}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  {session.rsvp ? (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">RSVP'd</span>
                  ) : (
                      <Button size="sm" variant="outline">RSVP</Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming sessions.</p>
            )}
            <Link href="/dashboard/student/sessions" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all sessions <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Important Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                   <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     {new Date(notification.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No important notifications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


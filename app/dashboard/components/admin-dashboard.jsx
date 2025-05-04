import { CheckCircle, Clock, XCircle, Calendar, ArrowUp, FileText, Users } from "lucide-react"
import Link from "next/link"

const AdminDashboard = ({ data, loading, greeting }) => {
  if (!data) {
    return null;
  }

  const { stats, events, user } = data;

  return (
    <div
      className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
    >
      {/* Greeting */}
      <h2 className="text-2xl font-medium text-gray-800 dark:text-neutral-100 mb-6">{greeting}</h2>

      {/* Upcoming Career Sessions & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <h3 className="text-lg font-medium mb-4 dark:text-neutral-100">Upcoming Events</h3>
          <div className="space-y-4">
            {events && events.length > 0 ? events.map((event) => (
              <div key={event.session_id} className="bg-gray-50 dark:bg-background rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium dark:text-neutral-100">{event.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">{event.location}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs font-medium text-blue-800 dark:text-blue-300">
                    {event.attendance?.count || 0} RSVPs
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 dark:text-neutral-400 py-4">
                No upcoming events
              </div>
            )}
          </div>
          <div className="mt-6">
            <Link href="/dashboard/admin/events">
              <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                View all events
                <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <h3 className="text-lg font-medium mb-4 dark:text-neutral-100">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-background rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">Total Events</p>
                  <h3 className="text-2xl font-bold mt-1 dark:text-neutral-100">{stats?.totalSessions || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-background rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">Total Students</p>
                  <h3 className="text-2xl font-bold mt-1 dark:text-neutral-100">{stats?.totalStudents || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
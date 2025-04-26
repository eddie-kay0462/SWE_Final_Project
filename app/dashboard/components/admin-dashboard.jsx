import { CheckCircle, Clock, XCircle, Calendar, ArrowUp, FileText, Users } from "lucide-react"
import Link from "next/link"

const AdminDashboard = ({ mockData, loading, greeting }) => {
  return (
    <div
      className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
    >
      {/* Greeting */}
      <h2 className="text-2xl font-medium text-gray-800 dark:text-neutral-100 mb-6">{greeting}</h2>

      {/* Upcoming Career Sessions & Internship Letter Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Career Sessions */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <h3 className="text-lg font-medium mb-4 dark:text-neutral-100">Upcoming Career Sessions</h3>
          <div className="space-y-4">
            {mockData.upcomingSessions.map((session) => (
              <div key={session.id} className="bg-gray-50 dark:bg-[#161616] rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium dark:text-neutral-100">{session.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{session.date}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs font-medium text-blue-800 dark:text-blue-300">
                    {session.attendees} RSVPs
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/dashboard/admin/events" >
              <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                View all sessions
                <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
              </button>
            </Link>
          </div>
        </div>

        {/* Internship Letter Requests Chart */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
          <h3 className="text-lg font-medium mb-4 dark:text-neutral-100">Internship Letter Requests</h3>
          <div className="flex items-center mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">This Month</p>
              <h3 className="text-2xl font-bold mt-1 dark:text-neutral-100">{mockData.pendingRequests}</h3>
            </div>
          </div>
          <div className="h-40 bg-gray-50 dark:bg-[#161616] rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-neutral-400">Monthly Letter Requests Chart</p>
          </div>
          <div className="mt-6">
            <Link href="/dashboard/admin/internship-requests">
              <button className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center">
                View all requests
                <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
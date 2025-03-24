import { CheckCircle, Clock, XCircle, Calendar, ArrowUp, FileText, Users } from "lucide-react"

const AdminDashboard = ({ mockData, loading }) => {
  return (
    <div
      className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
    >
      {/* Internship Requests Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
        <h3 className="text-lg font-medium mb-4">Internship Requests Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                <h3 className="text-2xl font-bold mt-1">{mockData.pendingRequests}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{mockData.approvedRequests}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{mockData.rejectedRequests}</h3>
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
            {mockData.upcomingSessions.map((session) => (
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
              <h3 className="text-2xl font-bold mt-1">{mockData.studentEngagement.thisWeek}</h3>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Week</p>
              <h3 className="text-2xl font-bold mt-1">{mockData.studentEngagement.lastWeek}</h3>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Change</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                +{mockData.studentEngagement.change}%
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
          {mockData.urgentNotifications.map((notification) => (
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
  )
}

export default AdminDashboard


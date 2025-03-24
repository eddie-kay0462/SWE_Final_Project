import { Users, FileText, Calendar, ArrowUp, CheckCircle, Clock, XCircle, Server, Activity } from "lucide-react"

const SuperAdminDashboard = ({ mockData, loading }) => {
  return (
    <div
      className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Active Users",
            value: mockData.activeUsers,
            icon: Users,
            color: "blue",
            change: { value: "12%", text: "from last month", icon: ArrowUp, color: "green" },
          },
          {
            title: "Career Sessions",
            value: mockData.careerSessions,
            icon: Calendar,
            color: "purple",
            change: { value: "3", text: "new this week", icon: ArrowUp, color: "green" },
          },
          {
            title: "Internship Requests",
            value: mockData.internshipRequests.total,
            icon: FileText,
            color: "amber",
            change: { value: mockData.internshipRequests.pending, text: "pending", icon: Clock, color: "amber" },
          },
          {
            title: "System Health",
            value: `${mockData.systemHealth.databaseUptime}%`,
            icon: Server,
            color: "green",
            change: { value: "", text: "All systems operational", icon: Activity, color: "green" },
          },
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
              <div
                className={`h-12 w-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-full flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
            <p
              className={`text-xs text-${stat.change.color}-600 dark:text-${stat.change.color}-400 mt-2 flex items-center`}
            >
              <stat.change.icon className="h-3 w-3 mr-1" /> {stat.change.value && `${stat.change.value} `}
              {stat.change.text}
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
                <p className="text-sm font-medium">{mockData.systemHealth.serverLoad}%</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${mockData.systemHealth.serverLoad}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">API Response Time</p>
                <p className="text-sm font-medium">{mockData.systemHealth.apiResponseTime}ms</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(mockData.systemHealth.apiResponseTime / 200) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Database Uptime</p>
                <p className="text-sm font-medium">{mockData.systemHealth.databaseUptime}%</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${mockData.systemHealth.databaseUptime}%` }}
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
                {mockData.recentUsers.map((user) => (
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
                <h3 className="text-2xl font-bold mt-1">{mockData.internshipRequests.pending}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{mockData.internshipRequests.approved}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{mockData.internshipRequests.rejected}</h3>
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
  )
}

export default SuperAdminDashboard


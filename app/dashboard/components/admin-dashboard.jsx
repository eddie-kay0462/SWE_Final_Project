import { Card } from "@/components/ui/card"
import { 
    Users, 
    Calendar, 
    TrendingUp, 
    MapPin, 
    UserCheck, 
    UserPlus,
    BarChart2
} from "lucide-react"
import Link from "next/link"

const AdminDashboard = ({ data, loading, greeting }) => {
  if (!data) {
    return null;
  }

  const { stats, events, notifications } = data;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">{greeting}</h1>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
              <h3 className="text-2xl font-bold">{stats.totalSessions}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <div className="flex items-center space-x-4">
            <UserCheck className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
              <h3 className="text-2xl font-bold">{stats.activeStudents}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <div className="flex items-center space-x-4">
            <UserPlus className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">New Students (Month)</p>
              <h3 className="text-2xl font-bold">{stats.newStudentsThisMonth}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Attendance Analytics
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Attendance</p>
              <p className="text-xl font-bold">{stats.totalAttendance}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Per Session</p>
              <p className="text-xl font-bold">{stats.averageAttendance}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-500" />
            Location Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.locationBreakdown).map(([location, count]) => (
              <div key={location} className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{location}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-purple-500" />
            Upcoming Events
          </h3>
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div key={event.session_id} className="text-sm">
                <p className="font-semibold">{event.title}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notifications Section */}
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="border-b pb-2 last:border-0">
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard
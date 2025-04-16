"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, Calendar, MapPin } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AttendanceHistoryPage() {
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        // In a real implementation, this would use the actual student ID from the session
        const studentId = "12342024"

        const { data, error } = await supabase
          .from("attendance_records")
          .select(`
            *,
            event_sessions (
              title,
              date,
              time,
              location
            )
          `)
          .eq("student_id", studentId)
          .order("check_in_time", { ascending: false })

        if (error) throw error

        setAttendanceHistory(data || [])
      } catch (error) {
        console.error("Error fetching attendance history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance History</h1>

      <div className="grid grid-cols-1 gap-6">
        {attendanceHistory.map((record) => (
          <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{record.event_sessions.title}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {record.event_sessions.date} • {record.event_sessions.time}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  {record.event_sessions.location}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Attended
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Check-in Time</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(record.check_in_time).toLocaleTimeString()}
                </p>
              </div>
              {record.check_out_time && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Check-out Time</p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(record.check_out_time).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
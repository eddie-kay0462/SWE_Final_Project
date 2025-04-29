/**
 * Admin Students Page Component
 * 
 * This component displays a list of students and their details, allowing administrators
 * to view and manage student information. It fetches data directly from the database
 * using Supabase client.
 *
 * @author Ronelle
 * @version 1.0
 */

"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, User, FileText, BarChart3, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@/utils/supabase/client'

export default function AdminStudentProfilesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYearGroup, setSelectedYearGroup] = useState("All")
  const [yearGroupDropdownOpen, setYearGroupDropdownOpen] = useState(false)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [yearGroups, setYearGroups] = useState([])

  // Initialize Supabase client
  const supabase = createClient()

  /**
   * Extracts the year group from a student ID
   * @param {string} studentId - Student ID (4 digits)
   * @returns {string} The year group (e.g., "2024")
   */
  const extractYearGroup = (studentId) => {
    if (!studentId) return "Unknown"
    
    // Convert to string and pad with leading zeros if necessary
    const paddedId = studentId.toString().padStart(4, '0')
    
    // Get the last digit
    const lastDigit = paddedId.slice(-1)
    
    // Map the last digit to a year (202X)
    return `202${lastDigit}`
  }

  useEffect(() => {
    // Fetch student data from Supabase
    async function fetchStudents() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            student_id,
            fname,
            lname,
            email,
            profilepic,
            role_id,
            created_at
          `)
          .eq('role_id', 3) // Assuming role_id 3 is for students

        if (error) {
          throw error
        }

        // Transform the data to match the component's expected format
        const transformedData = data.map(student => {
          const yearGroup = extractYearGroup(student.student_id)
          return {
            id: student.student_id,
            firstName: student.fname,
            lastName: student.lname,
            email: student.email,
            profilePicture: student.profilepic,
            yearGroup,
            major: "Computer Science", // You might want to add this field to your database
            gpa: "3.5", // You might want to add this field to your database
            resumeUploaded: false,
            eventsAttended: 0,
            careerRoadmap: {
              goals: ["Complete internship", "Learn new technologies"],
              progress: 50
            }
          }
        })

        // Extract unique year groups and sort them
        const uniqueYearGroups = [...new Set(transformedData.map(student => student.yearGroup))]
          .filter(year => year !== "Unknown")
          .sort((a, b) => a - b)

        setYearGroups(uniqueYearGroups)
        setStudents(transformedData)
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to fetch student data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Fetch attendance history for a student
  const fetchAttendanceHistory = async (studentId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          career_sessions (
            session_id,
            title,
            date,
            start_time,
            end_time,
            location,
            description
          )
        `)
        .eq('student_id', studentId)
        .order('signup_time', { ascending: false })

      if (error) {
        throw error
      }

      // Transform the data to match the component's expected format
      const transformedData = data.map(record => ({
        id: record.id,
        eventName: record.career_sessions.title,
        date: new Date(record.career_sessions.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: `${record.career_sessions.start_time} - ${record.career_sessions.end_time}`,
        location: record.career_sessions.location,
        status: "attended",
        signupTime: new Date(record.signup_time).toLocaleString(),
        description: record.career_sessions.description
      }))

      return transformedData
    } catch (error) {
      console.error("Error fetching attendance history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch attendance history. Please try again later.",
        variant: "destructive",
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  // Update the handleViewStudent function to fetch attendance history
  const handleViewStudent = async (student) => {
    setSelectedStudent(student)
    setStudentDialogOpen(true)
    setActiveTab("profile")

    // Fetch attendance history when viewing student
    const attendanceHistory = await fetchAttendanceHistory(student.id)
    student.attendanceHistory = attendanceHistory
    student.eventsAttended = attendanceHistory.length
  }

  // Filter students based on search query and selected year group
  const filteredStudents = students.filter(
    (student) =>
      (selectedYearGroup === "All" || student.yearGroup === selectedYearGroup) &&
      (searchQuery === "" ||
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.includes(searchQuery))
  )

  const handleSelectYearGroup = (yearGroup) => {
    setSelectedYearGroup(yearGroup)
    setYearGroupDropdownOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-medium">Student Profiles</h1>
        <p className="text-muted-foreground mt-1">View and manage student information</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-between gap-2"
            onClick={() => setYearGroupDropdownOpen(!yearGroupDropdownOpen)}
          >
            <span>Year Group: {selectedYearGroup}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {yearGroupDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border rounded-md shadow-lg z-10">
              <div
                className="px-4 py-2 hover:bg-muted cursor-pointer"
                onClick={() => handleSelectYearGroup("")}
              >
                All
              </div>
              {yearGroups.map((yearGroup) => (
                <div
                  key={yearGroup}
                  className="px-4 py-2 hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectYearGroup(yearGroup)}
                >
                  {yearGroup}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Student ID</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Year Group</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b hover:bg-muted cursor-pointer"
                    onClick={() => handleViewStudent(student)}
                  >
                    <td className="px-4 py-3">{student.id}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <img
                        src={student.profilePicture || "/placeholder.svg"}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="h-8 w-8 rounded-full"
                      />
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3">{student.email}</td>
                    <td className="px-4 py-3">{student.yearGroup}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewStudent(student)
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {searchQuery
                      ? "No students found matching your search criteria."
                      : "No students found in this year group."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedStudent.profilePicture || "/placeholder.svg"}
                  alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-medium">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h2>
                  <p className="text-muted-foreground">
                    ID: {selectedStudent.id} • {selectedStudent.major}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex border-b">
                  <button
                    className={`px-4 py-2 flex items-center font-medium ${activeTab === "profile" ? "border-b-2 border-primary" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button
                    className={`px-4 py-2 flex items-center font-medium ${activeTab === "attendance" ? "border-b-2 border-primary" : ""}`}
                    onClick={() => setActiveTab("attendance")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Attendance
                  </button>
                  <button
                    className={`px-4 py-2 flex items-center font-medium ${activeTab === "career" ? "border-b-2 border-primary" : ""}`}
                    onClick={() => setActiveTab("career")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Career Roadmap
                  </button>
                </div>

                {activeTab === "profile" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Contact Information</h3>
                        <p>
                          <span className="text-muted-foreground">Email:</span> {selectedStudent.email}
                        </p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Academic Information</h3>
                        <p>
                          <span className="text-muted-foreground">Major:</span> {selectedStudent.major}
                        </p>
                        <p>
                          <span className="text-muted-foreground">GPA:</span> {selectedStudent.gpa}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Year Group:</span> {selectedStudent.yearGroup}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Resume</h3>
                        {selectedStudent.resumeUploaded ? (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Resume
                          </Button>
                        ) : (
                          <span className="text-sm text-red-500">No resume uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "attendance" && (
                  <div className="border rounded-md">
                    <div className="p-3 border-b bg-muted font-medium flex items-center justify-between">
                      <span>Event Attendance History</span>
                      <span className="text-sm">{selectedStudent.eventsAttended} events attended</span>
                    </div>
                    <div className="divide-y">
                      {selectedStudent.attendanceHistory && selectedStudent.attendanceHistory.length > 0 ? (
                        selectedStudent.attendanceHistory.map((event) => (
                          <div key={event.id} className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{event.eventName}</p>
                              <p className="text-sm text-muted-foreground">{event.date}</p>
                              <p className="text-sm text-muted-foreground">{event.time} • {event.location}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Attended
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          No attendance records found for this student.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "career" && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Career Goals</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedStudent.careerRoadmap.goals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Career Roadmap Progress</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${selectedStudent.careerRoadmap.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedStudent.careerRoadmap.progress}% complete
                      </p>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Advisor Notes</h3>
                      <textarea
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        placeholder="Add notes about this student's career progress..."
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <Button size="sm">Save Notes</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


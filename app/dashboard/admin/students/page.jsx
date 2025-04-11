"use client"

import { useState } from "react"
import { Search, ChevronDown, User, FileText, BarChart3, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function AdminStudentProfilesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYearGroup, setSelectedYearGroup] = useState("2025")
  const [yearGroupDropdownOpen, setYearGroupDropdownOpen] = useState(false)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")

  // Year groups
  const yearGroups = ["2025", "2026", "2027", "2028"]

  // Mock data for students
  const students = [
    {
      id: "58762025",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      yearGroup: "2025",
      profilePicture: "/placeholder.svg?height=40&width=40",
      major: "Computer Science",
      gpa: "3.8",
      eventsAttended: 5,
      resumeUploaded: true,
      careerRoadmap: {
        goals: ["Software Engineer at Google", "Complete AWS certification"],
        progress: 60,
      },
    },
    {
      id: "10332025",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      yearGroup: "2025",
      profilePicture: "/placeholder.svg?height=40&width=40",
      major: "Business Administration",
      gpa: "3.6",
      eventsAttended: 3,
      resumeUploaded: true,
      careerRoadmap: {
        goals: ["Investment Banking Analyst", "Complete CFA Level 1"],
        progress: 40,
      },
    },
    {
      id: "24572026",
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      yearGroup: "2026",
      profilePicture: "/placeholder.svg?height=40&width=40",
      major: "Mechanical Engineering",
      gpa: "3.5",
      eventsAttended: 2,
      resumeUploaded: false,
      careerRoadmap: {
        goals: ["Engineering Internship", "Join Engineering Club"],
        progress: 30,
      },
    },
    {
      id: "18942027",
      firstName: "Emily",
      lastName: "Williams",
      email: "emily.williams@example.com",
      yearGroup: "2027",
      profilePicture: "/placeholder.svg?height=40&width=40",
      major: "Psychology",
      gpa: "3.9",
      eventsAttended: 4,
      resumeUploaded: true,
      careerRoadmap: {
        goals: ["Research Assistant Position", "Apply to Graduate School"],
        progress: 50,
      },
    },
    {
      id: "50932028",
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@example.com",
      yearGroup: "2028",
      profilePicture: "/placeholder.svg?height=40&width=40",
      major: "Finance",
      gpa: "3.7",
      eventsAttended: 1,
      resumeUploaded: false,
      careerRoadmap: {
        goals: ["Finance Internship", "Join Finance Club"],
        progress: 20,
      },
    },
  ]

  // Mock data for attendance history
  const mockAttendanceHistory = [
    { id: 1, eventName: "Resume Building Workshop", date: "February 15, 2025", status: "attended" },
    { id: 2, eventName: "Career Fair", date: "March 15, 2025", status: "attended" },
    { id: 3, eventName: "Interview Skills Workshop", date: "January 20, 2025", status: "attended" },
    { id: 4, eventName: "Networking Workshop", date: "February 20, 2025", status: "missed" },
    { id: 5, eventName: "Industry Panel", date: "March 1, 2025", status: "attended" },
  ]

  // Filter students based on search query and selected year group
  const filteredStudents = students.filter(
    (student) =>
      student.yearGroup === selectedYearGroup &&
      (searchQuery === "" ||
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.includes(searchQuery)),
  )

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setStudentDialogOpen(true)
    setActiveTab("profile")
  }

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
              {filteredStudents.length > 0 ? (
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
                      {mockAttendanceHistory.map((event) => (
                        <div key={event.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{event.eventName}</p>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.status === "attended" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {event.status === "attended" ? "Attended" : "Missed"}
                          </span>
                        </div>
                      ))}
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


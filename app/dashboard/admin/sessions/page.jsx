"use client"

import { useState } from "react"
import { CalendarIcon, Clock, MapPin, Plus, Settings, User, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function AdminOneOnOnePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isBookingEnabled, setIsBookingEnabled] = useState(true)
  const [createSessionDialogOpen, setCreateSessionDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [studentSearchDialogOpen, setStudentSearchDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for available time slots
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

  // Mock data for students
  const students = [
    { id: "20242025", name: "John Doe", email: "john.doe@example.com", yearGroup: "2025" },
    { id: "20242026", name: "Jane Smith", email: "jane.smith@example.com", yearGroup: "2026" },
    { id: "20242027", name: "Michael Johnson", email: "michael.johnson@example.com", yearGroup: "2027" },
    { id: "20242028", name: "Emily Williams", email: "emily.williams@example.com", yearGroup: "2028" },
    { id: "20242029", name: "David Brown", email: "david.brown@example.com", yearGroup: "2025" },
  ]

  // Mock data for sessions
  const sessions = [
    {
      id: 1,
      studentName: "John Doe",
      studentId: "20242025",
      date: "April 5, 2025",
      time: "11:00 AM",
      location: "Career Center, Room 203",
      status: "scheduled",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "20242026",
      date: "April 6, 2025",
      time: "2:00 PM",
      location: "Online (Zoom)",
      status: "scheduled",
    },
    {
      id: 3,
      studentName: "Michael Johnson",
      studentId: "20242027",
      date: "February 15, 2025",
      time: "10:00 AM",
      location: "Career Center, Room 203",
      status: "completed",
      notes: "Discussed resume improvements and internship opportunities.",
    },
    {
      id: 4,
      studentName: "Emily Williams",
      studentId: "20242028",
      date: "January 20, 2025",
      time: "2:00 PM",
      location: "Online (Zoom)",
      status: "completed",
      notes: "Reviewed career goals and academic progress.",
    },
  ]

  const upcomingSessions = sessions.filter((session) => session.status === "scheduled")
  const pastSessions = sessions.filter((session) => session.status === "completed")

  // Available dates (next 14 weekdays)
  const availableDates = []
  const today = new Date()
  let count = 0
  const currentDate = new Date(today)

  while (availableDates.length < 14) {
    currentDate.setDate(today.getDate() + count)
    const day = currentDate.getDay()

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (day !== 0 && day !== 6) {
      availableDates.push(
        new Date(currentDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      )
    }

    count++
  }

  const handleToggleBooking = () => {
    const newState = !isBookingEnabled
    setIsBookingEnabled(newState)

    toast({
      title: newState ? "Booking Enabled" : "Booking Disabled",
      description: newState
        ? "Students can now book 1-on-1 sessions."
        : "Students cannot book 1-on-1 sessions until you enable it again.",
    })

    setSettingsDialogOpen(false)
  }

  const handleSearchStudents = () => {
    // In a real app, this would filter from the database
    return students.filter(
      (student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.id.includes(searchQuery),
    )
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setStudentSearchDialogOpen(false)
    setCreateSessionDialogOpen(true)
  }

  const handleCreateSession = () => {
    if (!selectedStudent || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a student, date, and time for the session.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setCreateSessionDialogOpen(false)
      setSelectedStudent(null)
      setSelectedDate("")
      setSelectedTime("")

      toast({
        title: "Session Created",
        description: `1-on-1 session with ${selectedStudent.name} has been scheduled for ${selectedDate} at ${selectedTime}.`,
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">1-on-1 Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage career advising sessions</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setStudentSearchDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>
      </div>

      {!isBookingEnabled && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="h-5 w-5" />
              <p className="font-medium">Booking is currently disabled for students.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "upcoming" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Sessions
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "past" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Sessions
          </button>
        </div>

        {activeTab === "upcoming" && (
          <div className="mt-6">
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-6 pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">
                            {session.date} at {session.time}
                          </h3>
                          <p className="text-muted-foreground">
                            With {session.studentName} (ID: {session.studentId})
                          </p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{session.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{session.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="destructive" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
                  <Button className="mt-4" onClick={() => setStudentSearchDialogOpen(true)}>
                    Create a Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="mt-6">
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-6 pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">
                              {session.date} at {session.time}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            With {session.studentName} (ID: {session.studentId})
                          </p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{session.location}</span>
                            </div>
                            {session.notes && (
                              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                                <span className="font-medium">Notes:</span> {session.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No past sessions.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>1-on-1 Session Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="booking-toggle">Allow Student Booking</Label>
                <p className="text-sm text-muted-foreground">
                  {isBookingEnabled ? "Students can book 1-on-1 sessions" : "Students cannot book 1-on-1 sessions"}
                </p>
              </div>
              <Switch id="booking-toggle" checked={isBookingEnabled} onCheckedChange={setIsBookingEnabled} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleToggleBooking}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Search Dialog */}
      <Dialog open={studentSearchDialogOpen} onOpenChange={setStudentSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Student</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-8 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-72 overflow-y-auto border rounded-md">
              {handleSearchStudents().length > 0 ? (
                handleSearchStudents().map((student) => (
                  <div
                    key={student.id}
                    className="p-3 border-b last:border-b-0 hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-muted-foreground bg-muted rounded-full p-1.5" />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {student.id} • Year: {student.yearGroup}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery ? "No students found" : "Type to search for students"}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStudentSearchDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={createSessionDialogOpen} onOpenChange={setCreateSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create 1-on-1 Session</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{selectedStudent.name}</p>
                <p className="text-sm text-muted-foreground">
                  ID: {selectedStudent.id} • Year: {selectedStudent.yearGroup}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-select">Select Date</Label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal flex items-center"
                    onClick={() => document.getElementById("date-select").focus()}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate || "Select a date"}
                  </Button>
                  <select
                    id="date-select"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  >
                    <option value="">Select a date</option>
                    {availableDates.map((date, index) => (
                      <option key={index} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-select">Select Time</Label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal flex items-center"
                    onClick={() => document.getElementById("time-select").focus()}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedTime || "Select a time"}
                  </Button>
                  <select
                    id="time-select"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <select id="location" className="w-full p-2 border rounded-md" defaultValue="Career Center, Room 203">
                  <option value="Career Center, Room 203">Career Center, Room 203</option>
                  <option value="Career Center, Room 204">Career Center, Room 204</option>
                  <option value="Online (Zoom)">Online (Zoom)</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


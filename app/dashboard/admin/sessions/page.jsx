"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Clock, MapPin, Plus, Settings, User, Search, AlertCircle, PenLine } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Calendar from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { format } from "@/lib/date-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function AdminOneOnOnePage() {
  const router = useRouter()
  const { authUser, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isBookingEnabled, setIsBookingEnabled] = useState(true)
  const [createSessionDialogOpen, setCreateSessionDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [completeSessionDialogOpen, setCompleteSessionDialogOpen] = useState(false)
  const [cancelSessionDialogOpen, setCancelSessionDialogOpen] = useState(false)
  const [addNotesDialogOpen, setAddNotesDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedStudentName, setSelectedStudentName] = useState("")
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("Career Center, Room 203")
  const [sessionNotes, setSessionNotes] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessions, setSessions] = useState({ upcomingSessions: [], pastSessions: [] })
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [formError, setFormError] = useState("")
  const [isPersonalBookingEnabled, setIsPersonalBookingEnabled] = useState(true)
  const [allSessions, setAllSessions] = useState({ upcomingSessions: [], pastSessions: [] })
  const [viewMode, setViewMode] = useState("personal") // "personal" or "all"
  const [advisors, setAdvisors] = useState([])
  const supabase = createClient()

  // Time slots
  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

  // Format time for display
  const formatTimeForDisplay = (time) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes || "00"} ${ampm}`
  }

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!authLoading && !authUser) {
      console.log('[AdminDashboard] No authenticated user, redirecting to login')
      router.push('/auth/login')
      return
    }

    // Check if user has admin role
    if (authUser && !authLoading) {
      checkAdminRole()
    }
  }, [authUser, authLoading, router])

  // Check admin role
  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role_id')
        .eq('email', authUser.email)
        .single()

      if (error) throw error
      
      if (data.role_id !== 2) {
        toast.error("You don't have permission to access this page")
        router.push('/')
      }
    } catch (error) {
      console.error('[AdminDashboard] Role check error:', error)
      toast.error('Failed to verify permissions')
      router.push('/')
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    if (authUser) {
      fetchData()
    }
  }, [authUser])

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Get booking status
      const { data: globalSettings } = await supabase
        .from("session_settings")
        .select("is_booking_enabled")
        .is("advisor_id", null)
        .order("id", { ascending: false })
        .limit(1)
        .single()
      
      setIsBookingEnabled(globalSettings?.is_booking_enabled ?? true)

      // Get personal booking status
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        return
      }

      console.log("Current advisor ID:", userData?.id)

      if (userData) {
        const { data: personalSettings } = await supabase
          .from("session_settings")
          .select("is_booking_enabled")
          .eq("advisor_id", userData.id)
          .order("id", { ascending: false })
          .limit(1)
          .single()

        setIsPersonalBookingEnabled(personalSettings?.is_booking_enabled ?? true)
      }

      // Get all advisors
      const { data: advisorsData } = await supabase
        .from("users")
        .select("id, fname, lname, email")
        .eq("role_id", 2) // Assuming role_id 2 is for advisors
        .order("lname", { ascending: true })

      if (advisorsData) {
        setAdvisors(advisorsData)
      }

      // Get personal sessions
      const { data: personalSessionsData, error: personalSessionsError } = await supabase
        .from("sessions")
        .select(`
          *,
          student:student_id (
            id,
            fname,
            lname,
            email,
            student_id
          )
        `)
        .eq("advisor_id", userData.id)
        .order("date", { ascending: true })

      // Get all sessions with advisor details
      const { data: allSessionsData, error: allSessionsError } = await supabase
        .from("sessions")
        .select(`
          *,
          student:student_id (
            id,
            fname,
            lname,
            email,
            student_id
          ),
          advisor:advisor_id (
            id,
            fname,
            lname,
            email
          )
        `)
        .order("date", { ascending: true })

      if (personalSessionsData && allSessionsData) {
        // Separate into upcoming and past sessions
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Process personal sessions
        const personalUpcoming = personalSessionsData.filter((session) => {
          if (session.status === "cancelled") return false
          const sessionDate = new Date(session.date)
          return sessionDate >= today && session.status === "scheduled"
        })

        const personalPast = personalSessionsData.filter((session) => {
          const sessionDate = new Date(session.date)
          return sessionDate < today || session.status === "completed" || session.status === "cancelled"
        })

        // Process all sessions
        const allUpcoming = allSessionsData.filter((session) => {
          if (session.status === "cancelled") return false
          const sessionDate = new Date(session.date)
          return sessionDate >= today && session.status === "scheduled"
        })

        const allPast = allSessionsData.filter((session) => {
          const sessionDate = new Date(session.date)
          return sessionDate < today || session.status === "completed" || session.status === "cancelled"
        })

        setSessions({ upcomingSessions: personalUpcoming, pastSessions: personalPast })
        setAllSessions({ upcomingSessions: allUpcoming, pastSessions: allPast })
      }

      // Get students
      const { data: studentsData } = await supabase
        .from("users")
        .select("id, fname, lname, email, student_id")
        .eq("role_id", 3)
        .order("lname", { ascending: true })

      if (studentsData) {
        setStudents(studentsData)
      }

    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter students based on search query
  const filteredStudents = () => {
    if (!searchQuery.trim()) return students

    const query = searchQuery.toLowerCase()
    return students.filter(
      (student) =>
        student.fname?.toLowerCase().includes(query) ||
        student.lname?.toLowerCase().includes(query) ||
        student.student_id?.toString().includes(query) ||
        student.email?.toLowerCase().includes(query),
    )
  }

  // Handle session creation
  const handleCreateSession = async () => {
    setFormError("")

    if (!selectedStudent) {
      setFormError("Please select a student")
      return
    }

    if (!selectedDate) {
      setFormError("Please select a date")
      return
    }

    if (!selectedTime) {
      setFormError("Please select a time")
      return
    }

    setIsSubmitting(true)

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (!userData) throw new Error("User not found")

      // Format date to ISO string (YYYY-MM-DD)
      const formattedDate = format(selectedDate, "yyyy-MM-dd")

      // Calculate end time (1 hour after start time)
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const endHours = (hours + 1) % 24
      const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

      // Check for double booking
      const { data: existingSession } = await supabase
        .from("sessions")
        .select("id")
        .eq("advisor_id", userData.id)
        .eq("date", formattedDate)
        .eq("time", selectedTime)
        .eq("status", "scheduled")
        .limit(1)

      if (existingSession && existingSession.length > 0) {
        throw new Error("This time slot is already booked")
      }

      // Create the session
      const { error } = await supabase.from("sessions").insert({
        student_id: selectedStudent,
        advisor_id: userData.id,
        date: formattedDate,
        time: selectedTime,
        end_time: endTime,
        location: selectedLocation,
        status: "scheduled",
      })

      if (error) throw error

      toast({
        title: "Session Created",
        description: `1-on-1 session with ${selectedStudentName} has been scheduled for ${format(selectedDate, "MMMM d, yyyy")} at ${formatTimeForDisplay(selectedTime)}.`,
      })

      // Reset form
      setCreateSessionDialogOpen(false)
      setSelectedStudent(null)
      setSelectedStudentName("")
      setSelectedDate(null)
      setSelectedTime("")
      setSearchQuery("")

      // Refresh data
      fetchData()

    } catch (error) {
      console.error("Error creating session:", error)
      setFormError(error.message || "Failed to create session. Please try again.")
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle session completion
  const handleCompleteSession = async () => {
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("sessions")
        .update({
          status: "completed",
          notes: sessionNotes,
        })
        .eq("id", selectedSession.id)

      if (error) throw error

      toast({
        title: "Session Completed",
        description: "The session has been marked as completed and notes have been saved.",
      })

      // Refresh data
      fetchData()

      // Reset form
      setCompleteSessionDialogOpen(false)
      setSelectedSession(null)
      setSessionNotes("")
    } catch (error) {
      console.error("Error completing session:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle adding notes
  const handleAddNotes = async () => {
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("sessions")
        .update({ notes: sessionNotes })
        .eq("id", selectedSession.id)

      if (error) throw error

      toast({
        title: "Notes Added",
        description: "Session notes have been successfully added.",
      })

      // Refresh data
      fetchData()

      // Reset form
      setAddNotesDialogOpen(false)
      setSelectedSession(null)
      setSessionNotes("")
    } catch (error) {
      console.error("Error adding notes:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle session cancellation
  const handleCancelSession = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancelling this session.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (!userData) throw new Error("User not found")

      const { error } = await supabase
        .from("sessions")
        .update({
          status: "cancelled",
          cancellation_reason: cancelReason,
          cancelled_by: userData.id,
        })
        .eq("id", selectedSession.id)

      if (error) throw error

      toast({
        title: "Session Cancelled",
        description: "The 1-on-1 session has been cancelled. The student has been notified.",
      })

      // Refresh data
      fetchData()

      // Reset form
      setCancelSessionDialogOpen(false)
      setSelectedSession(null)
      setCancelReason("")
    } catch (error) {
      console.error("Error cancelling session:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle updating booking status
  const handleUpdateBookingStatus = async () => {
    try {
      setIsSubmitting(true)

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (!userData) throw new Error("User not found")

      // Check if a record already exists
      const { data: existingSettings } = await supabase
        .from("session_settings")
        .select("id")
        .eq("advisor_id", userData.id)
        .limit(1)

      if (existingSettings && existingSettings.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from("session_settings")
          .update({ is_booking_enabled: isPersonalBookingEnabled })
          .eq("id", existingSettings[0].id)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase.from("session_settings").insert({
          advisor_id: userData.id,
          is_booking_enabled: isPersonalBookingEnabled,
        })

        if (error) throw error
      }

      toast({
        title: isPersonalBookingEnabled ? "Booking Enabled" : "Booking Disabled",
        description: isPersonalBookingEnabled
          ? "Students can now book 1-on-1 sessions with you."
          : "Students cannot book 1-on-1 sessions with you until you enable it again.",
      })

      setSettingsDialogOpen(false)
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-medium">1-on-1 Sessions</h1>
            <p className="text-muted-foreground mt-1">Manage career advising sessions</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p>Loading sessions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <Button onClick={() => setCreateSessionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md border p-1">
          <Button
            variant={viewMode === "personal" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("personal")}
          >
            My Sessions
          </Button>
          <Button
            variant={viewMode === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("all")}
          >
            All Sessions
          </Button>
        </div>
      </div>

      {!isBookingEnabled && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Global Booking Disabled</AlertTitle>
          <AlertDescription>
            Session booking is currently disabled for all advisors by the system administrator. Students will not be
            able to book new sessions until it is enabled again.
          </AlertDescription>
        </Alert>
      )}

      {!isPersonalBookingEnabled && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="pt-4">Your Booking Disabled</AlertTitle>
          <AlertDescription>
            You have disabled session booking for yourself. Students will not be able to book sessions with you until
            you enable it again in Settings.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "upcoming" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            {viewMode === "personal" ? "My Upcoming Sessions" : "All Upcoming Sessions"}
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "past" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            {viewMode === "personal" ? "My Past Sessions" : "All Past Sessions"}
          </button>
        </div>

        {activeTab === "upcoming" && (
          <div className="mt-6">
            {(viewMode === "personal" ? sessions.upcomingSessions : allSessions.upcomingSessions).length > 0 ? (
              <div className="space-y-4">
                {(viewMode === "personal" ? sessions.upcomingSessions : allSessions.upcomingSessions).map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-6 pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">
                            {format(new Date(session.date), "MMMM d, yyyy")} at {formatTimeForDisplay(session.time)}
                          </h3>
                          <p className="text-muted-foreground">
                            Student: {session.student.fname} {session.student.lname}
                            {session.student.student_id && ` (ID: ${session.student.student_id})`}
                          </p>
                          {viewMode === "all" && (
                            <p className="text-muted-foreground">
                              Advisor: {session.advisor.fname} {session.advisor.lname}
                            </p>
                          )}

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatTimeForDisplay(session.time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{session.location}</span>
                            </div>
                          </div>
                        </div>

                        {viewMode === "personal" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session)
                                setAddNotesDialogOpen(true)
                                setSessionNotes(session.notes || "")
                              }}
                            >
                              <PenLine className="h-3.5 w-3.5 mr-1" />
                              Add Notes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session)
                                setCompleteSessionDialogOpen(true)
                                setSessionNotes(session.notes || "")
                              }}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session)
                                setCancelSessionDialogOpen(true)
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {viewMode === "personal" 
                      ? "No upcoming sessions scheduled."
                      : "No upcoming sessions scheduled by any advisor."}
                  </p>
                  {viewMode === "personal" && (
                    <Button className="mt-4" onClick={() => setCreateSessionDialogOpen(true)}>
                      Create a Session
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="mt-6">
            {(viewMode === "personal" ? sessions.pastSessions : allSessions.pastSessions).length > 0 ? (
              <div className="space-y-4">
                {(viewMode === "personal" ? sessions.pastSessions : allSessions.pastSessions).map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-6 pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">
                              {format(new Date(session.date), "MMMM d, yyyy")} at {formatTimeForDisplay(session.time)}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${
                                session.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : session.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {session.status === "completed"
                                ? "Completed"
                                : session.status === "cancelled"
                                  ? "Cancelled"
                                  : "Past"}
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            Student: {session.student.fname} {session.student.lname}
                            {session.student.student_id && ` (ID: ${session.student.student_id})`}
                          </p>
                          {viewMode === "all" && (
                            <p className="text-muted-foreground">
                              Advisor: {session.advisor.fname} {session.advisor.lname}
                            </p>
                          )}

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{session.location}</span>
                            </div>

                            {session.status === "cancelled" && session.cancellation_reason && (
                              <p className="text-sm mt-2 p-3 bg-red-50 text-red-700 rounded-md">
                                <span className="font-medium">Cancellation Reason:</span> {session.cancellation_reason}
                              </p>
                            )}

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
                  <p className="text-muted-foreground">
                    {viewMode === "personal" 
                      ? "No past sessions."
                      : "No past sessions found."}
                  </p>
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
                <Label htmlFor="personal-booking-toggle">Allow Students to Book With You</Label>
                <p className="text-sm text-muted-foreground">
                  {isPersonalBookingEnabled
                    ? "Students can book 1-on-1 sessions with you"
                    : "Students cannot book 1-on-1 sessions with you"}
                </p>
              </div>
              <Switch
                id="personal-booking-toggle"
                checked={isPersonalBookingEnabled}
                onCheckedChange={setIsPersonalBookingEnabled}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBookingStatus}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={createSessionDialogOpen} onOpenChange={setCreateSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a 1-on-1 Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select
                value={selectedStudent ? selectedStudent.toString() : ""}
                onValueChange={(value) => {
                  const student = students.find((s) => s.id.toString() === value)
                  if (student) {
                    setSelectedStudent(student.id)
                    const fullName = `${student.fname} ${student.lname}`
                    setSelectedStudentName(fullName)
                    console.log("Selected student:", student.id, "Name:", fullName)
                  } else {
                    setSelectedStudent(null)
                    setSelectedStudentName("")
                    console.log("No student found for value:", value)
                  }
                }}
              >
                <SelectTrigger className={`w-full ${selectedStudent ? "border-primary" : ""}`}>
                  <span>{selectedStudentName || "Select a student"}</span>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="sticky top-0 bg-white p-2 border-b z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full pl-8 pr-4 py-2 border rounded-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {filteredStudents().length > 0 ? (
                    filteredStudents().map((student) => (
                      <SelectItem
                        key={student.id}
                        value={student.id.toString()}
                        className="cursor-pointer hover:bg-muted"
                      >
                        <div className="flex items-center gap-3 py-1">
                          <User className="h-6 w-6 text-muted-foreground bg-muted rounded-full p-1" />
                          <div>
                            <p className="font-medium">
                              {student.fname} {student.lname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.student_id && `ID: ${student.student_id} • `}
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchQuery ? "No students found" : "Type to search for students"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-select">Select Date</Label>
              <br></br>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white border rounded-md shadow-md"
                  style={{ minWidth: "300px" }}
                >
                  <div className="p-2 border-b">
                    <h4 className="font-medium text-sm">Select an available date</h4>
                    <p className="text-xs text-muted-foreground">Weekends are not available</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      // Disable past dates, weekends, and dates more than 2 months in the future
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)

                      const twoMonthsFromNow = new Date()
                      twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)

                      return date < today || date > twoMonthsFromNow || date.getDay() === 0 || date.getDay() === 6
                    }}
                    className="rounded-md border-0"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-select">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a time">
                    {selectedTime ? formatTimeForDisplay(selectedTime) : "Select a time"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="p-2 border-b">
                    <h4 className="font-medium text-sm">Available time slots</h4>
                  </div>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time} className="cursor-pointer hover:bg-gray-100">
                      {formatTimeForDisplay(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue>{selectedLocation}</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="Career Center, Room 203">Career Center, Room 203</SelectItem>
                  <SelectItem value="Career Center, Room 204">Career Center, Room 204</SelectItem>
                  <SelectItem value="Online (Zoom)">Online (Zoom)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession} disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Book Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Session Dialog */}
      <Dialog open={completeSessionDialogOpen} onOpenChange={setCompleteSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete 1-on-1 Session</DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">
                  {format(new Date(selectedSession.date), "MMMM d, yyyy")} at{" "}
                  {formatTimeForDisplay(selectedSession.time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  With {selectedSession.student.fname} {selectedSession.student.lname}
                  {selectedSession.student.student_id && ` (ID: ${selectedSession.student.student_id})`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-notes">Session Notes</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Add notes from the session here..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  These notes will be visible to the student in their session history.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCompleteSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteSession} disabled={isSubmitting}>
              {isSubmitting ? "Completing..." : "Mark as Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={addNotesDialogOpen} onOpenChange={setAddNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Session Notes</DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">
                  {format(new Date(selectedSession.date), "MMMM d, yyyy")} at{" "}
                  {formatTimeForDisplay(selectedSession.time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  With {selectedSession.student.fname} {selectedSession.student.lname}
                  {selectedSession.student.student_id && ` (ID: ${selectedSession.student.student_id})`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Session Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes for this session..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  These notes will be visible to the student in their session history.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNotes} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Session Dialog */}
      <Dialog open={cancelSessionDialogOpen} onOpenChange={setCancelSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel 1-on-1 Session</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please provide a reason for cancelling this session. The student will be notified.
            </p>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="p-3 mb-2 bg-muted rounded-md">
                <p className="font-medium">
                  {format(new Date(selectedSession.date), "MMMM d, yyyy")} at{" "}
                  {formatTimeForDisplay(selectedSession.time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  With {selectedSession.student.fname} {selectedSession.student.lname}
                  {selectedSession.student.student_id && ` (ID: ${selectedSession.student.student_id})`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Please provide a reason for cancelling this session..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelSessionDialogOpen(false)}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleCancelSession} disabled={isSubmitting}>
              {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Clock, MapPin, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Calendar from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/use-auth"

// Supabase client functions
const getUserSessions = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data: sessionsData } = await supabase
    .from("sessions")
    .select(`
      *,
      advisor:advisor_id (
        id,
        fname,
        lname,
        email
      )
    `)
    .eq("student_id", user.id)
    .order("date", { ascending: true })

  if (!sessionsData) return { upcomingSessions: [], pastSessions: [] }

  // Separate into upcoming and past sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingSessions = sessionsData.filter((session) => {
    if (session.status === "cancelled") return false
    const sessionDate = new Date(session.date)
    return sessionDate >= today && session.status === "scheduled"
  })

  const pastSessions = sessionsData.filter((session) => {
    const sessionDate = new Date(session.date)
    return sessionDate < today || session.status === "completed" || session.status === "cancelled"
  })

  return { upcomingSessions, pastSessions }
}

const getBookingStatus = async (advisorId = null) => {
  const supabase = createClient()
  
  try {
    // If advisorId is provided, get personal booking status
    if (advisorId) {
      const { data } = await supabase
        .from("session_settings")
        .select("is_booking_enabled")
        .eq("advisor_id", advisorId)
        .order("id", { ascending: false })
        .limit(1)
        .single()
      
      return data?.is_booking_enabled ?? true
    }
    
    // Get global booking status
    const { data } = await supabase
      .from("session_settings")
      .select("is_booking_enabled")
      .is("advisor_id", null)
      .order("id", { ascending: false })
      .limit(1)
      .single()
    
    return data?.is_booking_enabled ?? true
  } catch (error) {
    console.error("Error getting booking status:", error)
    return true // Default to enabled if error
  }
}

const getAdvisors = async () => {
  const supabase = createClient()
  
  const { data: advisors } = await supabase
    .from("users")
    .select("id, fname, lname, email")
    .eq("role_id", 2) // Assuming role_id 2 is for advisors
    .order("lname", { ascending: true })
  
  return advisors || []
}

const bookSession = async (formData) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  try {
    // Calculate end time (1 hour after start time)
    const [hours, minutes] = formData.get("time").split(":").map(Number)
    const endHours = (hours + 1) % 24
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    // Check for double booking
    const { data: existingSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("advisor_id", formData.get("advisor_id"))
      .eq("date", formData.get("date"))
      .eq("time", formData.get("time"))
      .eq("status", "scheduled")
      .limit(1)

    if (existingSession && existingSession.length > 0) {
      return { success: false, message: "This time slot is already booked" }
    }

    // Create the session
    const { error } = await supabase.from("sessions").insert({
      student_id: user.id,
      advisor_id: formData.get("advisor_id"),
      date: formData.get("date"),
      time: formData.get("time"),
      end_time: endTime,
      location: formData.get("location"),
      status: "scheduled",
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error booking session:", error)
    return { success: false, message: error.message }
  }
}

const cancelSession = async (sessionId, reason) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  try {
    const { error } = await supabase
      .from("sessions")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_by: user.id,
      })
      .eq("id", sessionId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error cancelling session:", error)
    return { success: false, message: error.message }
  }
}

export default function OneOnOnePage() {
  const { toast } = useToast()
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [cancelReason, setCancelReason] = useState("")
  const [date, setDate] = useState(null)
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("Career Center, Room 203")
  const [advisorId, setAdvisorId] = useState("")
  const [advisors, setAdvisors] = useState([])
  const [availableAdvisors, setAvailableAdvisors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [sessions, setSessions] = useState({ upcomingSessions: [], pastSessions: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isBookingEnabled, setIsBookingEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Available time slots - could be fetched from database in the future
  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

  // Format time for display
  const formatTimeForDisplay = (time) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes || "00"} ${ampm}`
  }

  // Fetch sessions and advisors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Get booking status
        const bookingStatus = await getBookingStatus()
        setIsBookingEnabled(bookingStatus)

        // Get sessions
        const sessionsData = await getUserSessions()
        setSessions(sessionsData)

        // Get advisors
        const advisorsData = await getAdvisors()
        console.log("Fetched advisors:", advisorsData)

        // Check availability for each advisor
        const advisorsWithAvailability = await Promise.all(
          advisorsData.map(async (advisor) => {
            const isAvailable = await getBookingStatus(advisor.id)
            return { ...advisor, isAvailable }
          }),
        )

        setAdvisors(advisorsWithAvailability)

        // Filter only available advisors
        const onlyAvailableAdvisors = advisorsWithAvailability.filter((advisor) => advisor.isAvailable)
        setAvailableAdvisors(onlyAvailableAdvisors)

        if (onlyAvailableAdvisors.length > 0) {
          // Set the first available advisor as selected
          const firstAvailableAdvisorId = onlyAvailableAdvisors[0].id.toString()
          setAdvisorId(firstAvailableAdvisorId)
          console.log("Set initial advisorId to first available:", firstAvailableAdvisorId)
        } else {
          // Reset advisor ID if no advisors are available
          setAdvisorId("")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load sessions. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleBookSession = async () => {
    if (!date || !time || !advisorId) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time, and advisor for your session.",
        variant: "destructive",
      })
      return
    }

    // Check if the selected advisor is available
    const advisor = advisors.find((a) => a.id.toString() === advisorId.toString())
    if (!advisor || !advisor.isAvailable) {
      toast({
        title: "Advisor Unavailable",
        description: `The selected advisor is not currently accepting bookings. Please select another advisor.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format date to ISO string (YYYY-MM-DD)
      const formattedDate = format(date, "yyyy-MM-dd")

      // Create form data
      const formData = new FormData()
      formData.append("date", formattedDate)
      formData.append("time", time)
      formData.append("advisor_id", advisorId)
      formData.append("location", location)

      console.log("Booking session with data:", {
        date: formattedDate,
        time,
        advisorId,
        location,
      })

      // Submit the form
      const result = await bookSession(formData)
      console.log("Booking result:", result)

      if (result.success) {
        toast({
          title: "Session Booked",
          description: `Your 1-on-1 session has been successfully booked for ${format(date, "MMMM d, yyyy")} at ${formatTimeForDisplay(time)}.`,
        })

        // Refresh the sessions
        const sessionsData = await getUserSessions()
        setSessions(sessionsData)

        // Reset form
        setIsBookingDialogOpen(false)
        setDate(null)
        setTime("")
      } else {
        toast({
          title: "Booking Failed",
          description: result.message || "Failed to book session. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error booking session:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
      const result = await cancelSession(selectedSession.id, cancelReason)

      if (result.success) {
        toast({
          title: "Session Cancelled",
          description: "Your 1-on-1 session has been cancelled. Your advisor has been notified.",
        })

        // Refresh the sessions
        const sessionsData = await getUserSessions()
        setSessions(sessionsData)

        // Reset form
        setIsCancelDialogOpen(false)
        setCancelReason("")
        setSelectedSession(null)
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.message,
          variant: "destructive",
        })
      }
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

  const openCancelDialog = (session) => {
    setSelectedSession(session)
    setIsCancelDialogOpen(true)
  }

  // Get advisor name by ID
  const getAdvisorName = (id) => {
    const advisor = advisors.find((a) => a.id.toString() === id.toString())
    return advisor ? `${advisor.fname} ${advisor.lname}` : "Select an advisor"
  }

  // Filter advisors based on search query - ONLY from available advisors
  const filteredAdvisors =
    searchQuery === ""
      ? availableAdvisors
      : availableAdvisors.filter((advisor) => {
          const fullName = `${advisor.fname} ${advisor.lname}`.toLowerCase()
          return fullName.includes(searchQuery.toLowerCase())
        })

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-medium">1-on-1 Sessions</h1>
            <p className="text-muted-foreground mt-1">Book and manage your career advising sessions</p>
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

  // Check if there are any available advisors
  const hasAvailableAdvisors = availableAdvisors.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">1-on-1 Sessions</h1>
          <p className="text-muted-foreground mt-1">Book and manage your career advising sessions</p>
        </div>
        <Button onClick={() => setIsBookingDialogOpen(true)} disabled={!isBookingEnabled || !hasAvailableAdvisors}>
          Book New Session
        </Button>
      </div>

      {!isBookingEnabled && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Disabled</AlertTitle>
          <AlertDescription>
            Session booking is currently disabled by the Career Services team. Please check back later or contact your
            advisor.
          </AlertDescription>
        </Alert>
      )}

      {isBookingEnabled && !hasAvailableAdvisors && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Advisors Available</AlertTitle>
          <AlertDescription>
            There are currently no advisors available for booking. Please check back later.
          </AlertDescription>
        </Alert>
      )}

      {/* Custom tabs implementation */}
      <div className="tabs">
        <div className="grid w-full grid-cols-2" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "upcoming"}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "upcoming"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Sessions
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "previous"}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "previous"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("previous")}
          >
            Previous Sessions
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "upcoming" && (
        <div className="mt-6">
          {sessions.upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.upcomingSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6 pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">
                          {format(new Date(session.date), "MMMM d, yyyy")} at {formatTimeForDisplay(session.time)}
                        </h3>
                        <p className="text-muted-foreground">
                          With {session.advisor.fname} {session.advisor.lname}
                        </p>

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

                      <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" onClick={() => openCancelDialog(session)}>
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
                <p className="text-muted-foreground">You have no upcoming sessions scheduled.</p>
                <Button
                  className="mt-4"
                  onClick={() => setIsBookingDialogOpen(true)}
                  disabled={!isBookingEnabled || !hasAvailableAdvisors}
                >
                  Book a Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "previous" && (
        <div className="mt-6">
          {sessions.pastSessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.pastSessions.map((session) => (
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
                          With {session.advisor.fname} {session.advisor.lname}
                        </p>

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
                <p className="text-muted-foreground">You have no previous sessions.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Book Session Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a 1-on-1 Session</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select a date and time to schedule your session with a career advisor.
            </p>
          </DialogHeader>

          {hasAvailableAdvisors ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advisor">Select Advisor</Label>
                  <Select
                    value={advisorId}
                    onValueChange={(value) => {
                      console.log("Selected advisorId:", value)
                      setAdvisorId(value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      {advisorId ? (
                        <span>{getAdvisorName(advisorId)}</span>
                      ) : (
                        <span className="text-muted-foreground">Select an advisor</span>
                      )}
                    </SelectTrigger>

                    <SelectContent className="max-h-[300px]">
                      <div className="p-2 border-b">
                        <Input
                          placeholder="Search advisor..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="max-h-[200px] overflow-auto">
                        {filteredAdvisors.length > 0 ? (
                          filteredAdvisors.map((advisor) => (
                            <SelectItem
                              key={advisor.id}
                              value={advisor.id.toString()}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {advisor.fname} {advisor.lname}
                                </span>
                              </div>
                              {advisor.id.toString() === advisorId && <Check className="h-4 w-4 ml-2" />}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">No advisor found.</div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Select Date</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        style={{ minWidth: "100%" }}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
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
                        selected={date}
                        onSelect={setDate}
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
                  <h3 className="font-medium">Select Time</h3>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a time">
                        {time ? formatTimeForDisplay(time) : "Select a time"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <div className="p-2 border-b">
                        <h4 className="font-medium text-sm">Available time slots</h4>
                      </div>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot} className="cursor-pointer hover:bg-gray-100">
                          {formatTimeForDisplay(slot)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{location}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <SelectItem value="Career Center, Room 203">Career Center, Room 203</SelectItem>
                      <SelectItem value="Career Center, Room 204">Career Center, Room 204</SelectItem>
                      <SelectItem value="Online (Zoom)">Online (Zoom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6">
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Advisors Available</AlertTitle>
                <AlertDescription>
                  There are currently no advisors available for booking. Please check back later.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookSession} disabled={isSubmitting || !hasAvailableAdvisors}>
              {isSubmitting ? "Booking..." : "Book Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Session Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel 1-on-1 Session</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please provide a reason for cancelling this session. Your advisor will be notified.
            </p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {selectedSession && (
              <div className="p-3 mb-2 bg-muted rounded-md">
                <p className="font-medium">
                  {format(new Date(selectedSession.date), "MMMM d, yyyy")} at{" "}
                  {formatTimeForDisplay(selectedSession.time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  With {selectedSession.advisor.fname} {selectedSession.advisor.lname}
                </p>
                <p className="text-sm text-muted-foreground">Location: {selectedSession.location}</p>
              </div>
            )}

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
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

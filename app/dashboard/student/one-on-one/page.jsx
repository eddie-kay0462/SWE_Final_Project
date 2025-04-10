"use client"

import { useState } from "react"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"

export default function OneOnOnePage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")

  // Mock data for available time slots
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

  // Mock data for previous and upcoming sessions
  const previousSessions = [
    {
      id: 1,
      date: "February 15, 2025",
      time: "10:00 AM",
      advisor: "Dr. Sarah Johnson",
      location: "Career Center, Room 203",
      status: "completed",
      notes:
        "Discussed resume improvements and internship opportunities. Dr. Johnson suggested focusing on technical skills and provided resources for interview preparation.",
    },
    {
      id: 2,
      date: "January 20, 2025",
      time: "2:00 PM",
      advisor: "Dr. Sarah Johnson",
      location: "Online (Zoom)",
      status: "completed",
      notes:
        "Reviewed career goals and academic progress. Created a semester plan to balance coursework with career development activities.",
    },
    {
      id: 3,
      date: "December 5, 2024",
      time: "11:30 AM",
      advisor: "Dr. Sarah Johnson",
      location: "Career Center, Room 203",
      status: "completed",
      notes: "Initial career assessment and goal-setting session. Identified key strengths and areas for improvement.",
    },
  ]

  const upcomingSessions = [
    {
      id: 4,
      date: "April 5, 2025",
      time: "11:00 AM",
      advisor: "Dr. Sarah Johnson",
      location: "Career Center, Room 203",
      status: "scheduled",
    },
    {
      id: 5,
      date: "May 12, 2025",
      time: "2:30 PM",
      advisor: "Dr. Sarah Johnson",
      location: "Online (Zoom)",
      status: "scheduled",
    },
  ]

  const handleBookSession = () => {
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select both a date and time for your session.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsDialogOpen(false)
      setDate(null)
      setTime("")

      toast({
        title: "Session Booked",
        description: `Your 1-on-1 session has been successfully booked for ${format(date, "MMMM d, yyyy")} at ${time}.`,
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">1-on-1 Sessions</h1>
          <p className="text-muted-foreground mt-1">Book and manage your career advising sessions</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>Book New Session</Button>
      </div>

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
                        <p className="text-muted-foreground">With {session.advisor}</p>

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
                <p className="text-muted-foreground">You have no upcoming sessions scheduled.</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Book a Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "previous" && (
        <div className="mt-6">
          {previousSessions.length > 0 ? (
            <div className="space-y-4">
              {previousSessions.map((session) => (
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
                        <p className="text-muted-foreground">With {session.advisor}</p>

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
                <p className="text-muted-foreground">You have no previous sessions.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a 1-on-1 Session</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select a date and time to schedule your session with a career advisor.
            </p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
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
                      initialFocus
                      disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                      className="rounded-md border-0"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Select Time</h3>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border rounded-md shadow-md">
                    <div className="p-2 border-b">
                      <h4 className="font-medium text-sm">Available time slots</h4>
                    </div>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot} className="cursor-pointer hover:bg-gray-100">
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Advisor</h3>
                <p className="text-sm p-3 bg-muted rounded-md">Dr. Sarah Johnson (Your assigned career advisor)</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookSession} disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Book Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


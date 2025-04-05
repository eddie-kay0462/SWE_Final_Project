"use client"

import { useState } from "react"
import { CalendarIcon, MapPin, Plus, Users, Download, Edit, Trash2, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

export default function AdminEventsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false)
  const [attendanceReportDialogOpen, setAttendanceReportDialogOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [eventTitle, setEventTitle] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for events
  const events = [
    {
      id: 1,
      title: "Resume Building Workshop",
      date: "April 10, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Career Center, Room 203",
      description: "Learn how to create a professional resume that stands out to employers.",
      status: "upcoming",
      attendees: 25,
      capacity: 30,
    },
    {
      id: 2,
      title: "Interview Skills Workshop",
      date: "April 15, 2025",
      time: "1:00 PM - 3:00 PM",
      location: "Career Center, Room 204",
      description: "Practice common interview questions and learn techniques to impress employers.",
      status: "upcoming",
      attendees: 18,
      capacity: 30,
    },
    {
      id: 3,
      title: "Career Fair",
      date: "March 15, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "Student Center, Grand Hall",
      description: "Meet with employers from various industries and explore job opportunities.",
      status: "past",
      attendees: 120,
      capacity: 150,
    },
    {
      id: 4,
      title: "Networking Workshop",
      date: "February 20, 2025",
      time: "3:00 PM - 5:00 PM",
      location: "Career Center, Room 203",
      description: "Learn effective networking strategies to build professional connections.",
      status: "past",
      attendees: 22,
      capacity: 30,
    },
  ]

  const upcomingEvents = events.filter((event) => event.status === "upcoming")
  const pastEvents = events.filter((event) => event.status === "past")

  // Available dates (next 30 days)
  const availableDates = []
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    availableDates.push(
      date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    )
  }

  // Mock data for attendance
  const mockAttendanceData = [
    { id: "20242025", name: "John Doe", yearGroup: "2025", checkInTime: "10:15 AM" },
    { id: "20242026", name: "Jane Smith", yearGroup: "2026", checkInTime: "10:05 AM" },
    { id: "20242027", name: "Michael Johnson", yearGroup: "2027", checkInTime: "10:30 AM" },
    { id: "20242028", name: "Emily Williams", yearGroup: "2028", checkInTime: "10:12 AM" },
    { id: "20242029", name: "David Brown", yearGroup: "2025", checkInTime: "10:45 AM" },
  ]

  const handleCreateEvent = () => {
    if (!eventTitle || !eventDate || !eventTime || !eventLocation || !eventDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to create an event.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setCreateEventDialogOpen(false)
      resetEventForm()

      toast({
        title: "Event Created",
        description: `${eventTitle} has been scheduled for ${eventDate}.`,
      })
    }, 1500)
  }

  const resetEventForm = () => {
    setEventTitle("")
    setEventDate("")
    setEventTime("")
    setEventLocation("")
    setEventDescription("")
  }

  const handleViewAttendance = (event) => {
    setCurrentEvent(event)
    setAttendanceReportDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">Events</h1>
          <p className="text-muted-foreground mt-1">Manage career services events</p>
        </div>

        <Button onClick={() => setCreateEventDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "upcoming" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Events
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "past" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Events
          </button>
        </div>

        {activeTab === "upcoming" && (
          <div className="mt-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6 pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{event.title}</h3>
                          <p className="text-muted-foreground">
                            {event.date} • {event.time}
                          </p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {event.attendees} / {event.capacity} registered
                              </span>
                            </div>
                            <p className="text-sm mt-2">{event.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
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
                  <p className="text-muted-foreground">No upcoming events scheduled.</p>
                  <Button className="mt-4" onClick={() => setCreateEventDialogOpen(true)}>
                    Create an Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="mt-6">
            {pastEvents.length > 0 ? (
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6 pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{event.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Completed
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            {event.date} • {event.time}
                          </p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {event.attendees} / {event.capacity} attended
                              </span>
                            </div>
                            <p className="text-sm mt-2">{event.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewAttendance(event)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Attendance
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
                  <p className="text-muted-foreground">No past events.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Create Event Dialog */}
      <Dialog open={createEventDialogOpen} onOpenChange={setCreateEventDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <input
                id="event-title"
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal flex items-center"
                  onClick={() => document.getElementById("event-date").focus()}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate || "Select a date"}
                </Button>
                <select
                  id="event-date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
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
              <Label htmlFor="event-time">Time</Label>
              <input
                id="event-time"
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 2:00 PM - 4:00 PM"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <input
                id="event-location"
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter event location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <textarea
                id="event-description"
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder="Enter event description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-capacity">Capacity</Label>
              <input
                id="event-capacity"
                type="number"
                className="w-full p-2 border rounded-md"
                placeholder="Enter maximum capacity"
                defaultValue={30}
                min={1}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Report Dialog */}
      <Dialog open={attendanceReportDialogOpen} onOpenChange={setAttendanceReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance Report</DialogTitle>
          </DialogHeader>

          {currentEvent && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-md">
                <h3 className="font-medium">{currentEvent.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentEvent.date} • {currentEvent.time}
                </p>
                <p className="text-sm text-muted-foreground">{currentEvent.location}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div>
                  <p className="font-medium text-green-800">Attendance Summary</p>
                  <p className="text-sm text-green-700">
                    {currentEvent.attendees} out of {currentEvent.capacity} attended (
                    {Math.round((currentEvent.attendees / currentEvent.capacity) * 100)}%)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="border rounded-md">
                <div className="p-3 border-b bg-muted font-medium">Attendee List</div>
                <div className="max-h-72 overflow-y-auto">
                  {mockAttendanceData.map((student) => (
                    <div key={student.id} className="p-3 border-b last:border-b-0">
                      <p className="font-medium">{student.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          ID: {student.id} • Year: {student.yearGroup}
                        </p>
                        <p className="text-sm text-muted-foreground">Check-in: {student.checkInTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setAttendanceReportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  MessageSquare,
  Plus,
  Video,
  Building2,
  Link,
  CalendarDays,
  Search,
  Pencil,
  Copy,
  Trash2,
  Download,
  Share2,
  Star,
  ChevronDown,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QRCodeCard } from "@/components/attendance/QRCodeCard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * AdminEventsPage displays all events for admins, including attendee feedback and QR code generation.
 *
 * <p>Admins can view upcoming and past events, see feedback from students (with names), and generate check-in QR codes.</p>
 *
 * @author Nana Amoako
 * @version 2024-06
 */
export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)

  // Create event form state
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
  })
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [eventDate, setEventDate] = useState(new Date())
  const [eventType, setEventType] = useState("in-person")

  // Attendance dialog state
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [attendanceData, setAttendanceData] = useState(null)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)

  // Function to handle opening create event dialog
  const handleOpenCreateEventDialog = () => {
    setCreateEventDialogOpen(true)
  }

  // Function to handle input changes for the create event form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle event type change
  const handleEventTypeChange = (value) => {
    setEventType(value)
    if (value === "online") {
      setNewEvent((prev) => ({
        ...prev,
        location: "Online",
        description: "Please insert your video conferencing link (Google Meet/Zoom/Teams) here:\n\n",
      }))
    } else {
      setNewEvent((prev) => ({
        ...prev,
        location: "",
        description: "",
      }))
    }
  }

  // Validate time format and range
  const validateTime = (time) => {
    if (!time) return false
    const [hours, minutes] = time.split(":").map(Number)
    return hours >= 9 && (hours < 17 || (hours === 17 && minutes === 0))
  }

  // Handle time change with validation
  const handleTimeChange = (field, value) => {
    if (!value) return

    setNewEvent((prev) => {
      const updatedEvent = { ...prev, [field]: value }

      // Validate end time is after start time
      if (field === "end_time" && prev.start_time && value <= prev.start_time) {
        toast.error("End time must be after start time")
        return prev
      }

      if (!validateTime(value)) {
        toast.error("Events must be scheduled between 9:00 AM and 5:00 PM")
        return prev
      }

      return updatedEvent
    })
  }

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/dashboard/admin/events")

        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }

        const data = await response.json()
        setUpcomingEvents(data.upcomingEvents || [])
        setPastEvents(data.pastEvents || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again later.")
        toast.error("Failed to load events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  /**
   * Generates QR code data URL for an event
   * 
   * @param {string} eventId - The event ID to encode
   * @returns {Promise<string>} Base64 encoded QR code image
   */
  async function generateQRCode(eventId) {
    try {
      const timestamp = new Date().toISOString();
      const attendanceUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://csoft-vert.vercel.app/'}/take-attendance/${eventId}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(attendanceUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Function to handle opening feedback dialog
  const handleOpenFeedbackDialog = (event) => {
    setSelectedEvent(event)
    setFeedbackDialogOpen(true)
  }

  // Function to handle feedback submission
  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating for this event.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/dashboard/student/events/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          rating,
          feedback: feedbackText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback")
      }

      setFeedbackDialogOpen(false)
      setFeedbackText("")
      setRating(0)

      toast.success("Thank you for your feedback!")
    } catch (error) {
      toast.error(error.message || "Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle edit event
  const handleEditEvent = async (eventData) => {
    if (!eventData) return;
    
    try {
      setIsLoading(true);
      
      // Update event in database
      const response = await fetch(`/api/dashboard/admin/events/${eventData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          date: eventData.date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          description: eventData.description
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event');
      }

      // Update local state
      const updatedEvent = data.event;
      const isUpcoming = new Date(updatedEvent.date) >= new Date();
      
      // Update the appropriate list based on event date
      if (isUpcoming) {
        setUpcomingEvents(upcomingEvents.map(event => 
          event.id === eventData.id ? updatedEvent : event
        ));
      } else {
        setPastEvents(pastEvents.map(event => 
          event.id === eventData.id ? updatedEvent : event
        ));
      }

      setCreateEventDialogOpen(false);
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('[AdminEvents] Update error:', error);
      toast.error(error.message || 'Failed to update event');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/dashboard/admin/events/${eventId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete event')
      }

      // Update local state by removing the deleted event
      if (selectedEvent.status === "upcoming") {
        setUpcomingEvents(upcomingEvents.filter((e) => e.id !== eventId))
      } else {
        setPastEvents(pastEvents.filter((e) => e.id !== eventId))
      }

      setDeleteConfirmOpen(false)
      toast.success('Event deleted successfully')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error.message || 'Failed to delete event')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle create event
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.start_time || !newEvent.end_time || !newEvent.location || !newEvent.description) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!validateTime(newEvent.start_time) || !validateTime(newEvent.end_time)) {
      toast.error("Times must be between 9:00 AM and 5:00 PM")
      return
    }
    setIsCreatingEvent(true)
    try {
      const isEditing = newEvent.id !== undefined
      const url = isEditing 
        ? `/api/dashboard/admin/events/${newEvent.id}`
        : "/api/dashboard/admin/events"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newEvent,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} event`)
      }
      setNewEvent({
        title: "",
        date: "",
        start_time: "",
        end_time: "",
        location: "",
        description: "",
      })
      setCreateEventDialogOpen(false)
      
      // Update local state instead of reloading the page
      if (isEditing) {
        const updatedEvent = { ...data, status: newEvent.status }
        if (updatedEvent.status === "upcoming") {
          setUpcomingEvents(upcomingEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e))
        } else {
          setPastEvents(pastEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e))
        }
        toast.success("Event updated successfully!")
      } else {
        // If creating new event, add to upcoming events
        setUpcomingEvents([...upcomingEvents, data])
        toast.success("Event created successfully!")
      }
    } catch (error) {
      toast.error(error.message || "Failed to save event. Please try again.")
    } finally {
      setIsCreatingEvent(false)
    }
  }

  // Helper to format time for display
  function formatTimeForDisplay(time) {
    if (!time) return ""
    const [hour, minute] = time.split(":")
    const h = Number.parseInt(hour, 10)
    const ampm = h >= 12 ? "PM" : "AM"
    const displayHour = h % 12 || 12
    return `${displayHour}:${minute} ${ampm}`
  }

  // Function to render event cards
  const renderEventCards = (events) => {
    if (isLoading) {
      return (
        <div className="col-span-full flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#A91827] text-white rounded-xl hover:bg-[#A91827]/90"
          >
            Try Again
          </Button>
        </div>
      )
    }

    if (events.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {activeTab === "upcoming"
              ? "There are no upcoming events scheduled. Create a new event to get started."
              : "There are no past events to display."}
          </p>
          {activeTab === "upcoming" && (
            <Button
              onClick={handleOpenCreateEventDialog}
              className="bg-[#A91827] hover:bg-[#A91827]/90 text-white rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      )
    }

    return events.map((event) => (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <Card className="overflow-hidden h-full border border-muted-foreground/10 hover:border-muted-foreground/20 hover:shadow-lg transition-all duration-200 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="relative">
              {/* Event type and status badges */}
              <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
                <Badge
                  variant={event.location === "Online" ? "secondary" : "default"}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                    event.location === "Online" 
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                      : "bg-[#A91827]/10 text-[#A91827]"
                  )}
                >
                  {event.location === "Online" ? (
                    <div className="flex items-center gap-1.5">
                      <Video className="h-3 w-3" />
                      <span>Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      <span>In-Person</span>
                    </div>
                  )}
                </Badge>
                <Badge 
                  variant={event.status === "upcoming" ? "default" : "secondary"} 
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                    event.status === "upcoming"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  )}
                >
                  {event.status === "upcoming" ? "Upcoming" : "Past"}
                </Badge>
              </div>

              {/* Color bar */}
              <div 
                className={cn(
                  "h-1.5 w-full",
                  event.status === "upcoming" ? "bg-[#A91827]" : "bg-gray-400"
                )}
              />

              <div className="p-6 pt-16"> {/* Increased top padding to prevent badge overlap */}
                <div className="flex flex-col space-y-6"> {/* Increased spacing between sections */}
                  {/* Title and details section */}
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight mb-4">{event.title}</h3>
                    <div className="grid gap-3 text-sm text-muted-foreground"> {/* Changed to grid for consistent spacing */}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-3 text-[#A91827] shrink-0" />
                        <span className="truncate">{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-3 text-[#A91827] shrink-0" />
                        <span className="truncate">
                          {formatTimeForDisplay(event.start_time)} - {formatTimeForDisplay(event.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-3 text-[#A91827] shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-3 text-[#A91827] shrink-0" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {event.tags &&
                      event.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium border-muted-foreground/20 whitespace-nowrap"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>

                  <Separator className="bg-muted-foreground/10" />

                  {/* Actions section */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2 flex-wrap flex-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {/* Generate check-in QR code */}
                            <Button
                              onClick={() => {
                                setSelectedEvent(event);
                                setQRDialogOpen(true);
                              }}
                              variant="outline" 
                              className="flex items-center gap-2 rounded-xl h-9 px-3 border-muted-foreground/20 hover:bg-muted-foreground/5 whitespace-nowrap"
                            >
                              <QrCode className="h-4 w-4" />
                              <span className="hidden sm:inline">Generate QR</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Generate check-in QR code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleViewAttendance(event)}
                              variant="outline"
                              className="flex items-center gap-2 rounded-xl h-9 px-3 border-muted-foreground/20 hover:bg-muted-foreground/5 whitespace-nowrap"
                            >
                              <Users className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                View Attendance ({event.attendees || 0})
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View attendance records</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleOpenFeedbackDialog(event)}
                              variant="outline"
                              className="flex items-center gap-2 rounded-xl h-9 px-3 border-muted-foreground/20 hover:bg-muted-foreground/5 whitespace-nowrap"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                {event.feedbackCount > 0 ? `Feedback (${event.feedbackCount})` : "No Feedback"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View student feedback</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Action buttons */}
                    {event.status === "upcoming" && (
                      <div className="flex gap-2 shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => {
                                  setNewEvent({
                                    id: event.id,
                                    title: event.title,
                                    date: event.date,
                                    start_time: event.start_time,
                                    end_time: event.end_time,
                                    location: event.location,
                                    description: event.description,
                                  })
                                  setEventType(event.location === "Online" ? "online" : "in-person")
                                  setEventDate(new Date(event.date))
                                  setCreateEventDialogOpen(true)
                                }}
                                size="icon"
                                variant="ghost"
                                className="rounded-full h-9 w-9 hover:bg-muted-foreground/5"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit event</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setDeleteConfirmOpen(true)
                                }}
                                size="icon"
                                variant="ghost"
                                className="rounded-full h-9 w-9 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete event</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))
  }

  /**
   * Renders the feedback modal for an event, showing all feedback with student names.
   *
   * @returns {JSX.Element|null} The feedback modal or null if not open
   */
  const renderFeedbackModal = () => {
    if (!feedbackDialogOpen) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFeedbackDialogOpen(false)} />
        <div className="z-50 w-full max-w-md sm:max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={() => setFeedbackDialogOpen(false)}
          >
            <span className="sr-only">Close</span>×
          </button>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Event Feedback</h2>
              <p className="text-sm text-muted-foreground">Feedback from attendees for this event.</p>
            </div>
            {selectedEvent && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted rounded-md">
                  <h3 className="font-medium">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.date} • {selectedEvent.start_time} - {selectedEvent.end_time}
                  </p>
                </div>
                {selectedEvent.feedback && selectedEvent.feedback.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">Feedback from {selectedEvent.feedbackCount} attendees</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {selectedEvent.feedback.map((item, index) => (
                        <div key={index} className="p-3 border rounded-md bg-white dark:bg-gray-900">
                          <div className="flex items-center mb-1 justify-between">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-yellow-400 ${star <= item.rating ? "opacity-100" : "opacity-30"}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {item.fname} {item.lname}
                            </span>
                          </div>
                          {item.comments && <p className="text-sm text-muted-foreground mt-1">{item.comments}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No feedback has been submitted for this event yet.</p>
                  </div>
                )}
                {/* Optionally, admin can submit feedback here if needed */}
              </div>
            )}
            <DialogFooter>
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={() => setFeedbackDialogOpen(false)}
              >
                Cancel
              </button>
            </DialogFooter>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Renders the create event dialog with enhanced UI and features
   *
   * @returns {JSX.Element|null} The create event dialog or null if not open
   */
  const renderCreateEventDialog = () => {
    if (!createEventDialogOpen) return null;

    return (
      <Dialog open={createEventDialogOpen} onOpenChange={setCreateEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl overflow-hidden border-none bg-white/95 backdrop-blur-sm dark:bg-gray-950/95">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-8 space-y-8"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight">Create New Event</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Fill in the details below to create a new career event.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Event Type Selector */}
              <div className="space-y-3">
                <Label htmlFor="event-type" className="text-sm font-medium">
                  Event Type
                </Label>
                <Select value={eventType} onValueChange={handleEventTypeChange}>
                  <SelectTrigger className="w-full rounded-xl h-11 border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors">
                    <SelectValue placeholder="Select event type" />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#A91827]" />
                        <span>In-Person</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-[#A91827]" />
                        <span>Online</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Event Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium">
                  Event Title
                </Label>
                <div className="relative">
                  <Input
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="pl-10 h-11 rounded-xl border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors"
                    placeholder="Enter event title"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 text-[#A91827] transform -translate-y-1/2" />
                </div>
              </div>

              {/* Date and Time Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Picker */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Event Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left h-11 rounded-xl border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors",
                          !eventDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4 text-[#A91827]" />
                        {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Card>
                        <CardContent className="p-0">
                          <CalendarComponent
                            mode="single"
                            selected={eventDate}
                            onSelect={(newDate) => {
                              setEventDate(newDate)
                              setNewEvent((prev) => ({
                                ...prev,
                                date: format(newDate, "yyyy-MM-dd"),
                              }))
                            }}
                            initialFocus
                            className="rounded-lg border-none"
                          />
                        </CardContent>
                      </Card>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Pickers */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Event Time</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Input
                        id="start_time"
                        name="start_time"
                        type="time"
                        value={newEvent.start_time}
                        onChange={(e) => handleTimeChange("start_time", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors"
                        min="09:00"
                        max="17:00"
                      />
                      <Clock className="absolute left-3 top-1/2 h-5 w-5 text-[#A91827] transform -translate-y-1/2" />
                    </div>
                    <div className="relative">
                      <Input
                        id="end_time"
                        name="end_time"
                        type="time"
                        value={newEvent.end_time}
                        onChange={(e) => handleTimeChange("end_time", e.target.value)}
                        className="pl-10 h-11 rounded-xl border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors"
                        min="09:00"
                        max="17:00"
                      />
                      <Clock className="absolute left-3 top-1/2 h-5 w-5 text-[#A91827] transform -translate-y-1/2" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Events must be scheduled between 9:00 AM and 5:00 PM</p>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-medium">
                  Event Location
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    name="location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                    className="pl-10 h-11 rounded-xl border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors"
                    placeholder={eventType === "online" ? "Online" : "Enter event location"}
                    disabled={eventType === "online"}
                  />
                  {eventType === "online" ? (
                    <Video className="absolute left-3 top-1/2 h-5 w-5 text-[#A91827] transform -translate-y-1/2" />
                  ) : (
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 text-[#A91827] transform -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium">
                  Event Description
                </Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    className="min-h-[120px] pl-10 pt-3 rounded-xl border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors resize-none"
                    placeholder="Enter event description"
                  />
                  {eventType === "online" ? (
                    <Link className="absolute left-3 top-3 h-5 w-5 text-[#A91827]" />
                  ) : (
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-[#A91827]" />
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setCreateEventDialogOpen(false)} 
                className="flex-1 rounded-xl h-11 border-muted-foreground/20 hover:bg-muted-foreground/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={isCreatingEvent}
                className={cn(
                  "flex-1 rounded-xl h-11 bg-[#A91827] hover:bg-[#A91827]/90 text-white transition-colors",
                  isCreatingEvent && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCreatingEvent ? (
                  <>
                    <span className="animate-spin mr-2">⌛</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  // Enhanced QR code modal
  const renderQRModal = () => {
    if (!showQRModal) return null;

    const attendanceUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://csoft-vert.vercel.app/'}/take-attendance/${selectedEvent.id}`;

    return (
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md p-0 rounded-2xl overflow-hidden border-none bg-white/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Event Check-in QR Code</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Students can scan this QR code to check in to the event.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <QRCodeSVG
                  value={attendanceUrl}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-semibold">{selectedEvent?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent?.date} • {formatTimeForDisplay(selectedEvent?.start_time)} -{" "}
                  {formatTimeForDisplay(selectedEvent?.end_time)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                onClick={() => {
                  // Create a canvas element
                  const canvas = document.createElement("canvas")
                  const qrCodeElement = document.querySelector("svg")
                  const serializer = new XMLSerializer()
                  const svgStr = serializer.serializeToString(qrCodeElement)

                  const img = new Image()
                  img.src = "data:image/svg+xml;base64," + btoa(svgStr)

                  img.onload = () => {
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext("2d")
                    ctx.drawImage(img, 0, 0)

                    // Create download link
                    const link = document.createElement("a")
                    link.download = `${selectedEvent.title.replace(/\s+/g, "-")}-QR-Code.png`
                    link.href = canvas.toDataURL("image/png")
                    link.click()
                  }
                }}
                className="flex items-center gap-2 bg-[#A91827] text-white rounded-xl hover:bg-[#A91827]/90 w-full"
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>

              <Button
                onClick={() => {
                  // Share functionality
                  if (navigator.share) {
                    navigator
                      .share({
                        title: `Check-in QR for ${selectedEvent.title}`,
                        text: `Scan this QR code to check in to ${selectedEvent.title}`,
                        url: attendanceUrl,
                      })
                      .catch((error) => console.log("Error sharing", error))
                  } else {
                    // Fallback - copy to clipboard
                    navigator.clipboard.writeText(attendanceUrl)
                    toast.success("QR code URL copied to clipboard")
                  }
                }}
                variant="outline"
                className="flex items-center gap-2 rounded-xl w-full"
              >
                <Share2 className="h-4 w-4" />
                Share QR Code
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  };

  // Delete confirmation dialog
  const renderDeleteConfirmation = () => {
    if (!deleteConfirmOpen) return null

    return (
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md p-0 rounded-2xl overflow-hidden border-none bg-white/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-red-600">Delete Event</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="my-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium">{selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.date} • {formatTimeForDisplay(selectedEvent.start_time)} -{" "}
                  {formatTimeForDisplay(selectedEvent.end_time)}
                </p>
              </div>
            )}

            <DialogFooter className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="rounded-xl px-8">
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                variant="destructive"
                className="rounded-xl px-8 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Event
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  const handleViewAttendance = async (event) => {
    window.location.href = `/dashboard/admin/events/${event.id}/attendance`;
  };

  const renderAttendanceDialog = () => {
    if (!attendanceDialogOpen) return null;

    return (
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Event Attendance</DialogTitle>
            {attendanceData && (
              <DialogDescription>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{attendanceData.event.title}</p>
                  <p>{attendanceData.event.date}</p>
                  <p>{attendanceData.event.time}</p>
                  <p>{attendanceData.event.location}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total Attendees: {attendanceData.attendanceCount}
                  </p>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>

          {isLoadingAttendance ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : attendanceData?.records.length > 0 ? (
            <div className="relative max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Check-in Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>{record.studentId}</TableCell>
                      <TableCell>{record.email}</TableCell>
                      <TableCell>{record.checkedInAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for this event.
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Career Events</h1>
            <p className="text-base text-muted-foreground mt-1">Manage and organize career development sessions</p>
          </div>
          <Button
            onClick={handleOpenCreateEventDialog}
            className="bg-[#A91827] hover:bg-[#A91827]/90 text-white rounded-xl h-11 px-6 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        <Separator className="my-8 bg-muted-foreground/10" />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-muted-foreground/10 hover:border-muted-foreground/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <h3 className="text-2xl font-bold mt-1">{upcomingEvents.length + pastEvents.length}</h3>
                </div>
                <div className="h-12 w-12 bg-[#A91827]/10 rounded-full flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-[#A91827]" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {upcomingEvents.length} upcoming, {pastEvents.length} past
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-muted-foreground/10 hover:border-muted-foreground/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {upcomingEvents.concat(pastEvents).reduce((sum, event) => sum + (event.attendees || 0), 0)}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-[#A91827]/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#A91827]" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all events</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-muted-foreground/10 hover:border-muted-foreground/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {pastEvents.length > 0
                      ? (
                          pastEvents.reduce((sum, event) => {
                            const totalRating = event.feedback?.reduce((r, f) => r + f.rating, 0) || 0
                            return sum + totalRating / (event.feedback?.length || 1)
                          }, 0) / pastEvents.length
                        ).toFixed(1)
                      : "N/A"}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-[#A91827]/10 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-[#A91827]" />
                </div>
              </div>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
            <Input
              placeholder="Search events by title, location, or description..."
              className="pl-10 pr-4 h-11 rounded-xl border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors"
              onChange={(e) => {
                // Implement search functionality here
                console.log("Search term:", e.target.value)
              }}
            />
          </div>
          <div className="flex gap-3">
            <Select
              onValueChange={(value) => {
                // Filter by event type
                console.log("Filter by type:", value)
              }}
            >
              <SelectTrigger className="w-[180px] rounded-xl h-11 border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors">
                <SelectValue placeholder="Event Type" />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in-person">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#A91827]" />
                    <span>In-Person</span>
                  </div>
                </SelectItem>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-[#A91827]" />
                    <span>Online</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                // Sort events
                console.log("Sort by:", value)
              }}
            >
              <SelectTrigger className="w-[180px] rounded-xl h-11 border-muted-foreground/20 bg-white dark:bg-gray-950 shadow-sm hover:border-muted-foreground/30 focus:border-[#A91827] transition-colors">
                <SelectValue placeholder="Sort By" />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#A91827]" />
                    <span>Date (Ascending)</span>
                  </div>
                </SelectItem>
                <SelectItem value="date-desc">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#A91827]" />
                    <span>Date (Descending)</span>
                  </div>
                </SelectItem>
                <SelectItem value="attendees">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#A91827]" />
                    <span>Most Attendees</span>
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#A91827]" />
                    <span>Highest Rating</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 rounded-2xl bg-muted/50 p-1 max-w-xs mb-8">
          <Button
            variant={activeTab === "upcoming" ? "default" : "ghost"}
            className={cn(
              "flex-1 rounded-xl text-sm font-medium transition-all h-9",
              activeTab === "upcoming" ? "bg-red-900 shadow-sm dark:bg-gray-950" : "hover:bg-red-500/50 dark:hover:bg-gray-800/50"
            )}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Events
          </Button>
          <Button
            variant={activeTab === "past" ? "default" : "ghost"}
            className={cn(
              "flex-1 rounded-xl text-sm font-medium transition-all h-9",
              activeTab === "past" ? "bg-red-900 shadow-sm dark:bg-gray-950" : "hover:bg-red-500/50 dark:hover:bg-gray-800/50"
            )}
            onClick={() => setActiveTab("past")}
          >
            Past Events
          </Button>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeTab === "upcoming" ? renderEventCards(upcomingEvents) : renderEventCards(pastEvents)}
      </div>

      {/* Pagination */}
      {(activeTab === "upcoming" ? upcomingEvents.length : pastEvents.length) > itemsPerPage && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 px-4 rounded-xl border-muted-foreground/20 hover:bg-muted-foreground/5 disabled:opacity-50"
            >
              Previous
            </Button>
            {Array.from(
              {
                length: Math.ceil(
                  (activeTab === "upcoming" ? upcomingEvents.length : pastEvents.length) / itemsPerPage,
                ),
              },
              (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "h-9 w-9 rounded-xl font-medium",
                    currentPage === i + 1 
                      ? "bg-[#A91827] text-white hover:bg-[#A91827]/90" 
                      : "border-muted-foreground/20 hover:bg-muted-foreground/5"
                  )}
                >
                  {i + 1}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil((activeTab === "upcoming" ? upcomingEvents.length : pastEvents.length) / itemsPerPage),
                  ),
                )
              }
              disabled={
                currentPage ===
                Math.ceil((activeTab === "upcoming" ? upcomingEvents.length : pastEvents.length) / itemsPerPage)
              }
              className="h-9 px-4 rounded-xl border-muted-foreground/20 hover:bg-muted-foreground/5 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Render modals */}
      {renderQRModal()}
      {renderFeedbackModal()}
      {renderCreateEventDialog()}
      {renderDeleteConfirmation()}

      {/* Attendance Dialog */}
      {renderAttendanceDialog()}
    </div>
  )
}

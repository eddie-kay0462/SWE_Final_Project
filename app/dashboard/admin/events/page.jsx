"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Users, QrCode, CheckCircle, MessageSquare, Plus } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/**
 * AdminEventsPage displays all events for admins, including attendee feedback and QR code generation.
 *
 * <p>Admins can view upcoming and past events, see feedback from students (with names), and generate check-in QR codes.</p>
 *
 * @author SWE Team
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
  
  // Create event form state
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: ''
  })
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dashboard/admin/events')
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const data = await response.json()
        setUpcomingEvents(data.upcomingEvents || [])
        setPastEvents(data.pastEvents || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load events. Please try again later.')
        toast.error("Failed to load events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Function to generate QR code data
  const generateQRData = (event) => {
    const eventId = event.id
    const timestamp = new Date().toISOString()
    const googleFormUrl = "https://forms.gle/nE7nQsXXHxo1VUbj7"
    const data = `${googleFormUrl}?eventId=${eventId}&timestamp=${timestamp}`
    return data
  }

  // Function to handle QR code generation
  const handleGenerateQR = (event) => {
    setSelectedEvent(event)
    setShowQRModal(true)
    toast.success("QR code generated for event check-in")
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
      const response = await fetch('/api/dashboard/student/events/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          rating,
          feedback: feedbackText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
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

  // Function to handle opening create event dialog
  const handleOpenCreateEventDialog = () => {
    setCreateEventDialogOpen(true)
  }

  // Function to handle input changes for the create event form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // Function to validate time range
  const validateTimeRange = (start, end) => {
    if (!start || !end) return false;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    // 9 AM = 540, 5 PM = 1020
    return (
      startMinutes >= 540 && endMinutes <= 1020 && endMinutes > startMinutes
    );
  }

  // Function to handle create event form submission
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.start_time || !newEvent.end_time || !newEvent.location || !newEvent.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!validateTimeRange(newEvent.start_time, newEvent.end_time)) {
      toast.error("Times must be between 9:00 AM and 5:00 PM, and end time must be after start time");
      return;
    }
    setIsCreatingEvent(true);
    try {
      const response = await fetch('/api/dashboard/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }
      setNewEvent({
        title: '',
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        description: ''
      });
      setCreateEventDialogOpen(false);
      window.location.reload();
      toast.success("Event created successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to create event. Please try again.");
    } finally {
      setIsCreatingEvent(false);
    }
  }

  // Helper to format time for display
  function formatTimeForDisplay(time) {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  }

  // Function to render event cards
  const renderEventCards = (events) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#A91827] text-white rounded-md hover:bg-[#A91827]/90"
          >
            Try Again
          </button>
        </div>
      )
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No {activeTab} events found.</p>
        </div>
      )
    }

    return events.map((event) => (
      <div key={event.id} className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <div className="flex items-center text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatTimeForDisplay(event.start_time)} - {formatTimeForDisplay(event.end_time)}</span>
              </div>
              <div className="flex items-center text-muted-foreground mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Users className="h-4 w-4 mr-2" />
                <span>{event.attendees} attendees</span>
              </div>
              {event.feedbackCount > 0 && (
                <div className="flex items-center text-muted-foreground mb-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>{event.feedbackCount} feedback • {event.averageRating} avg rating</span>
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex gap-2">
                {activeTab === "upcoming" && (
                  <button
                    onClick={() => handleGenerateQR(event)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    Generate Check-in QR
                  </button>
                )}
                {activeTab === "past" && (
                  <div className="inline-flex items-center text-muted-foreground text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Event Completed
                  </div>
                )}
                <button
                  onClick={() => handleOpenFeedbackDialog(event)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  {event.feedbackCount > 0 ? `View Feedback (${event.feedbackCount})` : "No Feedback"}
                </button>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">{event.description}</p>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ))
  }

  /**
   * Renders the feedback modal for an event, showing all feedback with student names.
   *
   * @returns {JSX.Element|null} The feedback modal or null if not open
   */
  const renderFeedbackModal = () => {
    if (!feedbackDialogOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setFeedbackDialogOpen(false)}
        />
        <div className="z-50 w-full max-w-md sm:max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={() => setFeedbackDialogOpen(false)}
          >
            <span className="sr-only">Close</span>
            ×
          </button>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Event Feedback</h2>
              <p className="text-sm text-muted-foreground">
                Feedback from attendees for this event.
              </p>
            </div>
            {selectedEvent && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted rounded-md">
                  <h3 className="font-medium">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEvent.date} • {selectedEvent.start_time} - {selectedEvent.end_time}</p>
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
                                  className={`text-yellow-400 ${star <= item.rating ? 'opacity-100' : 'opacity-30'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {item.fname} {item.lname}
                            </span>
                          </div>
                          {item.comments && (
                            <p className="text-sm text-muted-foreground mt-1">{item.comments}</p>
                          )}
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
    );
  };

  /**
   * Renders the create event dialog
   * 
   * @returns {JSX.Element|null} The create event dialog or null if not open
   */
  const renderCreateEventDialog = () => {
    if (!createEventDialogOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setCreateEventDialogOpen(false)}
        />
        <div className="z-50 w-full max-w-md sm:max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={() => setCreateEventDialogOpen(false)}
          >
            <span className="sr-only">Close</span>
            ×
          </button>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Create New Event</h2>
              <p className="text-sm text-muted-foreground">
                Fill in the details to create a new career event.
              </p>
            </div>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Event Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter event title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">Event Date *</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="start_time" className="text-sm font-medium">Start Time *</label>
                <input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={newEvent.start_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  min="09:00"
                  max="17:00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="end_time" className="text-sm font-medium">End Time *</label>
                <input
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={newEvent.end_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  min="09:00"
                  max="17:00"
                  required
                />
                <p className="text-xs text-muted-foreground">Events must be scheduled between 9:00 AM and 5:00 PM. End time must be after start time.</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Event Location *</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter event location"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Event Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  placeholder="Enter event description"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={() => setCreateEventDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-[#A91827] text-white rounded-md hover:bg-[#A91827]/90"
                onClick={handleCreateEvent}
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? 'Creating...' : 'Create Event'}
              </button>
            </DialogFooter>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* QR Code Modal */}
      {showQRModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Event Check-in QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <QRCodeSVG
                value={generateQRData(selectedEvent)}
                size={200}
                level="H"
                includeMargin={true}
                className="p-4 bg-white rounded-lg"
              />
              <p className="text-sm text-muted-foreground text-center">
                Students can scan this QR code to check in to the event
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {renderFeedbackModal()}
      
      {/* Create Event Modal */}
      {renderCreateEventDialog()}

      {/* Header with Create Event Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Career Events</h1>
        <button
          onClick={handleOpenCreateEventDialog}
          className="flex items-center gap-2 px-4 py-2 bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-4 ${activeTab === "upcoming" ? "border-b-2 border-[#A91827] text-[#A91827]" : "text-muted-foreground"}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Events
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === "past" ? "border-b-2 border-[#A91827] text-[#A91827]" : "text-muted-foreground"}`}
          onClick={() => setActiveTab("past")}
        >
          Past Events
        </button>
      </div>

      {/* Event Cards */}
      <div className="grid gap-6">
        {activeTab === "upcoming" ? renderEventCards(upcomingEvents) : renderEventCards(pastEvents)}
      </div>
    </div>
  )
}


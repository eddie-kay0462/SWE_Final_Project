"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, ChevronRight, CheckCircle, MessageSquare, X, QrCode } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { QRCodeCard } from "@/components/attendance/QRCodeCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper to format time for display
function formatTimeForDisplay(time) {
  if (!time) return '';
  const [hour, minute] = time.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

export default function EventsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dashboard/student/events')
        
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
        toast({
          title: "Error",
          description: "Failed to load events. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  const handleOpenFeedbackDialog = (event) => {
    console.log("Opening feedback dialog for event:", event);
    setSelectedEvent(event);
    // If user has already submitted feedback, pre-fill the form
    if (event.hasFeedback && event.feedback) {
      setRating(event.feedback.rating);
      setFeedbackText(event.feedback.comments || "");
    } else {
      setRating(0);
      setFeedbackText("");
    }
    setFeedbackDialogOpen(true);
  }

  const handleOpenQRDialog = (event) => {
    // Redirect to the take-attendance page
    window.location.href = `https://csoft-vert.vercel.app/take-attendance/${event.id}`;
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating for this event.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Submitting feedback for event:", selectedEvent.id);
      const response = await fetch('/api/dashboard/student/events/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          rating: rating,
          comments: feedbackText
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback on this event.",
      })

      // Close the dialog and reset form
      setFeedbackDialogOpen(false)
      setFeedbackText("")
      setRating(0)
      setSelectedEvent(null)
      
      // Refresh the events to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
      <Card key={event.id} className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6 pt-6">
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
              {/* <div className="flex items-center text-muted-foreground mb-1">
                <Users className="h-4 w-4 mr-2" />
                <span>{event.attendees} attendees</span>
              </div> */}
            </div>
          </div>
          <p className="text-muted-foreground mb-4">{event.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              View details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
            
            <div className="flex gap-2">
              
              <Button 
                variant="outline" 
                className="inline-flex items-center"
                onClick={() => handleOpenQRDialog(event)}
              >
                <QrCode className="mr-2 h-4 w-4" />
                View Attendance Page
              </Button>

              <Button 
                variant="outline" 
                className="inline-flex items-center"
                onClick={() => handleOpenFeedbackDialog(event)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {event.hasFeedback ? "View/Edit Feedback" : "Provide Feedback"}
              </Button>

              {event.status === "past" && (
                <div className="inline-flex items-center text-muted-foreground text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Event Completed
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  // Function to render the feedback modal
  const renderFeedbackModal = () => {
    if (!feedbackDialogOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setFeedbackDialogOpen(false)}
        />
        <div className="z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={() => setFeedbackDialogOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Event Feedback</h2>
              <p className="text-sm text-muted-foreground">
                Please provide your feedback for this event. Your input helps us improve future events.
              </p>
            </div>

            {selectedEvent && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted rounded-md">
                  <h3 className="font-medium">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEvent.date} • {selectedEvent.start_time} - {selectedEvent.end_time}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating" className="font-medium">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback" className="font-medium">Comments</Label>
                  <textarea
                    id="feedback"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    placeholder="Share your thoughts about this event..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitFeedback} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
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

      {/* Feedback Modal */}
      {renderFeedbackModal()}
    </div>
  )
}

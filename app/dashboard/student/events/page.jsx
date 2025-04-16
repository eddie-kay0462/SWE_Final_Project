"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, ChevronRight, CheckCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

export default function EventsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for events
  const upcomingEvents = [
    {
      id: 1,
      title: "Career Fair - Spring 2025",
      date: "March 15, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "University Center, Main Hall",
      attendees: 123,
      description: "Our biggest career fair of the year with over 50 companies from various industries looking to recruit students for internships and full-time positions.",
      tags: ["All Students", "Job Fair"],
      status: "upcoming",
      feedbackStatus: "inactive" // Before event
    },
    {
      id: 2,
      title: "Resume Workshop",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      time: "2:00 PM - 4:00 PM",
      location: "Career Center, Room 202",
      attendees: 45,
      description: "Learn how to create an effective resume that highlights your skills and experiences in the best way possible.",
      tags: ["Workshop", "Career Development"],
      status: "upcoming",
      feedbackStatus: "active" // During event (today)
    },
    {
      id: 3,
      title: "Interview Skills Session",
      date: "March 5, 2025",
      time: "1:00 PM - 3:00 PM",
      location: "Online (Zoom)",
      attendees: 67,
      description: "Practice answering common interview questions and receive feedback from career advisors to improve your interviewing skills.",
      tags: ["Workshop", "Virtual"],
      status: "upcoming",
      feedbackStatus: "inactive"
    },
  ]

  const pastEvents = [
    {
      id: 5,
      title: "Fall Career Fair 2024",
      date: "October 15, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "University Center, Main Hall",
      attendees: 210,
      description: "Our annual fall career fair featuring over 40 companies from various industries.",
      tags: ["All Students", "Job Fair"],
      status: "past",
      feedbackStatus: "off" // After event, feedback period closed
    },
    {
      id: 6,
      title: "LinkedIn Profile Workshop",
      date: "November 5, 2024",
      time: "3:00 PM - 5:00 PM",
      location: "Career Center, Room 202",
      attendees: 52,
      description: "Learn how to optimize your LinkedIn profile to attract recruiters and showcase your professional brand.",
      tags: ["Workshop", "Career Development"],
      status: "past",
      feedbackStatus: "off"
    },
    {
      id: 7,
      title: "Industry Insights: Technology",
      date: "February 20, 2025",
      time: "4:00 PM - 6:00 PM",
      location: "Tech Building, Auditorium",
      attendees: 89,
      description: "Panel discussion with industry leaders about current trends and career opportunities in the technology sector.",
      tags: ["Panel", "Industry Specific"],
      status: "past",
      feedbackStatus: "active" // Recent event, feedback still open
    }
  ]

  const handleOpenFeedbackDialog = (event) => {
    setSelectedEvent(event)
    setFeedbackDialogOpen(true)
  }

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating for this event.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setFeedbackDialogOpen(false)
      setFeedbackText("")
      setRating(0)

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback on this event.",
      })
    }, 1000)
  }

  // Function to render event cards
  const renderEventCards = (events) => {
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
                <span>{event.time}</span>
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
            
            {event.status === "upcoming" && event.feedbackStatus !== "active" && (
              <Button>RSVP Now</Button>
            )}
            
            {event.feedbackStatus === "active" && (
              <Button 
                variant="outline" 
                className="inline-flex items-center"
                onClick={() => handleOpenFeedbackDialog(event)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Provide Feedback
              </Button>
            )}
            
            {event.status === "past" && event.feedbackStatus === "off" && (
              <div className="inline-flex items-center text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Event Completed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    ))
  }

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

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Feedback</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-md">
                <h3 className="font-medium">{selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedEvent.date} • {selectedEvent.time}</p>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

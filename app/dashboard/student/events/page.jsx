"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, ChevronRight, FileText, CheckCircle } from 'lucide-react'

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")

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
      tags: ["All Students", "Job Fair"]
    },
    {
      id: 2,
      title: "Resume Workshop",
      date: "February 28, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Career Center, Room 202",
      attendees: 45,
      description: "Learn how to create an effective resume that highlights your skills and experiences in the best way possible.",
      tags: ["Workshop", "Career Development"]
    },
    {
      id: 3,
      title: "Interview Skills Session",
      date: "March 5, 2025",
      time: "1:00 PM - 3:00 PM",
      location: "Online (Zoom)",
      attendees: 67,
      description: "Practice answering common interview questions and receive feedback from career advisors to improve your interviewing skills.",
      tags: ["Workshop", "Virtual"]
    },
    {
      id: 4,
      title: "Networking 101",
      date: "March 10, 2025",
      time: "5:00 PM - 7:00 PM",
      location: "Student Center, Meeting Room A",
      attendees: 38,
      description: "Learn effective networking strategies and how to build professional relationships that can help advance your career.",
      tags: ["Workshop", "Professional Development"]
    }
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
      tags: ["All Students", "Job Fair"]
    },
    {
      id: 6,
      title: "LinkedIn Profile Workshop",
      date: "November 5, 2024",
      time: "3:00 PM - 5:00 PM",
      location: "Career Center, Room 202",
      attendees: 52,
      description: "Learn how to optimize your LinkedIn profile to attract recruiters and showcase your professional brand.",
      tags: ["Workshop", "Career Development"]
    },
    {
      id: 7,
      title: "Industry Insights: Technology",
      date: "November 20, 2024",
      time: "4:00 PM - 6:00 PM",
      location: "Tech Building, Auditorium",
      attendees: 89,
      description: "Panel discussion with industry leaders about current trends and career opportunities in the technology sector.",
      tags: ["Panel", "Industry Specific"]
    }
  ]

  // Function to render event cards
  const renderEventCards = (events) => {
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
                <span>{event.time}</span>
              </div>
              <div className="flex items-center text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location}</span>
              </div>
            </div>
            {/* <div className="mt-4 md:mt-0">
              <div className="flex items-center text-sm text-primary-foreground bg-primary px-3 py-1 rounded-full">
                <Users className="h-3 w-3 mr-1" />
                <span>{event.attendees} attending</span>
              </div>
            </div> */}
          </div>
          <p className="text-muted-foreground mb-4">{event.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-accent rounded-full">
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
            {activeTab === "upcoming" && (
              <button className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                You can make this the QR code button
              </button>
            )}
            {activeTab === "past" && (
              <div className="inline-flex items-center text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Event Completed
              </div>
            )}
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-background pt-6 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Events & Workshops</h1>
            <p className="text-muted-foreground">Discover career development events and opportunities</p>
          </div>
          {/* <div className="mt-4 md:mt-0">
            <Link
              href=""
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Calendar className="mr-2 h-4 w-4" />
              My Calendar
            </Link>
          </div> */}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "upcoming"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "past"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Event List */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === "upcoming" ? renderEventCards(upcomingEvents) : renderEventCards(pastEvents)}
        </div>

      </div>
    </div>
  )
}
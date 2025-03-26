"use client"

import { useState } from "react"
import { Calendar, Award, Clock, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

// test data
const eventsAttended = [
  {
    id: 1,
    name: "Resume Workshop",
    date: "2023-10-15",
    type: "Workshop",
  },
  {
    id: 2,
    name: "Career Fair",
    date: "2023-11-05",
    type: "Fair",
  },
  {
    id: 3,
    name: "Mock Interview Session",
    date: "2023-12-10",
    type: "Workshop",
  },
  {
    id: 4,
    name: "Networking Event with Tech Companies",
    date: "2024-01-20",
    type: "Networking",
  },
]

// total required events
const totalRequiredEvents = 10

export default function ProgressTracker() {
  const [modalOpen, setModalOpen] = useState(false)

  const progress = (eventsAttended.length / totalRequiredEvents) * 100

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="animate-appear">
      <h2 className="text-2xl font-bold mb-6">Event Progress</h2>

      <div className="border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Event Attendance</h3>
              <p className="text-sm text-muted-foreground">
                {eventsAttended.length} of {totalRequiredEvents} required events attended
              </p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)}>View Details</Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} max={100} />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-md">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Next Required Event</p>
              <p className="text-xs text-muted-foreground">Career Development Workshop</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-md">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Remaining Time</p>
              <p className="text-xs text-muted-foreground">6 months to complete requirements</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Event Attendance Details</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setModalOpen(false)} />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Events Attended ({eventsAttended.length}/{totalRequiredEvents})
              </h3>
              <Badge variant="secondary">{Math.round(progress)}% Complete</Badge>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Event Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {eventsAttended.map((event) => (
                    <tr key={event.id}>
                      <td className="px-4 py-3 text-sm">{event.name}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(event.date)}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="outline">{event.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Upcoming Required Events</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Career Development Workshop</p>
                    <p className="text-sm text-muted-foreground">March 15, 2024</p>
                  </div>
                  <Badge>Required</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Spring Career Fair</p>
                    <p className="text-sm text-muted-foreground">April 10, 2024</p>
                  </div>
                  <Badge>Required</Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


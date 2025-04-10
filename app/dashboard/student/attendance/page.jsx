"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Calendar, MapPin, Clock, QrCode } from "lucide-react"
import { toast } from "sonner"

// Mock data for demonstration
const mockEvents = [
  {
    id: "event-session-001",
    title: "Getting an Internship",
    date: "2025-03-04",
    time: "17:00",
    location: "Career Center",
    status: "upcoming"
  },
  {
    id: "event-session-002",
    title: "Resume Workshop",
    date: "2025-03-06",
    time: "14:00",
    location: "Online",
    status: "upcoming"
  }
]

export default function AttendancePage() {
  const [events] = useState(mockEvents)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)

  const generateQRCode = async (event) => {
    try {
      // In a real implementation, this would be done on the server
      const studentId = "12342024" // This would come from the user's session
      const uniqueString = `${studentId}-${event.id}-${event.date} ${event.time}`
      
      // Hash the unique string
      const encoder = new TextEncoder()
      const data = encoder.encode(uniqueString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      // Create the check-in URL
      const checkInUrl = `${window.location.origin}/checkin?student_id=${hashHex}&session_id=${event.id}&timestamp=${event.date} ${event.time}`
      
      setQrCodeData(checkInUrl)
      setSelectedEvent(event)
      setShowQRCode(true)
      
      toast.success("QR code generated successfully!")
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event Attendance</h1>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date} • {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                </div>
                <button
                  onClick={() => generateQRCode(event)}
                  className="bg-[#A91827] px-3 py-1 rounded text-xs font-medium text-white flex items-center"
                >
                  <QrCode className="h-4 w-4 mr-1" />
                  Generate QR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && selectedEvent && qrCodeData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Event Check-in QR Code</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={qrCodeData}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Show this QR code to the event organizer to check in
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Valid for: {selectedEvent.title}
              </p>
              <button
                onClick={() => {
                  setShowQRCode(false)
                  setQrCodeData(null)
                  setSelectedEvent(null)
                }}
                className="mt-4 px-4 py-2 bg-[#A91827] text-white rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
"use client"

import { useState, useEffect, useRef } from "react"
import { QrCode, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    // Initialize QR scanner
    const initScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        toast.error("Failed to access camera")
      }
    }

    initScanner()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleScan = async (result) => {
    if (result && !loading) {
      setLoading(true)
      try {
        const response = await fetch("/api/checkin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: result.student_id,
            session_id: result.session_id,
            timestamp: result.timestamp
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setScanResult({ success: true, message: "Check-in successful!" })
          toast.success("Student checked in successfully")
        } else {
          setScanResult({ success: false, message: data.error })
          toast.error(data.error)
        }
      } catch (error) {
        console.error("Error processing check-in:", error)
        setScanResult({ success: false, message: "Failed to process check-in" })
        toast.error("Failed to process check-in")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square max-w-md mx-auto">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-lg"
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 border-4 border-[#A91827] rounded-lg" />
      </div>

      {scanResult && (
        <div className={`p-4 rounded-lg ${
          scanResult.success ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"
        }`}>
          <div className="flex items-center gap-2">
            {scanResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <p className={scanResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {scanResult.message}
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Position the QR code within the frame to scan
        </p>
      </div>
    </div>
  )
} 
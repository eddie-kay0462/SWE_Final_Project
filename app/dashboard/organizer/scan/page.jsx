"use client"

import QRScanner from "@/components/qr-scanner"
import { QrCode } from "lucide-react"

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <QrCode className="h-6 w-6 text-[#A91827]" />
        <h1 className="text-2xl font-bold">Scan QR Code</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <QRScanner />
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Scan student QR codes to record attendance for your event.</p>
        <p className="mt-1">Make sure the QR code is clearly visible within the frame.</p>
      </div>
    </div>
  )
} 
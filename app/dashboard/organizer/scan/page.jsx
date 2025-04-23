"use client"

import { QRScanner } from "@/components/qr-scanner"
import { QrCode } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const router = useRouter();

  const handleScan = (result) => {
    if (result) {
      toast.success('QR Code scanned successfully!');
      // Handle the scanned result here
      console.log('Scanned result:', result);
      
      try {
        const url = new URL(result);
        router.push(url.pathname);
      } catch (e) {
        console.log('Scanned content is not a URL:', result);
        toast.error('Invalid QR code format');
      }
    }
  };

  const handleError = (error) => {
    toast.error(error || 'Failed to scan QR code');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <QrCode className="h-6 w-6 text-[#A91827]" />
        <h1 className="text-2xl font-bold">Scan QR Code</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <QRScanner 
          onScan={handleScan}
          onError={handleError}
          showScannerByDefault={true}
        />
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Scan student QR codes to record attendance for your event.</p>
        <p className="mt-1">Make sure the QR code is clearly visible within the frame.</p>
      </div>
    </div>
  )
} 
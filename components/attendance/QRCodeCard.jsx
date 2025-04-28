"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users } from 'lucide-react';
import { format } from 'date-fns';

export function QRCodeCard({ eventId, title, date, startTime, endTime, location }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);

  useEffect(() => {
    generateQRCode();
  }, [eventId]);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate event-specific QR code
      const response = await fetch(`/api/dashboard/admin/events/${eventId}/qr`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate attendance QR code');
      }

      // Generate QR code from the token URL
      const qrDataUrl = await QRCode.toDataURL(data.qrUrl, {
        width: 1080,
        height: 1080,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      setQrCodeUrl(qrDataUrl);
      setExpiryDate(new Date(data.expiresAt));
    } catch (err) {
      console.error('Attendance QR Code generation failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1400;

    // Set background color
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add event title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width/2, 100);

    // Add event details
    ctx.font = '36px system-ui';
    ctx.fillText(
      `${format(new Date(date), 'MMMM d, yyyy')}`,
      canvas.width/2, 180
    );
    ctx.fillText(
      `${startTime} - ${endTime}`,
      canvas.width/2, 230
    );
    ctx.fillText(location, canvas.width/2, 280);

    // Add attendance info
    ctx.font = 'bold 48px system-ui';
    ctx.fillStyle = '#A91827';
    ctx.fillText('Event Attendance', canvas.width/2, 360);

    // Add expiry info
    if (expiryDate) {
      ctx.font = '32px system-ui';
      ctx.fillStyle = '#71717a';
      ctx.fillText(
        `QR Code expires: ${format(expiryDate, 'h:mm a')}`,
        canvas.width/2, 420
      );
    }

    // Load and draw QR code
    const qrImage = new Image();
    qrImage.src = qrCodeUrl;
    await new Promise((resolve) => {
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 140, 480, 800, 800);
        resolve();
      };
    });

    // Download the image
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-attendance-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={generateQRCode}>Try Again</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="text-center space-y-4 mb-6">
        <div className="flex items-center justify-center gap-2 text-[#A91827]">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-bold">Event Attendance</h2>
        </div>
        <div className="space-y-1 text-muted-foreground">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p>{format(new Date(date), 'MMMM d, yyyy')}</p>
          <p>{startTime} - {endTime}</p>
          <p>{location}</p>
        </div>
        {expiryDate && (
          <div className="text-sm text-muted-foreground">
            QR Code expires at {format(expiryDate, 'h:mm a')}
          </div>
        )}
      </div>

      <motion.div 
        className="aspect-square bg-white rounded-lg p-4 mb-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: isLoading ? 0.5 : 1,
          scale: isLoading ? 0.9 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
          </div>
        ) : (
          qrCodeUrl && (
            <img 
              src={qrCodeUrl} 
              alt="Event Attendance QR Code"
              className="w-full h-full object-contain"
            />
          )
        )}
      </motion.div>

      <Button 
        onClick={downloadQRImage}
        className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white"
        disabled={isLoading || !qrCodeUrl}
      >
        <Download className="w-4 h-4 mr-2" />
        Download Attendance QR
      </Button>
    </Card>
  );
} 
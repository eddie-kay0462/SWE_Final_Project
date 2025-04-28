"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from 'lucide-react';

export default function CheckInPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    // If no token is provided, show error
    if (!token) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token || !studentId) {
      toast({
        title: "Error",
        description: "Please provide your student ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          studentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record attendance');
      }

      setCheckInStatus('success');
      setEventDetails(data.eventDetails);
      toast({
        title: "Success!",
        description: "Your attendance has been recorded.",
      });
    } catch (error) {
      console.error('Check-in error:', error);
      setCheckInStatus('error');
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid QR Code</h1>
          <p className="text-muted-foreground">
            This QR code is invalid or has expired. Please obtain a new QR code from your event organizer.
          </p>
        </Card>
      </div>
    );
  }

  if (checkInStatus === 'success' && eventDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Check-in Successful!</h1>
            <div className="space-y-2 mb-6">
              <h2 className="text-xl">{eventDetails.title}</h2>
              <p className="text-muted-foreground">{eventDetails.location}</p>
              <p className="text-muted-foreground">
                {new Date(eventDetails.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-muted-foreground">
                {eventDetails.start_time} - {eventDetails.end_time}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your attendance has been recorded. You can close this window.
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Event Check-in</h1>
            <p className="text-muted-foreground">
              Please enter your student ID to confirm your attendance.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="studentId" className="text-sm font-medium">
                Student ID
              </label>
              <Input
                id="studentId"
                type="text"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !studentId}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Checking in...</span>
                </div>
              ) : (
                'Check In'
              )}
            </Button>
          </div>

          {checkInStatus === 'error' && (
            <div className="text-center text-sm text-destructive">
              Failed to record attendance. Please try again.
            </div>
          )}
        </form>
      </Card>
    </div>
  );
} 
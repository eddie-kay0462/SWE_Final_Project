"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Calendar, Clock, MapPin } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import Confetti from 'react-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function TakeAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchEventDetails();
  }, [params.session_id]);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    setUser(user);
  };

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/details/${params.session_id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch event details");
      }

      setEventDetails(data);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      toast.error("Please enter your student ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: studentId.trim(),
          sessionId: params.session_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to record attendance");
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast.error(error.message || "Failed to record attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchEventDetails}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-50 to-gray-100/50">
      {showSuccess && <Confetti />}
      
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Event Check-in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your student ID to record your attendance
            </p>
          </div>

          {eventDetails && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h2 className="font-semibold text-lg mb-3">{eventDetails.title}</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#A91827]" />
                    <span>{eventDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#A91827]" />
                    <span>{eventDetails.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#A91827]" />
                    <span>{eventDetails.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#A91827]" />
                    <span>{eventDetails.attendees} attendees</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter your student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="h-11 rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white h-11 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/60 border-t-white mr-2" />
                      Recording Attendance...
                    </>
                  ) : (
                    "Check In"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#A91827]">
              Success! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              Attendance recorded for {eventDetails?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center mt-4">
            <Button
              onClick={() => router.push('/dashboard/student/')}
              className="bg-[#A91827] hover:bg-[#A91827]/90 text-white"
            >
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
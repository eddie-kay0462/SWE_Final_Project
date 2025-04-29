"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeCard } from "@/components/attendance/QRCodeCard";
import { Users, Search, Download, QrCode, Link } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EventAttendancePage() {
  const params = useParams();
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [params.session_id]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/admin/events/${params.session_id}/attendance`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch attendance data");
      }

      // Format the date in the event data
      if (data.event) {
        const eventDate = new Date(data.event.date);
        data.event.date = format(eventDate, "d MMM yyyy");
      }

      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = attendanceData?.records.filter((record) =>
    record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadAttendanceCSV = () => {
    if (!attendanceData) return;

    const headers = ["Student Name", "Student ID", "Email", "Check-in Time", "Check-in Date"];
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map((record) =>
        [
          record.studentName,
          record.studentId,
          record.email,
          record.checkedInAt,
          record.checkedInDate
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${attendanceData.event.title}-attendance.csv`;
    link.click();
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAttendanceData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Attendance</h1>
          <p className="text-base text-muted-foreground mt-1">
            Track and manage attendance for this event
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowQRCode(!showQRCode)}
            className="bg-[#A91827] hover:bg-[#A91827]/90 text-white"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {showQRCode ? "Hide QR Code" : "Show QR Code"}
          </Button>
          <Button
            onClick={() => {
              const attendanceUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://csoft-vert.vercel.app/'}/take-attendance/${params.session_id}`;
              navigator.clipboard.writeText(attendanceUrl);
              toast.success("URL copied to clipboard", {
                description: "The attendance URL has been copied to your clipboard"
              });
            }}
            variant="outline"
            className="border-muted-foreground/20"
          >
            <Link className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
          <Button
            onClick={downloadAttendanceCSV}
            variant="outline"
            className="border-muted-foreground/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className={showQRCode ? "lg:col-span-2" : "lg:col-span-3"}>
          {/* Event Details Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#A91827]/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-[#A91827]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{attendanceData.event.title}</h2>
                <div className="text-sm text-muted-foreground">
                  <p>{attendanceData.event.date}</p>
                  <p>{attendanceData.event.time}</p>
                  <p>{attendanceData.event.location}</p>
                </div>
              </div>
              <div className="ml-auto text-center">
                <p className="text-2xl font-bold">{attendanceData.attendanceCount}</p>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
              </div>
            </div>
          </Card>

          {/* Search and Table */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <Card>
              <div className="relative max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Check-in Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords?.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.studentName}
                          </TableCell>
                          <TableCell>{record.studentId}</TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>{record.checkedInAt}</TableCell>
                          <TableCell>{record.checkedInDate}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>

        {/* QR Code Section */}
        {showQRCode && (
          <div className="lg:col-span-1">
            <QRCodeCard
              eventId={params.session_id}
              title={attendanceData.event.title}
              date={attendanceData.event.date}
              startTime={attendanceData.event.time.split(" - ")[0]}
              endTime={attendanceData.event.time.split(" - ")[1]}
              location={attendanceData.event.location}
            />
          </div>
        )}
      </div>
    </div>
  );
}
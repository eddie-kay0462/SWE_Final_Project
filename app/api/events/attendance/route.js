import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const { studentId, token } = await req.json();

    if (!studentId || !token) {
      return NextResponse.json(
        { error: "Student ID and token are required" },
        { status: 400 }
      );
    }

    // First, get the event ID using the token
    const event = await db.query(
      "SELECT id FROM events WHERE qr_token = ?",
      [token]
    );

    if (!event || event.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const eventId = event[0].id;

    // Check if student exists
    const student = await db.query(
      "SELECT id FROM students WHERE student_id = ?",
      [studentId]
    );

    if (!student || student.length === 0) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 }
      );
    }

    // Check if student has already checked in
    const existingAttendance = await db.query(
      "SELECT id FROM attendance WHERE event_id = ? AND student_id = ?",
      [eventId, studentId]
    );

    if (existingAttendance && existingAttendance.length > 0) {
      return NextResponse.json(
        { error: "You have already checked in for this event" },
        { status: 400 }
      );
    }

    // Record attendance
    await db.query(
      "INSERT INTO attendance (event_id, student_id, check_in_time) VALUES (?, ?, NOW())",
      [eventId, studentId]
    );

    return NextResponse.json({
      message: "Attendance recorded successfully"
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
} 
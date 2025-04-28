import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET handler for retrieving event details from a QR code token
 * 
 * @param {Request} request - The incoming request object
 * @param {object} params - The route parameters containing the token
 * @returns {Promise<NextResponse>} JSON response with event details
 */
export async function GET(req, { params }) {
  try {
    const { token } = params;

    // Query the database to get event details
    const event = await db.query(
      `SELECT 
        e.id,
        e.title,
        e.date,
        e.time,
        e.location,
        e.description,
        COUNT(DISTINCT a.student_id) as attendees
      FROM events e
      LEFT JOIN attendance a ON e.id = a.event_id
      WHERE e.qr_token = ?
      GROUP BY e.id`,
      [token]
    );

    if (!event || event.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Format the date and time for display
    const eventData = {
      ...event[0],
      date: new Date(event[0].date).toLocaleDateString(),
      time: event[0].time,
    };

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
} 
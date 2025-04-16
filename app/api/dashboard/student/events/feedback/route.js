import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST handler for submitting event feedback
 * 
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or failure
 */
export async function POST(request) {
  try {
    const { eventId, rating, feedback } = await request.json();

    if (!eventId || !rating) {
      return NextResponse.json(
        { error: 'Event ID and rating are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert feedback into the database
    const { error } = await supabase
      .from('event_feedback')
      .insert([
        {
          event_id: eventId,
          rating,
          feedback_text: feedback || '',
          submitted_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error('Error submitting feedback:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Feedback submitted successfully' });

  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
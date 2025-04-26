import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * POST handler for submitting event feedback
 * 
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with success/error message
 *
 * Note: event_feedback table should have a unique constraint on (event_id, user_id)
 */
export async function POST(request) {
  try {
    // Create a Supabase client
    const supabase = await createClient();
    
    // Get the current user from the session
    const cookieStore = cookies();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const { eventId, rating, comments } = await request.json();
    
    if (!eventId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid feedback data. Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }
    
    // Upsert the feedback into the database (update if exists, insert if not)
    const { data, error } = await supabase
      .from('event_feedback')
      .upsert({
        event_id: eventId,
        user_id: user.id,
        rating: rating,
        comments: comments || null,
        submitted_at: new Date().toISOString()
      }, { onConflict: ['event_id', 'user_id'] })
      .select();
    
    if (error) {
      console.error('Error submitting feedback:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
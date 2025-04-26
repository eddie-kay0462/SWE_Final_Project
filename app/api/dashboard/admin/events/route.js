import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET handler for fetching events from the database for admin view
 * 
 * @returns {Promise<NextResponse>} JSON response with events data
 */
export async function GET() {
  try {
    // Create a Supabase client
    const supabase = await createClient();
    
    // Get the current user from the session
    const cookieStore = cookies();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get the current date to determine upcoming vs past events
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch upcoming events (date >= today)
    const { data: upcomingEvents, error: upcomingError } = await supabase
      .from('career_sessions')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });
    
    if (upcomingError) {
      console.error('Error fetching upcoming events:', upcomingError);
      return NextResponse.json(
        { error: 'Failed to fetch upcoming events' },
        { status: 500 }
      );
    }
    
    // Fetch past events (date < today)
    const { data: pastEvents, error: pastError } = await supabase
      .from('career_sessions')
      .select('*')
      .lt('date', today)
      .order('date', { ascending: false });
    
    if (pastError) {
      console.error('Error fetching past events:', pastError);
      return NextResponse.json(
        { error: 'Failed to fetch past events' },
        { status: 500 }
      );
    }
    
    // Fetch all feedback for these events, including student names
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('event_feedback')
      .select('event_id, rating, comments, user_id, users(fname, lname)');
    
    // Create a map of event_id to feedback array
    let eventFeedback = {};
    if (!feedbackError && feedbackData) {
      eventFeedback = feedbackData.reduce((acc, feedback) => {
        if (!acc[feedback.event_id]) {
          acc[feedback.event_id] = [];
        }
        acc[feedback.event_id].push({
          rating: feedback.rating,
          comments: feedback.comments,
          user_id: feedback.user_id,
          fname: feedback.users?.fname || '',
          lname: feedback.users?.lname || ''
        });
        return acc;
      }, {});
    }
    
    // Format the events data to match the expected structure
    const formatEvents = (events) => {
      return events.map(event => {
        const feedback = eventFeedback[event.session_id] || [];
        const averageRating = feedback.length > 0 
          ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1) 
          : 0;
        
        return {
          id: event.session_id,
          title: event.title || 'Career Session',
          date: new Date(event.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          time: '10:00 AM - 4:00 PM', // Default time since it's not in the DB
          location: 'University Center, Main Hall', // Default location since it's not in the DB
          attendees: Math.floor(Math.random() * 100) + 50, // Random number for demo
          description: event.description,
          tags: ['Career Development'],
          status: event.date >= today ? 'upcoming' : 'past',
          feedbackCount: feedback.length,
          averageRating: parseFloat(averageRating),
          feedback: feedback
        };
      });
    };
    
    return NextResponse.json({
      upcomingEvents: formatEvents(upcomingEvents || []),
      pastEvents: formatEvents(pastEvents || [])
    });
    
  } catch (error) {
    console.error('Error in admin events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

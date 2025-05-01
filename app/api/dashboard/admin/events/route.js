import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';


/**
 * Generates a random 6-digit code for session IDs
 * 
 * @returns {string} A 6-digit numeric code
 */
function generateSessionId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Checks if a session ID already exists in the database
 * 
 * @param {object} supabase - Supabase client instance
 * @param {string} sessionId - Session ID to check
 * @returns {Promise<boolean>} True if session ID exists, false otherwise
 */
async function isSessionIdTaken(supabase, sessionId) {
  const { data, error } = await supabase
    .from('career_sessions')
    .select('session_id')
    .eq('session_id', sessionId)
    .single();
  
  return !error && data !== null;
}

/**
 * Generates a unique session ID that doesn't exist in the database
 * 
 * @param {object} supabase - Supabase client instance
 * @returns {Promise<string>} A unique 6-digit session ID
 */
async function generateUniqueSessionId(supabase) {
  let sessionId;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    sessionId = generateSessionId();
    const isTaken = await isSessionIdTaken(supabase, sessionId);
    if (!isTaken) return sessionId;
    attempts++;
  } while (attempts < maxAttempts);

  throw new Error('Unable to generate unique session ID after multiple attempts');
}

/**
 * Verifies if a user exists in both auth.users and public.users tables
 * 
 * @param {object} supabase - Supabase client instance
 * @param {object} authUser - The authenticated user object
 * @returns {Promise<string|null>} Returns the public user ID if found, null otherwise
 */
async function verifyUserInBothTables(supabase, authUser) {
  if (!authUser || !authUser.email) {
    return null;
  }

  // Check if the user exists in public.users table
  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .select('id')
    .eq('email', authUser.email)
    .single();

  if (publicUserError || !publicUser) {
    console.error('User not found in public.users table:', publicUserError);
    return null;
  }

  return publicUser.id;
}

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

    // Fetch attendance counts for all events
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('session_id, count:id')
      .throwOnError();

    if (attendanceError) {
      console.error('Error fetching attendance data:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance data' },
        { status: 500 }
      );
    }

    // Create a map of event_id to attendance count
    const attendanceCounts = {};
    if (attendanceData) {
      attendanceData.forEach(record => {
        if (!attendanceCounts[record.session_id]) {
          attendanceCounts[record.session_id] = 0;
        }
        attendanceCounts[record.session_id]++;
      });
    }
    
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
    const formatEvents = async (events) => {
      const formattedEvents = await Promise.all(events.map(async event => {
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
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location || 'Location not specified',
          attendees: attendanceCounts[event.session_id] || 0,
          description: event.description,
          tags: ['Career Development'],
          status: event.date >= today ? 'upcoming' : 'past',
          feedbackCount: feedback.length,
          averageRating: parseFloat(averageRating),
          feedback: feedback,
          qrCode: event.qr_code
        };
      }));
      
      return formattedEvents;
    };
    
    const formattedUpcoming = await formatEvents(upcomingEvents || []);
    const formattedPast = await formatEvents(pastEvents || []);
    
    return NextResponse.json({
      upcomingEvents: formattedUpcoming,
      pastEvents: formattedPast
    });
    
  } catch (error) {
    console.error('Error in admin events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new event
 * 
 * @returns {Promise<NextResponse>} JSON response with the created event data
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the public user ID using the auth email
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (publicUserError || !publicUser) {
      console.error('Error getting public user:', publicUserError);
      return NextResponse.json(
        { error: 'User not found in public.users table' },
        { status: 404 }
      );
    }

    // Get the request body
    const eventData = await request.json();

    // Generate a unique session ID
    const sessionId = await generateUniqueSessionId(supabase);

    // Generate a QR code token (you can customize this as needed)
    const qrCodeToken = `${sessionId}-${Date.now()}`;

    // Insert the new event using the public user ID
    const { data: newEvent, error: insertError } = await supabase
      .from('career_sessions')
      .insert([
        {
          session_id: sessionId,
          title: eventData.title,
          date: eventData.date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          description: eventData.description,
          created_by: publicUser.id, // Use the public user ID here
          qr_code: qrCodeToken
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating event:', insertError);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    // Create an entry in the event_qr_codes table
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // QR code expires in 24 hours

    const { error: qrError } = await supabase
      .from('event_qr_codes')
      .insert([
        {
          event_id: sessionId,
          token: qrCodeToken,
          expires_at: expiryDate.toISOString()
        }
      ]);

    if (qrError) {
      console.error('Error creating QR code entry:', qrError);
      // Don't fail the request, just log the error
    }

    // Format the response
    const formattedEvent = {
      id: newEvent.session_id,
      title: newEvent.title,
      date: new Date(newEvent.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      start_time: newEvent.start_time,
      end_time: newEvent.end_time,
      location: newEvent.location,
      description: newEvent.description,
      attendees: 0,
      tags: ['Career Development'],
      status: 'upcoming',
      feedbackCount: 0,
      averageRating: 0,
      feedback: [],
      qrCode: qrCodeToken
    };

    return NextResponse.json(formattedEvent);

  } catch (error) {
    console.error('Error in create event API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ... rest of the code remains the same ...

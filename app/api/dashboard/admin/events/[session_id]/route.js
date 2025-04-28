import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET handler for fetching a single event
 */
export async function GET(request, context) {
  try {
    const supabase = await createClient();
    const { session_id } = await context.params;

    const { data: event, error } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing an event
 */
export async function DELETE(request, context) {
  try {
    const supabase = await createClient();
    const { session_id } = await context.params;

    // First verify the event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete the event
    const { error: deleteError } = await supabase
      .from('career_sessions')
      .delete()
      .eq('session_id', session_id);

    if (deleteError) {
      console.error('Error deleting event:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating an event
 */
export async function PUT(request, context) {
  try {
    const supabase = await createClient();
    const { session_id } = await context.params;

    // Get the current user
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    const { title, date, start_time, end_time, location, description } = body;
    
    if (!title || !date || !start_time || !end_time || !location || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First verify the event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update the event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('career_sessions')
      .update({
        title,
        date,
        start_time,
        end_time,
        location,
        description
      })
      .eq('session_id', session_id)
      .select()
      .single();

    if (updateError) {
      console.error('[AdminEvents] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    // Format the response data
    const formattedEvent = {
      id: updatedEvent.session_id,
      title: updatedEvent.title,
      date: new Date(updatedEvent.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      start_time: updatedEvent.start_time,
      end_time: updatedEvent.end_time,
      location: updatedEvent.location,
      description: updatedEvent.description,
      status: new Date(updatedEvent.date) >= new Date() ? 'upcoming' : 'past',
      attendees: Math.floor(Math.random() * 100) + 50, // Random number for demo
      tags: ['Career Development']
    };

    return NextResponse.json({
      success: true,
      event: formattedEvent
    });

  } catch (error) {
    console.error('[AdminEvents] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
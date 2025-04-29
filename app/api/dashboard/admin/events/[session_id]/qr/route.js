import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET handler for generating event-wide QR code data
 * 
 * @param {Request} request - The incoming request object
 * @param {object} context - The context object containing params
 * @returns {Promise<NextResponse>} JSON response with QR code data
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const sessionId = params.session_id;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get the event details
    const { data: event, error: eventError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Return the QR code data with the attendance URL
    return NextResponse.json({
      qrUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://csoft-vert.vercel.app/'}/take-attendance/${sessionId}`,
      expiresAt: new Date(event.date + ' ' + event.end_time).toISOString()
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for generating event QR code
 * 
 * @param {Request} request - The incoming request object
 * @param {object} context - The context object containing params
 * @returns {Promise<NextResponse>} JSON response with QR code data
 */
export async function POST(request, context) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const sessionId = context.params.session_id;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get the event details to verify it exists
    const { data: event, error: eventError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Generate the QR code URL that will be used for attendance
    const qrUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://csoft-vert.vercel.app/'}/take-attendance/${sessionId}`;

    return NextResponse.json({
      qrUrl,
      expiresAt: new Date(event.date + ' ' + event.end_time).toISOString()
    });

  } catch (error) {
    console.error('Error in QR code generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
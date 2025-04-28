import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Generates a secure hash for event-wide attendance
 * 
 * @param {string} eventId - The event's ID
 * @returns {string} The hashed token
 */
function generateEventToken(eventId) {
  return crypto
    .createHash('sha256')
    .update(`event-${eventId}-attendance`)
    .digest('hex')
    .slice(0, 16); // Take first 16 characters for a cleaner URL
}

/**
 * GET handler for generating event-wide QR code data
 * 
 * @param {Request} request - The incoming request object
 * @param {object} context - The context object containing params
 * @returns {Promise<NextResponse>} JSON response with QR code data
 */
export async function GET(request, { params }) {
  try {
    // Create a Supabase client
    const supabase = await createClient();
    
    // Get the current user from the session
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

    // Generate or retrieve the event token
    const { data: existingQR, error: qrError } = await supabase
      .from('event_qr_codes')
      .select('token')
      .eq('event_id', sessionId)
      .single();

    let token;
    if (existingQR) {
      token = existingQR.token;
    } else {
      token = generateEventToken(sessionId);
      
      // Store the token
      const { error: storeError } = await supabase
        .from('event_qr_codes')
        .insert({
          event_id: sessionId,
          token,
          expires_at: new Date(event.date + ' ' + event.end_time),
          created_at: new Date().toISOString()
        });

      if (storeError) {
        console.error('Error storing token:', storeError);
        return NextResponse.json(
          { error: 'Failed to generate event QR code' },
          { status: 500 }
        );
      }
    }

    // Return the QR code data with the attendance URL
    return NextResponse.json({
      // qrUrl: `https://csoft-vert.vercel.app/take-attendance/${token}`,
      qrUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/take-attendance/${token}`,
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
 * POST handler for generating a new event QR code
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

    // Generate a unique token for the QR code
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiry time to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store the QR code token in the database
    const { data: qrCode, error: qrError } = await supabase
      .from('event_qr_codes')
      .upsert({
        event_id: sessionId,
        token,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'event_id'
      })
      .select()
      .single();

    if (qrError) {
      console.error('Error storing QR code:', qrError);
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      );
    }

    // Generate the QR code URL that will be used for attendance
    const qrUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/take-attendance/${token}`;

    return NextResponse.json({
      qrUrl,
      expiresAt: qrCode.expires_at
    });

  } catch (error) {
    console.error('Error in QR code generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
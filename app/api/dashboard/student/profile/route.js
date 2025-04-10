import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET handler for fetching student profile data.
 * Fetches authenticated user details including student ID.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} A NextResponse object containing the profile data or an error message.
 */
export async function GET(request) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("API Profile GET: Authentication Error:", userError);
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { data: profileData, error: profileDataError } = await supabase
            .from('users')
            .select('fname, lname, email, student_id')
            .eq('email', user.email)
            .single();

        if (profileDataError) {
            console.error(`API Profile GET: Error fetching profile for ${user.email}:`, profileDataError);
            return NextResponse.json({ error: 'Failed to fetch user profile data' }, { status: 500 });
        }

        if (!profileData || !profileData.fname || !profileData.lname || !profileData.email) {
            return NextResponse.json({ error: 'Incomplete user profile data' }, { status: 404 });
        }

        return NextResponse.json(profileData);

    } catch (error) {
        console.error("API Profile GET: Unexpected error:", error);
        return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
    }
}

/**
 * PUT handler for updating student profile data.
 * Updates authenticated user details while preserving the student ID.
 *
 * @param {Request} request - The incoming request object containing profile updates.
 * @returns {Promise<NextResponse>} A NextResponse object confirming the update or an error message.
 */
export async function PUT(request) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("API Profile PUT: Authentication Error:", userError);
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const updates = await request.json();

        // Only allow updating specific fields
        const allowedUpdates = {
            fname: updates.fname,
            lname: updates.lname
        };

        // Validate required fields
        if (!allowedUpdates.fname || !allowedUpdates.lname) {
            return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
        }

        const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update(allowedUpdates)
            .eq('email', user.email)
            .select('fname, lname, email, student_id')
            .single();

        if (updateError) {
            console.error(`API Profile PUT: Error updating profile for ${user.email}:`, updateError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json(updatedData);

    } catch (error) {
        console.error("API Profile PUT: Unexpected error:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid request body format.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
    }
}

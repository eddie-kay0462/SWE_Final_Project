import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET handler for fetching student profile data.
 *
 * Fetches authenticated user details (fname, lname, email, student_id, profilepic).
 * Note: Phone, Major, and Graduation Year are not currently in the database schema.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} A NextResponse object containing the profile data or an error message.
 */
export async function GET(request) {
    const supabase = await createClient();

    try {
        // 1. Get Authenticated User
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("API Profile GET: Authentication Error:", userError);
            return NextResponse.json({ error: userError?.message || 'Authentication required' }, { status: 401 });
        }

        // 2. Fetch User Details from 'users' table using email
        const { data: profileData, error: profileDataError } = await supabase
            .from('users')
            .select('fname, lname, email, student_id, profilepic') // Select available fields
            .eq('email', user.email)
            .single();

        if (profileDataError || !profileData) {
            console.error(`API Profile GET: Error fetching profile for ${user.email}:`, profileDataError);
            return NextResponse.json({ error: 'Failed to fetch user profile data', details: profileDataError?.message }, { status: 500 });
        }

        // TODO: Add fetching for Phone, Major, Graduation Year once DB schema is updated.
        // For now, return only the available data.
        const responseData = {
            ...profileData,
            phone: "+1 (555) 123-4567", // Placeholder
            major: "Computer Science", // Placeholder
            graduationYear: "2025" // Placeholder
        };


        return NextResponse.json(responseData);

    } catch (error) {
        console.error("API Profile GET: Unexpected error:", error);
        return NextResponse.json({ error: 'An unexpected server error occurred.', details: error.message }, { status: 500 });
    }
}

/**
 * PUT handler for updating student profile data.
 *
 * Updates authenticated user details.
 * Note: Currently only updates fields present in the database schema.
 *       Phone, Major, Graduation Year updates will require schema changes.
 *
 * @param {Request} request - The incoming request object containing profile updates.
 * @returns {Promise<NextResponse>} A NextResponse object confirming the update or an error message.
 */
export async function PUT(request) {
    const supabase = await createClient();

    try {
        // 1. Get Authenticated User
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("API Profile PUT: Authentication Error:", userError);
            return NextResponse.json({ error: userError?.message || 'Authentication required' }, { status: 401 });
        }

        // 2. Parse request body
        const updates = await request.json();

        // TODO: Add validation for incoming data (updates)

        // 3. Prepare data for update (only include fields present in the DB)
        const dbUpdates = {};
        // Example: if 'fname' is allowed to be updated
        // if (updates.fname) dbUpdates.fname = updates.fname;
        // Add other updatable fields here based on schema and requirements

        // For now, we are simulating updates for the placeholder fields
        // In a real scenario, you'd update the actual DB fields if they existed
        console.log("API Profile PUT: Received updates (placeholders for now):", updates);

        // Placeholder: Simulate update success without DB interaction for missing fields
        if (Object.keys(dbUpdates).length > 0) {
            // If there were actual DB fields to update:
             const { data: updatedData, error: updateError } = await supabase
                 .from('users')
                 .update(dbUpdates)
                 .eq('email', user.email)
                 .select('fname, lname, email, student_id, profilepic') // Return updated data
                 .single();

             if (updateError) {
                 console.error(`API Profile PUT: Error updating profile for ${user.email}:`, updateError);
                 return NextResponse.json({ error: 'Failed to update profile', details: updateError.message }, { status: 500 });
             }
             return NextResponse.json(updatedData);
        } else {
            // If only placeholder fields were "updated"
            // Fetch current data to return alongside placeholders
             const { data: currentData, error: currentDataError } = await supabase
                .from('users')
                .select('fname, lname, email, student_id, profilepic')
                .eq('email', user.email)
                .single();

             if (currentDataError || !currentData) {
                 return NextResponse.json({ error: 'Failed to fetch current profile data after simulated update' }, { status: 500 });
             }

             // Return current DB data merged with the "updated" placeholder data
             const responseData = {
                 ...currentData,
                 phone: updates.phone ?? currentData.phone, // Use updated placeholder if provided
                 major: updates.major ?? currentData.major,
                 graduationYear: updates.graduationYear ?? currentData.graduationYear
             };
             return NextResponse.json(responseData);
        }

    } catch (error) {
        console.error("API Profile PUT: Unexpected error:", error);
        // Check if the error is due to JSON parsing
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid request body format.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'An unexpected server error occurred.', details: error.message }, { status: 500 });
    }
}

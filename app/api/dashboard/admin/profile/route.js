import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET endpoint for fetching admin profile data
 * 
 * @return {NextResponse} JSON response containing admin profile information
 */
export async function GET() {
    const supabase = await createClient();

    try {
        // Get Authenticated User
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Authentication Error or User not found:", userError);
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch User Details
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('id, fname, lname, email, role_id')
            .eq('email', user.email)
            .single();

        if (userDataError || !userData) {
            console.error(`Error fetching user data by email (${user.email}):`, userDataError);
            return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
        }

        // Verify user is an admin
        if (userData.role_id !== 2) { // Admin role_id is 2 in the test
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        // Return profile data
        return NextResponse.json({
            fname: userData.fname,
            lname: userData.lname,
            email: userData.email,
            id: userData.id
        });

    } catch (error) {
        console.error("Error during profile data fetch:", error);
        return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
    }
} 
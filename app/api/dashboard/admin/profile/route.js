import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const supabase = await createClient();

    try {
        // Get Authenticated User
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Authentication Error or User not found:", userError);
            return NextResponse.json({ error: userError?.message || 'Authentication required' }, { status: 401 });
        }

        // Fetch User Details
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('id, fname, lname, email, role_id')
            .eq('email', user.email)
            .single();

        if (userDataError || !userData) {
            console.error(`Error fetching user data by email (${user.email}):`, userDataError);
            return NextResponse.json({ error: 'Failed to fetch user profile data' }, { status: 500 });
        }

        // Verify user is an admin
        if (userData.role_id !== 2) { // Assuming role_id 2 is for admins
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
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Helper function to get current date in YYYY-MM-DD format
 */
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * GET handler for admin dashboard data
 */
export async function GET(request) {
    // Await the result of the async createClient function - no cookieStore needed
    const supabase = await createClient();

    // Debug check for supabase auth
    if (!supabase || !supabase.auth) {
        console.error("API Route: supabase.auth is still undefined after await!");
        return NextResponse.json(
            { error: 'Supabase client initialization failed (auth missing).' },
            { status: 500 }
        );
    }

    try {
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error("Authentication Error or User not found:", userError);
            return NextResponse.json(
                { error: userError?.message || 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user profile from public.users table using email
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('id, fname, lname, email, role_id')
            .eq('email', user.email)
            .single();

        if (userDataError || !userData) {
            console.error(`Error fetching user data by email (${user.email}):`, userDataError);
            return NextResponse.json(
                { error: 'Failed to fetch user profile data using email', details: userDataError?.message },
                { status: 500 }
            );
        }

        // Verify admin role (role_id = 2)
        if (userData.role_id !== 2) {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        // Get today's date and first day of current month for filtering
        const today = getTodayDateString();
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        // Fetch upcoming events/sessions
        const { data: events, error: eventsError } = await supabase
            .from('career_sessions')
            .select(`
                session_id,
                title,
                date,
                description,
                location,
                start_time,
                end_time,
                created_at,
                attendance:attendance(count)
            `)
            .gte('date', today)
            .order('date', { ascending: true })
            .limit(10);

        if (eventsError) {
            console.error('Error fetching events:', eventsError);
            return NextResponse.json(
                { error: 'Failed to fetch events data' },
                { status: 500 }
            );
        }

        // Fetch admin notifications
        const { data: notifications, error: notifError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('admin_notification', true)
            .order('created_at', { ascending: false })
            .limit(5);

        if (notifError) {
            console.error('Error fetching notifications:', notifError);
            // Continue without notifications
        }

        // Get quick stats
        const { count: totalSessions, error: statsError } = await supabase
            .from('career_sessions')
            .select('*', { count: 'exact', head: true });

        const { count: totalStudents, error: studentsError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', 3); // Student role

        // Get session analytics
        const { data: sessionAnalytics, error: analyticsError } = await supabase
            .from('attendance')
            .select(`
                career_sessions!inner(
                    session_id,
                    date
                )
            `)
            .order('created_at', { ascending: false });

        // Get this month's new students
        const { count: newStudentsThisMonth, error: newStudentsError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', 3)
            .gte('created_at', firstDayOfMonth);

        // Get location statistics
        const { data: locationStats, error: locationError } = await supabase
            .from('career_sessions')
            .select('location')
            .order('created_at', { ascending: false });

        // Get active students (those who attended at least one session)
        const { data: activeStudents, error: activeStudentsError } = await supabase
            .from('attendance')
            .select('user_id', { distinct: true });

        // Structure and return dashboard data
        return NextResponse.json({
            user: {
                id: userData.id,
                fname: userData.fname,
                lname: userData.lname,
                email: userData.email,
                role: 'admin'
            },
            stats: {
                totalSessions: totalSessions || 0,
                totalStudents: totalStudents || 0,
                upcomingEvents: events?.length || 0,
                newStudentsThisMonth: newStudentsThisMonth || 0,
                activeStudents: activeStudents?.length || 0,
                totalAttendance: sessionAnalytics?.length || 0,
                averageAttendance: sessionAnalytics?.length && totalSessions 
                    ? Math.round((sessionAnalytics.length / totalSessions) * 10) / 10 
                    : 0,
                locationBreakdown: locationStats?.reduce((acc, curr) => {
                    acc[curr.location] = (acc[curr.location] || 0) + 1;
                    return acc;
                }, {}) || {}
            },
            events: events || [],
            notifications: notifications || [],
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST handler for admin dashboard actions
 */
export async function POST(request) {
    // Await the result of the async createClient function - no cookieStore needed
    const supabase = await createClient();

    // Debug check for supabase auth
    if (!supabase || !supabase.auth) {
        console.error("API Route: supabase.auth is still undefined after await!");
        return NextResponse.json(
            { error: 'Supabase client initialization failed (auth missing).' },
            { status: 500 }
        );
    }

    try {
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error("Authentication Error or User not found:", userError);
            return NextResponse.json(
                { error: userError?.message || 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user profile and verify admin role
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('role_id')
            .eq('email', user.email)
            .single();

        if (userDataError || !userData || userData.role_id !== 2) {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Handle different admin actions
        switch (body.action) {
            case "create_event":
                const { data: event, error: eventError } = await supabase
                    .from("career_sessions")
                    .insert([{
                        title: body.title,
                        date: body.date,
                        description: body.description || '',
                        location: body.location,
                        start_time: body.start_time,
                        end_time: body.end_time,
                        created_by: user.id
                    }])
                    .select()
                    .single();

                if (eventError) throw eventError;
                return NextResponse.json(event);

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Admin action error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}

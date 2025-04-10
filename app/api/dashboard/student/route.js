import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * @typedef {object} InternshipStats
 * @property {number} totalRequests
 */

/**
 * @typedef {object} CareerSession
 * @property {string} session_id
 * @property {string} date
 * @property {string} description
 * @property {boolean} rsvp - Indicates if the student has RSVP'd
 */

/**
 * @typedef {object} EngagementProgress
 * @property {number} sessionsAttended
 * @property {number} internshipsApplied
 * @property {number} resourcesUsed - Count of completed requirements
 * @property {number | null} overallProgress - Percentage (currently null)
 */

/**
 * @typedef {object} Notification
 * @property {string} id - Unique ID for the notification (e.g., request id or session id)
 * @property {'internship' | 'session'} type
 * @property {string} message
 * @property {string} date - Relevant date (e.g., approval date, session date)
 * @property {string} [status] - Optional status for internships (e.g., 'approved', 'rejected')
 */

/**
 * @typedef {object} DashboardData
 * @property {object} user - User details (fname, lname, email, student_id)
 * @property {InternshipStats} internshipStats
 * @property {CareerSession[]} upcomingSessions
 * @property {EngagementProgress} engagementProgress
 * @property {Notification[]} notifications
 */

// Helper function to get current date in YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * GET handler for fetching student dashboard data.
 *
 * Fetches authenticated user details, internship request statistics,
 * upcoming career sessions, career engagement progress metrics,
 * and important notifications.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} A NextResponse object containing the dashboard data or an error message.
 */
export async function GET(request) {
    // --- Debugging --- 
    // console.log("API Route: Supabase URL Loaded?", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    // console.log("API Route: Supabase Key Loaded?", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    // --- End Debugging ---

    // Await the result of the async createClient function
    const supabase = await createClient(); 

    // --- Debugging --- 
    // console.log("API Route: Supabase client object:", supabase);
    // Check if auth exists - this check might be less necessary now but good for safety
    if (!supabase || !supabase.auth) {
        console.error("API Route: supabase.auth is still undefined after await!"); // Changed log message
        return NextResponse.json({ error: 'Supabase client initialization failed (auth missing).' }, { status: 500 });
    }
    // --- End Debugging ---

    try {
        // Get Authenticated User (supabase.auth should now be defined)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            // Handle potential userError or if user is null (not logged in)
            console.error("Authentication Error or User not found:", userError);
            // Return 401 if not authenticated
            return NextResponse.json({ error: userError?.message || 'Authentication required' }, { status: 401 });
        }

        // Fetch User Details using EMAIL due to ID mismatch in public.users vs auth.users
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('id, fname, lname, email, student_id, role_id') // Select required fields + public.users.id for reference if needed
            .eq('email', user.email) // Lookup by email
            .single();

        if (userDataError || !userData) {
            console.error(`Error fetching user data by email (${user.email}):`, userDataError);
            return NextResponse.json({ error: 'Failed to fetch user profile data using email', details: userDataError?.message }, { status: 500 });
        }

        // Define which IDs to use for subsequent queries:
        const studentAuthId = user.id; // The correct UUID from auth.users (e.g., 6b56...) - Use for FKs to users(id)
        const studentIdText = userData.student_id; // The text ID from public.users (e.g., 7003...) - Use for FKs to users(student_id)

        // Fetch Internship Requests (only existing columns)
        const { data: internshipRequests, error: internshipError } = await supabase
            .from('internship_requests')
            .select('id, request_date, letter_document_id') // Only select existing columns
            .eq('user_id', studentAuthId);

        if (internshipError) {
            console.error("Error fetching internship requests:", internshipError);
            return NextResponse.json({ error: 'Failed to fetch internship data', details: internshipError.message }, { status: 500 });
        }

        // Calculate total internship request count
        const internshipStats = {
            totalRequests: internshipRequests?.length ?? 0
        };

        // Fetch Upcoming Career Sessions & Attendance
        const today = getTodayDateString();
        const { data: upcomingSessionsData, error: sessionsError } = await supabase
            .from('career_sessions')
            .select('session_id, date, description')
            .gte('date', today) // Greater than or equal to today
            .order('date', { ascending: true });

        if (sessionsError) {
            console.error("Error fetching career sessions:", sessionsError);
            return NextResponse.json({ error: 'Failed to fetch upcoming sessions' }, { status: 500 });
        }

        // Fetch student's attendance records for these upcoming sessions
        const upcomingSessionIds = upcomingSessionsData.map(s => s.session_id);
        let studentAttendance = new Set();
        if (upcomingSessionIds.length > 0 && studentIdText) {
             const { data: attendanceData, error: attendanceError } = await supabase
                .from('attendance')
                .select('session_id')
                .eq('student_id', studentIdText) // Use the TEXT student ID
                .in('session_id', upcomingSessionIds);

             if (attendanceError) {
                 console.error("Error fetching attendance data:", attendanceError);
                 // Non-critical, proceed without RSVP info if it fails
             } else {
                 studentAttendance = new Set(attendanceData.map(a => a.session_id));
             }
        }

        const upcomingSessions = upcomingSessionsData.map(session => ({
            ...session,
            rsvp: studentAttendance.has(session.session_id),
        }));

        // Fetch Career Engagement Progress
        // Sessions Attended
        const { count: sessionsAttendedCount, error: attendedError } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', studentIdText); // Use the TEXT student ID

        if (attendedError) {
             console.error("Error fetching attended sessions count:", attendedError);
             // Allow partial data
        }

        // Completed Requirements ("Resources Used")
        const { count: resourcesUsedCount, error: requirementsError } = await supabase
            .from('student_requirements')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', studentAuthId); // Use the AUTH user ID (UUID)

         if (requirementsError) {
             console.error("Error fetching completed requirements count:", requirementsError);
             // Allow partial data
         }

        // Update engagement progress calculation (internshipsApplied now uses totalRequests)
        const engagementProgress = {
            sessionsAttended: attendedError ? 0 : sessionsAttendedCount ?? 0,
            internshipsApplied: internshipStats.totalRequests, // Use the total count
            resourcesUsed: requirementsError ? 0 : resourcesUsedCount ?? 0,
            overallProgress: null, // Placeholder
        };

        // Generate Important Notifications (REMOVED internship status part)
        const notifications = [];

        // Upcoming Sessions notifications (logic remains the same)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        upcomingSessionsData.forEach(session => {
            const sessionDate = new Date(session.date);
            const daysUntil = Math.ceil((sessionDate - new Date(today)) / (1000 * 60 * 60 * 24));
            if (!isNaN(sessionDate) && sessionDate <= sevenDaysFromNow && sessionDate >= new Date(today)) {
                notifications.push({
                    id: session.session_id,
                    type: 'session',
                    message: `${session.description} starts in ${daysUntil} day(s).`,
                    date: session.date
                });
            }
        });

        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Structure and Return Data (use internshipStats)
        const dashboardData = {
            user: {
                fname: userData.fname,
                lname: userData.lname,
                email: userData.email,
                student_id: studentIdText
            },
            internshipStats, // Updated name
            upcomingSessions,
            engagementProgress,
            notifications: notifications.slice(0, 5)
        };

        return NextResponse.json(dashboardData);

    } catch (error) {
        // Log the specific error caught in the try block
        console.error("Error during dashboard data fetch:", error);
        // Catch unexpected errors (e.g., programming errors)
        console.error("Unexpected error in GET /api/dashboard/student:", error);
        // Log the full error for debugging on the server
        return NextResponse.json({ error: 'An unexpected server error occurred.', details: error.message }, { status: 500 });
    }
}

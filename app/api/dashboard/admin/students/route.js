import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET endpoint to fetch all student data for admin dashboard
 * 
 * @return {NextResponse} JSON response with student data or error
 */
export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('email', user.email)
      .single();
      
    if (userError) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    // Check if user is admin
    if (userData.role_id !== 1) { // Note: In test, admin is role_id 1
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }
    
    // Mock data for students
    const students = [
      {
        id: "58762025",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        yearGroup: "2025",
        profilePicture: "/placeholder.svg?height=40&width=40",
        major: "Computer Science",
        gpa: "3.8",
        eventsAttended: 5,
        resumeUploaded: true,
        careerRoadmap: {
          goals: ["Software Engineer at Google", "Complete AWS certification"],
          progress: 60,
        },
      },
      // ... other students
    ];
  
    // Return the student data as JSON
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

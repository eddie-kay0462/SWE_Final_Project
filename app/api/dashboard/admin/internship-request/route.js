/**
 * Admin Internship Request API
 * 
 * <p>This API handles all operations related to admin management of internship requests
 * including viewing, approving, and managing requests.</p>
 *
 * @author Nana Kwaku Amoako
 * @version 1.0
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Extracts the year group from a student ID
 * @param {string} studentId - Student ID (e.g., "26372026")
 * @returns {string} The year group (e.g., "2026")
 */
function extractYearGroup(studentId) {
  if (!studentId) return "Unknown";
  
  // Convert to string and get the first 2 digits
  const paddedId = studentId.toString().padStart(8, '0');
  const yearDigits = paddedId.slice(0, 2);
  
  // Map the digits to a year (20XX)
  return `20${yearDigits}`;
}

/**
 * GET handler for admin internship requests
 * 
 * @return {Object} List of internship requests with user details
 */
export async function GET(req) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get authenticated user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.error("Auth error:", sessionError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role_id, email')
      .eq('email', session.user.email)
      .single();

    if (userDataError) {
      console.error("Error fetching user data:", userDataError);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    if (!userData || userData.role_id !== 2) { // Admin role_id is 2
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    // Get all internship requests with user details
    const { data: requests, error: requestsError } = await supabase
      .from('internship_requests')
      .select(`
        id,
        request_date,
        letter_document_id,
        details,
        user_id,
        users (
          id,
          student_id,
          email,
          fname,
          lname,
          major
        )
      `)
      .order('request_date', { ascending: false });

    if (requestsError) {
      console.error("Error fetching requests:", requestsError);
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }

    // Format the requests data
    const formattedRequests = requests.map(request => ({
      id: request.id,
      studentId: request.users?.student_id || 'N/A',
      studentName: request.users ? `${request.users.fname} ${request.users.lname}` : 'N/A',
      studentEmail: request.users?.email || 'N/A',
      submissionDate: new Date(request.request_date).toLocaleDateString(),
      details: {
        ...request.details,
        yearGroup: extractYearGroup(request.users?.student_id),
        major: request.users?.major || "Computer Science" // Fallback to Computer Science if not specified
      },
      letterDocumentId: request.letter_document_id,
      userId: request.user_id
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Error in GET internship requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH handler for updating internship request status
 * 
 * @param {Object} req Request object with request ID and action
 * @return {Object} Updated request status
 */
export async function PATCH(req) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get authenticated user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.error("Auth error:", sessionError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role_id')
      .eq('email', session.user.email)
      .single();
      
    if (userDataError) {
      console.error("Error fetching user data:", userDataError);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    if (!userData || userData.role_id !== 2) { // Admin role_id is 2
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }
    
    // Parse request body
    const body = await req.json();
    const { requestId, letterDocumentId } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    // Update the request with the letter document ID
    const { data: updatedRequest, error: updateError } = await supabase
      .from('internship_requests')
      .update({ letter_document_id: letterDocumentId })
      .eq('id', requestId)
      .select(`
        *,
        users (
          id,
          student_id,
          email,
          fname,
          lname,
          major
        )
      `)
      .single();
      
    if (updateError) {
      console.error("Error updating request:", updateError);
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }

    // Create notification for the student
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: updatedRequest.user_id,
          type: "internship_letter",
          title: "Internship Letter Generated",
          message: "Your internship letter has been generated and is ready for download.",
          metadata: {
            letterDocumentId,
            requestId: updatedRequest.id
          }
        }
      ]);

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't return error as this is not critical
    }
    
    return NextResponse.json({
      success: true,
      message: "Request updated successfully",
      request: {
        ...updatedRequest,
        details: {
          ...updatedRequest.details,
          yearGroup: extractYearGroup(updatedRequest.users?.student_id),
          major: updatedRequest.users?.major || "Computer Science" // Fallback to Computer Science if not specified
        }
      }
    });
  } catch (error) {
    console.error("Error in PATCH internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

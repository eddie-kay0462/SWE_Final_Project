/**
 * Individual Internship Request API
 * 
 * <p>This API handles fetching individual internship request data for letter generation.</p>
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
 * GET handler for individual internship request
 * 
 * @param {Object} req Request object
 * @param {Object} context Context object containing params
 * @return {Object} Internship request data
 */
export async function GET(req, context) {
  try {
    const { params } = context
    const requestId = params.id

    // Create Supabase client
    const supabase = await createClient()

    // Get authenticated user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      console.error("Auth error:", sessionError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('email', session.user.email)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    // Get the internship request with user details
    const { data: request, error: requestError } = await supabase
      .from('internship_requests')
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
      .eq('id', requestId)
      .single()

    if (requestError) {
      console.error("Error fetching request:", requestError)
      return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 })
    }

    // Check authorization
    if (userData.role_id !== 2 && request.user_id !== session.user.id) { // 2 is admin role
      return NextResponse.json({ error: "Unauthorized to view this request" }, { status: 403 })
    }

    // Format the response data
    const formattedData = {
      id: request.id,
      studentName: `${request.users.fname} ${request.users.lname}`,
      studentId: request.users.student_id,
      yearGroup: extractYearGroup(request.users.student_id),
      major: request.users.major || "Computer Science",
      internshipDuration: request.details.internshipDuration,
      companyName: request.details.companyName,
      companyAddress: request.details.companyAddress,
      employerName: request.details.employerName,
      requestDate: request.request_date,
      letterDocumentId: request.letter_document_id
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error in GET internship request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
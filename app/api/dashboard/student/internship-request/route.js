/**
 * Student Internship Request API
 * 
 * <p>This API handles all operations related to student internship requests including
 * viewing requirements, submitting requests, and checking status.</p>
 *
 * @author Nana Kwaku Amoako
 * @version 1.0
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';

const MINIMUM_REQUIREMENTS = {
  WORKSHOPS: 3,
  FEEDBACK: 3,
  SESSIONS: 1
};

/**
 * GET handler for student internship requests
 * 
 * @return {Object} Internship request data including requirements and status
 */
export async function GET(req) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Get user details from users table
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('id, student_id')
      .eq('email', user.email)
      .single();

    if (userDataError) {
      console.error("Error fetching user data:", userDataError);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    const studentId = userData.student_id;
    
    // Get workshop attendance count
    const { count: attendanceCount, error: attendanceError } = await supabase
      .from("attendance")
      .select("*", { count: 'exact', head: true })
      .eq('student_id', studentId);
      
    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
      return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
    
    // Get feedback submissions count
    const { count: feedbackCount, error: feedbackError } = await supabase
      .from("event_feedback")
      .select("*", { count: 'exact', head: true })
      .eq('user_id', user.id);
      
    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
    
    // Get completed one-on-one sessions count
    const { count: sessionsCount, error: sessionsError } = await supabase
      .from("sessions")
      .select("*", { count: 'exact', head: true })
      .eq("student_id", user.id)
      .eq("status", "completed");
      
    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }

    // Get existing internship request if any
    const { data: existingRequest, error: requestError } = await supabase
      .from("internship_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("request_date", { ascending: false })
      .limit(1)
      .single();

    if (requestError && requestError.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error("Error fetching existing request:", requestError);
      return NextResponse.json({ error: "Failed to fetch existing request" }, { status: 500 });
    }

    // Format the requirements data with completion status
    const formattedData = {
      request: existingRequest || null,
      stats: {
        totalAttendance: attendanceCount || 0,
        completedSessions: sessionsCount || 0,
        totalFeedback: feedbackCount || 0
      },
      requirements: [
        {
          id: 1,
          description: "Career services workshops/events attendance",
          total: attendanceCount || 0,
          details: `Total workshop attendances (minimum ${MINIMUM_REQUIREMENTS.WORKSHOPS} required)`,
          completed: (attendanceCount || 0) >= MINIMUM_REQUIREMENTS.WORKSHOPS
        },
        {
          id: 2,
          description: "Workshop feedback submissions",
          total: feedbackCount || 0,
          details: `Total feedback submissions (minimum ${MINIMUM_REQUIREMENTS.FEEDBACK} required)`,
          completed: (feedbackCount || 0) >= MINIMUM_REQUIREMENTS.FEEDBACK
        },
        {
          id: 3,
          description: "1-on-1 sessions completed",
          total: sessionsCount || 0,
          details: `Total completed sessions (minimum ${MINIMUM_REQUIREMENTS.SESSIONS} required)`,
          completed: (sessionsCount || 0) >= MINIMUM_REQUIREMENTS.SESSIONS
        }
      ]
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error in GET internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST handler for creating or updating internship requests
 * 
 * @param {Object} req Request object with internship details
 * @return {Object} Created or updated internship request
 * @throws {Error} If unauthorized or database error occurs
 */
export async function POST(req) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const studentId = session.user.student_id;
    
    // Parse request body
    const body = await req.json();
    const { details } = body;
    
    if (!details) {
      return NextResponse.json({ error: "Internship details are required" }, { status: 400 });
    }
    
    // Check if user has completed all required requirements
    const yearGroup = studentId ? Number(studentId.substring(0, 4)) : null;
    
    // Get requirements
    const { data: requirementsData, error: requirementsError } = await supabase
      .from("requirement_groups")
      .select(`
        *,
        requirements:requirement_items(
          id, description, is_required
        )
      `)
      .eq("year_group", yearGroup)
      .single();
      
    if (requirementsError) {
      console.error("Error fetching requirements:", requirementsError);
      return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
    }
    
    // Get completed requirements
    const { data: completedReqs, error: completedError } = await supabase
      .from("student_requirements")
      .select("requirement_id")
      .eq("student_id", userId);
      
    if (completedError) {
      console.error("Error fetching completed requirements:", completedError);
      return NextResponse.json({ error: "Failed to fetch completed requirements" }, { status: 500 });
    }
    
    // Check if all required requirements are completed
    const requiredRequirements = requirementsData?.requirements?.filter(req => req.is_required) || [];
    const completedRequirementIds = completedReqs?.map(cr => cr.requirement_id) || [];
    
    const allRequiredCompleted = requiredRequirements.every(req => 
      completedRequirementIds.includes(req.id)
    );
    
    if (!allRequiredCompleted) {
      return NextResponse.json({ 
        error: "You must complete all required requirements before submitting an internship request." 
      }, { status: 400 });
    }
    
    // Create or update internship request
    const { data: existingRequest, error: existingError } = await supabase
      .from("internship_requests")
      .select("id, status")
      .eq("user_id", userId)
      .order("request_date", { ascending: false })
      .limit(1)
      .single();
      
    // If there's an existing request that's not rejected, return error
    if (!existingError && existingRequest && existingRequest.status !== "rejected") {
      return NextResponse.json({ 
        error: "You already have a pending or approved internship request." 
      }, { status: 400 });
    }
    
    // Create new request with details in jsonb column
    const { data: requestData, error: requestError } = await supabase
      .from("internship_requests")
      .insert([
        {
          user_id: userId,
          status: "pending",
          details: details
        }
      ])
      .select()
      .single();
      
    if (requestError) {
      console.error("Error creating internship request:", requestError);
      return NextResponse.json({ error: "Failed to create internship request" }, { status: 500 });
    }
    
    // Create notification for admin
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: userId,
          type: "internship_request",
          title: "New Internship Request",
          message: "A new internship request has been submitted and requires your review.",
          admin_notification: true
        }
      ]);
      
    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't return error as this is not critical
    }
    
    return NextResponse.json({
      success: true,
      message: "Internship request submitted successfully",
      request: requestData
    });
  } catch (error) {
    console.error("Error in POST internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH handler for updating student requirements
 * 
 * @param {Object} req Request object with requirement data
 * @return {Object} Updated requirement status
 * @throws {Error} If unauthorized or database error occurs
 */
export async function PATCH(req) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Parse request body
    const body = await req.json();
    const { requirementId, completed, details } = body;
    
    if (!requirementId) {
      return NextResponse.json({ error: "Requirement ID is required" }, { status: 400 });
    }
    
    // Verify the requirement exists
    const { data: requirementData, error: requirementError } = await supabase
      .from("requirement_items")
      .select("id")
      .eq("id", requirementId)
      .single();
      
    if (requirementError) {
      console.error("Error verifying requirement:", requirementError);
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }
    
    if (completed) {
      // Check if the requirement already exists
      const { data: existingReq, error: existingError } = await supabase
        .from("student_requirements")
        .select("id")
        .eq("student_id", userId)
        .eq("requirement_id", requirementId)
        .single();
        
      if (!existingError && existingReq) {
        // Update existing record
        const { data: updateData, error: updateError } = await supabase
          .from("student_requirements")
          .update({
            details: details || null,
            completed_date: new Date().toISOString()
          })
          .eq("id", existingReq.id)
          .select()
          .single();
          
        if (updateError) {
          console.error("Error updating requirement:", updateError);
          return NextResponse.json({ error: "Failed to update requirement" }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          message: "Requirement updated successfully",
          requirement: updateData
        });
      } else {
        // Create new record
        const { data: insertData, error: insertError } = await supabase
          .from("student_requirements")
          .insert([
            {
              student_id: userId,
              requirement_id: requirementId,
              details: details || null,
              completed_date: new Date().toISOString()
            }
          ])
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating requirement:", insertError);
          return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          message: "Requirement completed successfully",
          requirement: insertData
        });
      }
    } else {
      // Remove the requirement if it exists
      const { error: deleteError } = await supabase
        .from("student_requirements")
        .delete()
        .eq("student_id", userId)
        .eq("requirement_id", requirementId);
        
      if (deleteError) {
        console.error("Error deleting requirement:", deleteError);
        return NextResponse.json({ error: "Failed to delete requirement" }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: "Requirement uncompleted successfully"
      });
    }
  } catch (error) {
    console.error("Error in PATCH internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

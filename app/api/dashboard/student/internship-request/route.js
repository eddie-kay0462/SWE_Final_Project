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
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Handle missing environment variables gracefully
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing required Supabase environment variables");
}

// Initialize Supabase client with fallback for build time
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * GET handler for student internship requests
 * 
 * @return {Object} Internship request data including requirements and status
 * @throws {Error} If unauthorized or database error occurs
 */
export async function GET(req) {
  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 503 }
      );
    }

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const studentId = session.user.student_id;
    
    // Get student's request if it exists
    const { data: requestData, error: requestError } = await supabase
      .from("internship_requests")
      .select("*, users!approved_by(fname, lname)")
      .eq("user_id", userId)
      .order("request_date", { ascending: false })
      .limit(1)
      .single();
      
    if (requestError && requestError.code !== "PGRST116") {
      console.error("Error fetching internship request:", requestError);
      return NextResponse.json({ error: "Failed to fetch internship request" }, { status: 500 });
    }
    
    // Check attendance requirements
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("session_id")
      .eq("student_id", userId);
      
    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
      return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
    
    const uniqueSessionsAttended = new Set(attendanceData?.map(a => a.session_id) || []).size;
    
    // Check 1-on-1 session completion
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("id, status")
      .eq("student_id", userId)
      .eq("status", "completed")
      .single();
      
    if (sessionError && sessionError.code !== "PGRST116") {
      console.error("Error fetching session:", sessionError);
      return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
    }
    
    // Check feedback submissions
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("session_id")
      .eq("student_id", userId);
      
    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
    
    const feedbackSubmitted = new Set(feedbackData?.map(f => f.session_id) || []).size;
    
    // Format requirements with completion status
    const requirements = [
      {
        id: 1,
        description: "Attended at least 3 career services workshops/events",
        completed: uniqueSessionsAttended >= 3,
        details: `${uniqueSessionsAttended}/3 workshops`,
      },
      {
        id: 2,
        description: "Completed feedback form for all attended workshops",
        completed: feedbackSubmitted >= uniqueSessionsAttended,
        details: feedbackSubmitted >= uniqueSessionsAttended 
          ? "All feedback forms submitted" 
          : `${feedbackSubmitted}/${uniqueSessionsAttended} feedback forms submitted`,
      },
      {
        id: 3,
        description: "Attended a 1-on-1 session and completed feedback",
        completed: !!sessionData,
        details: sessionData ? "1/1 sessions completed" : "0/1 sessions completed",
      },
    ];
    
    return NextResponse.json({
      request: requestData || null,
      requirements,
      allRequirementsMet: requirements.every(req => req.completed)
    });
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

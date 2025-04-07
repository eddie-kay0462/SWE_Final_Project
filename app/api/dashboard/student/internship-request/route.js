/**
 * Student Internship Request API
 * 
 * <p>This API handles all operations related to student internship requests including
 * viewing requirements, submitting requests, and checking status.</p>
 *
 * @author Claude Assistant
 * @version 1.0
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET handler for student internship requests
 * 
 * @return {Object} Internship request data including requirements and status
 * @throws {Error} If unauthorized or database error occurs
 */
export async function GET(req) {
  try {
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
    
    // Get student's year group from student ID (assuming format XXXX20XX)
    const yearGroup = studentId ? Number(studentId.substring(0, 4)) : null;
    
    // Get requirements for student's year group
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
      
    if (requirementsError && requirementsError.code !== "PGRST116") {
      console.error("Error fetching requirements:", requirementsError);
      return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
    }
    
    // Get completed requirements for this student
    const { data: completedReqs, error: completedError } = await supabase
      .from("student_requirements")
      .select("requirement_id, completed_date, details")
      .eq("student_id", userId);
      
    if (completedError) {
      console.error("Error fetching completed requirements:", completedError);
      return NextResponse.json({ error: "Failed to fetch completed requirements" }, { status: 500 });
    }
    
    // Transform requirements to include completion status
    let formattedRequirements = [];
    if (requirementsData && requirementsData.requirements) {
      formattedRequirements = requirementsData.requirements.map(req => {
        const completed = completedReqs?.find(cr => cr.requirement_id === req.id);
        return {
          id: req.id,
          description: req.description,
          is_required: req.is_required,
          completed: !!completed,
          details: completed?.details || null,
          completed_date: completed?.completed_date || null
        };
      });
    }
    
    // Get document if request exists
    let document = null;
    if (requestData) {
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .eq("id", requestData.document_id)
        .single();
        
      if (docError && docError.code !== "PGRST116") {
        console.error("Error fetching document:", docError);
      } else {
        document = docData;
      }
    }
    
    return NextResponse.json({
      request: requestData || null,
      requirements: formattedRequirements,
      document: document,
      requirementsGroup: requirementsData || null
    });
  } catch (error) {
    console.error("Error in GET internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST handler for creating or updating internship requests
 * 
 * @param {Object} req Request object with document file data
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
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    // Validate file type
    const fileType = file.type;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF or image file." }, { status: 400 });
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
    
    // Upload file to storage
    const fileName = `${userId}_${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(`validation-passes/${fileName}`, file);
      
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
    
    // Get file URL
    const { data: urlData } = await supabase.storage
      .from("documents")
      .getPublicUrl(`validation-passes/${fileName}`);
      
    const fileUrl = urlData?.publicUrl;
    
    // Create document record
    const { data: documentData, error: documentError } = await supabase
      .from("documents")
      .insert([
        {
          file_type: fileType.includes("pdf") ? "pdf" : "image",
          file_url: fileUrl,
          uploaded_by: userId,
          user_id: userId
        }
      ])
      .select()
      .single();
      
    if (documentError) {
      console.error("Error creating document record:", documentError);
      return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
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
    
    // Create new request
    const { data: requestData, error: requestError } = await supabase
      .from("internship_requests")
      .insert([
        {
          user_id: userId,
          status: "pending",
          document_id: documentData.id
        }
      ])
      .select()
      .single();
      
    if (requestError) {
      console.error("Error creating internship request:", requestError);
      return NextResponse.json({ error: "Failed to create internship request" }, { status: 500 });
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

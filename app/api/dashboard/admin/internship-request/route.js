/**
 * Admin Internship Request API
 * 
 * <p>This API handles all admin operations related to internship requests including
 * managing requirements, approving/rejecting requests, and uploading letters.</p>
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
 * GET handler for admin to fetch all internship requests
 * 
 * @param {Object} req Request object with optional query params
 * @return {Object} List of internship requests with filters
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

    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin or career services staff
    const userId = session.user.id;
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user role:", userError);
      return NextResponse.json({ error: "Failed to verify admin status" }, { status: 500 });
    }
    
    // Role 1 = admin, Role 2 = career services staff
    if (userData.role_id !== 1 && userData.role_id !== 2) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";
    const yearGroup = url.searchParams.get("yearGroup");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from("internship_requests")
      .select(`
        *,
        user:users(id, student_id, fname, lname, email),
        document:documents(id, file_url, file_type),
        letter:documents(id, file_url)
      `, { count: "exact" });
    
    // Apply filters
    if (status !== "all") {
      query = query.eq("status", status);
    }
    
    // Apply pagination
    query = query.order("request_date", { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error fetching internship requests:", error);
      return NextResponse.json({ error: "Failed to fetch internship requests" }, { status: 500 });
    }

    // Filter by year group if provided (requires parsing student ID)
    let filteredData = data;
    if (yearGroup) {
      filteredData = data.filter(request => {
        const studentId = request.user?.student_id;
        if (!studentId) return false;
        const studentYearGroup = Number(studentId.substring(0, 4));
        return studentYearGroup === Number(yearGroup);
      });
    }
    
    // Format the response
    const formattedRequests = filteredData.map(request => {
      return {
        id: request.id,
        status: request.status,
        requestDate: request.request_date,
        approvalDate: request.approval_date,
        student: {
          id: request.user?.id,
          studentId: request.user?.student_id,
          name: `${request.user?.fname} ${request.user?.lname}`,
          email: request.user?.email
        },
        document: request.document ? {
          id: request.document.id,
          url: request.document.file_url,
          type: request.document.file_type
        } : null,
        letter: request.letter && request.approved_by ? {
          id: request.letter.id,
          url: request.letter.file_url
        } : null
      };
    });
    
    return NextResponse.json({
      requests: formattedRequests,
      total: count || filteredData.length,
      page,
      limit,
      totalPages: Math.ceil((count || filteredData.length) / limit)
    });
  } catch (error) {
    console.error("Error in GET admin internship requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST handler for admin to update request status (approve/reject)
 * 
 * @param {Object} req Request object with request ID and action
 * @return {Object} Updated request status
 * @throws {Error} If unauthorized or database error occurs
 */
export async function POST(req) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin or career services staff
    const userId = session.user.id;
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user role:", userError);
      return NextResponse.json({ error: "Failed to verify admin status" }, { status: 500 });
    }
    
    // Role 1 = admin, Role 2 = career services staff
    if (userData.role_id !== 1 && userData.role_id !== 2) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }
    
    // Parse request body
    const body = await req.json();
    const { requestId, action, rejectionReason } = body;
    
    if (!requestId || !action) {
      return NextResponse.json({ error: "Request ID and action are required" }, { status: 400 });
    }
    
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'." }, { status: 400 });
    }
    
    // Check if request exists
    const { data: requestData, error: requestError } = await supabase
      .from("internship_requests")
      .select("id, status, user_id")
      .eq("id", requestId)
      .single();
      
    if (requestError) {
      console.error("Error fetching internship request:", requestError);
      return NextResponse.json({ error: "Internship request not found" }, { status: 404 });
    }
    
    if (requestData.status !== "pending") {
      return NextResponse.json({ error: "Cannot modify a request that is not pending." }, { status: 400 });
    }
    
    // Update request status
    const status = action === "approve" ? "approved" : "rejected";
    const updateData = {
      status,
      approval_date: new Date().toISOString(),
      approved_by: userId
    };
    
    // Add rejection reason if provided
    if (status === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    
    const { data: updatedRequest, error: updateError } = await supabase
      .from("internship_requests")
      .update(updateData)
      .eq("id", requestId)
      .select()
      .single();
      
    if (updateError) {
      console.error("Error updating internship request:", updateError);
      return NextResponse.json({ error: "Failed to update internship request" }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Internship request ${status} successfully`,
      request: updatedRequest
    });
  } catch (error) {
    console.error("Error in POST admin internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT handler for admin to upload internship letter
 * 
 * @param {Object} req Request object with request ID and letter file
 * @return {Object} Updated request with letter information
 * @throws {Error} If unauthorized or database error occurs
 */
export async function PUT(req) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin or career services staff
    const userId = session.user.id;
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user role:", userError);
      return NextResponse.json({ error: "Failed to verify admin status" }, { status: 500 });
    }
    
    // Role 1 = admin, Role 2 = career services staff
    if (userData.role_id !== 1 && userData.role_id !== 2) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }
    
    // Parse request body
    const formData = await req.formData();
    const requestId = formData.get("requestId");
    const file = formData.get("file");
    
    if (!requestId || !file) {
      return NextResponse.json({ error: "Request ID and file are required" }, { status: 400 });
    }
    
    // Check if request exists and is approved
    const { data: requestData, error: requestError } = await supabase
      .from("internship_requests")
      .select("id, status, user_id")
      .eq("id", requestId)
      .single();
      
    if (requestError) {
      console.error("Error fetching internship request:", requestError);
      return NextResponse.json({ error: "Internship request not found" }, { status: 404 });
    }
    
    // Validate file type
    const fileType = file.type;
    if (fileType !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF file." }, { status: 400 });
    }
    
    // Upload file to storage
    const fileName = `${requestData.user_id}_${Date.now()}_letter.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(`internship-letters/${fileName}`, file);
      
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
    
    // Get file URL
    const { data: urlData } = await supabase.storage
      .from("documents")
      .getPublicUrl(`internship-letters/${fileName}`);
      
    const fileUrl = urlData?.publicUrl;
    
    // Create document record
    const { data: documentData, error: documentError } = await supabase
      .from("documents")
      .insert([
        {
          file_type: "pdf",
          file_url: fileUrl,
          uploaded_by: userId,
          user_id: requestData.user_id
        }
      ])
      .select()
      .single();
      
    if (documentError) {
      console.error("Error creating document record:", documentError);
      return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
    }
    
    // Update request with letter document ID and approve if not already
    const updateData = {
      letter_document_id: documentData.id
    };
    
    // If request is not already approved, approve it
    if (requestData.status !== "approved") {
      updateData.status = "approved";
      updateData.approval_date = new Date().toISOString();
      updateData.approved_by = userId;
    }
    
    const { data: updatedRequest, error: updateError } = await supabase
      .from("internship_requests")
      .update(updateData)
      .eq("id", requestId)
      .select()
      .single();
      
    if (updateError) {
      console.error("Error updating internship request:", updateError);
      return NextResponse.json({ error: "Failed to update internship request" }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Internship letter uploaded successfully",
      request: updatedRequest,
      document: documentData
    });
  } catch (error) {
    console.error("Error in PUT admin internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH handler for admin to manage requirements
 * 
 * @param {Object} req Request object with requirement data
 * @return {Object} Created or updated requirements
 * @throws {Error} If unauthorized or database error occurs
 */
export async function PATCH(req) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin or career services staff
    const userId = session.user.id;
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user role:", userError);
      return NextResponse.json({ error: "Failed to verify admin status" }, { status: 500 });
    }
    
    // Role 1 = admin, Role 2 = career services staff
    if (userData.role_id !== 1 && userData.role_id !== 2) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }
    
    // Parse request body
    const body = await req.json();
    const { action, yearGroup, requirements, requirementId } = body;
    
    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }
    
    // Handle different actions
    switch (action) {
      case "createRequirementGroup":
        // Create a new requirement group for a year group
        if (!yearGroup) {
          return NextResponse.json({ error: "Year group is required" }, { status: 400 });
        }
        
        if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
          return NextResponse.json({ error: "Requirements array is required" }, { status: 400 });
        }
        
        // Check if group already exists
        const { data: existingGroup, error: groupError } = await supabase
          .from("requirement_groups")
          .select("id")
          .eq("year_group", yearGroup)
          .single();
          
        if (!groupError && existingGroup) {
          return NextResponse.json({ error: "A requirement group already exists for this year group" }, { status: 400 });
        }
        
        // Create the group
        const { data: groupData, error: createGroupError } = await supabase
          .from("requirement_groups")
          .insert([
            {
              year_group: yearGroup,
              created_by: userId
            }
          ])
          .select()
          .single();
          
        if (createGroupError) {
          console.error("Error creating requirement group:", createGroupError);
          return NextResponse.json({ error: "Failed to create requirement group" }, { status: 500 });
        }
        
        // Create the requirement items
        const requirementItems = requirements.map(req => ({
          requirement_group_id: groupData.id,
          description: req.description,
          is_required: req.isRequired || false
        }));
        
        const { data: reqItems, error: reqItemsError } = await supabase
          .from("requirement_items")
          .insert(requirementItems)
          .select();
          
        if (reqItemsError) {
          console.error("Error creating requirement items:", reqItemsError);
          return NextResponse.json({ error: "Failed to create requirement items" }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          message: "Requirement group created successfully",
          group: groupData,
          requirements: reqItems
        });
        
      case "updateRequirementGroup":
        // Update an existing requirement group
        if (!yearGroup) {
          return NextResponse.json({ error: "Year group is required" }, { status: 400 });
        }
        
        if (!requirements || !Array.isArray(requirements)) {
          return NextResponse.json({ error: "Requirements array is required" }, { status: 400 });
        }
        
        // Get the group ID
        const { data: group, error: getGroupError } = await supabase
          .from("requirement_groups")
          .select("id")
          .eq("year_group", yearGroup)
          .single();
          
        if (getGroupError) {
          console.error("Error fetching requirement group:", getGroupError);
          return NextResponse.json({ error: "Requirement group not found" }, { status: 404 });
        }
        
        // Process each requirement (update, create, or delete)
        const createItems = [];
        const updateItems = [];
        const deleteIds = [];
        
        for (const req of requirements) {
          if (req.id && req.delete) {
            // Mark for deletion
            deleteIds.push(req.id);
          } else if (req.id) {
            // Mark for update
            updateItems.push({
              id: req.id,
              description: req.description,
              is_required: req.isRequired
            });
          } else {
            // Mark for creation
            createItems.push({
              requirement_group_id: group.id,
              description: req.description,
              is_required: req.isRequired || false
            });
          }
        }
        
        // Execute operations
        let createdItems = [];
        let updatedItems = [];
        
        // Delete items
        if (deleteIds.length > 0) {
          const { error: deleteError } = await supabase
            .from("requirement_items")
            .delete()
            .in("id", deleteIds);
            
          if (deleteError) {
            console.error("Error deleting requirement items:", deleteError);
            return NextResponse.json({ error: "Failed to delete requirement items" }, { status: 500 });
          }
        }
        
        // Create new items
        if (createItems.length > 0) {
          const { data: newItems, error: createError } = await supabase
            .from("requirement_items")
            .insert(createItems)
            .select();
            
          if (createError) {
            console.error("Error creating requirement items:", createError);
            return NextResponse.json({ error: "Failed to create requirement items" }, { status: 500 });
          }
          
          createdItems = newItems;
        }
        
        // Update existing items
        for (const item of updateItems) {
          const { data: updated, error: updateError } = await supabase
            .from("requirement_items")
            .update({
              description: item.description,
              is_required: item.is_required
            })
            .eq("id", item.id)
            .select()
            .single();
            
          if (updateError) {
            console.error("Error updating requirement item:", updateError);
            continue;
          }
          
          updatedItems.push(updated);
        }
        
        return NextResponse.json({
          success: true,
          message: "Requirement group updated successfully",
          created: createdItems,
          updated: updatedItems,
          deleted: deleteIds.length
        });
        
      case "getRequirementGroups":
        // Get all year groups and their requirements
        const { data: allGroups, error: allGroupsError } = await supabase
          .from("requirement_groups")
          .select(`
            *,
            requirements:requirement_items(*)
          `)
          .order("year_group", { ascending: false });
          
        if (allGroupsError) {
          console.error("Error fetching requirement groups:", allGroupsError);
          return NextResponse.json({ error: "Failed to fetch requirement groups" }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          groups: allGroups
        });
        
      case "deleteRequirementGroup":
        // Delete an entire requirement group
        if (!yearGroup) {
          return NextResponse.json({ error: "Year group is required" }, { status: 400 });
        }
        
        // Delete the group (cascade will delete items)
        const { error: deleteGroupError } = await supabase
          .from("requirement_groups")
          .delete()
          .eq("year_group", yearGroup);
          
        if (deleteGroupError) {
          console.error("Error deleting requirement group:", deleteGroupError);
          return NextResponse.json({ error: "Failed to delete requirement group" }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          message: "Requirement group deleted successfully"
        });
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in PATCH admin internship request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Get current user ID from session
async function getCurrentUserId() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error("Not authenticated")
  }

  // Get the actual database ID from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .single()

  if (userError || !userData) {
    throw new Error("User not found in database")
  }

  return userData.id
}

// Get user role (admin or student)
export async function getUserRole() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role_id")
    .eq("email", user.email)
    .single()

  if (userError || !userData) {
    return null
  }

  return userData.role_id
}

// Get booking enabled status
export async function getBookingStatus() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { data, error } = await supabase
    .from("session_settings")
    .select("is_booking_enabled")
    .order("id", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error fetching booking status:", error)
    return true // Default to enabled if there's an error
  }

  return data?.is_booking_enabled
}

// Update booking status (admin only)
export async function updateBookingStatus(isEnabled) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  // Verify user is admin
  const role = await getUserRole()
  if (role !== 2) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("session_settings").update({ is_booking_enabled: isEnabled }).eq("id", 1)

  if (error) {
    console.error("Error updating booking status:", error)
    throw new Error("Failed to update booking status")
  }

  revalidatePath("/dashboard/admin/one-on-one")
  revalidatePath("/dashboard/student/one-on-one")

  return { success: true }
}

// Get all advisors (for student booking)
export async function getAdvisors() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    console.log("Fetching advisors...")

    // Get all users with role_id = 2 (admin/advisor)
    const { data, error } = await supabase
      .from("users")
      .select("id, fname, lname, email")
      .eq("role_id", 2) // 2 is admin/advisor
      .order("lname", { ascending: true })

    if (error) {
      console.error("Error fetching advisors:", error)
      throw new Error("Failed to fetch advisors")
    }

    console.log("Fetched advisors:", data)
    return data || []
  } catch (error) {
    console.error("Error in getAdvisors:", error)
    return []
  }
}

// Book a session (student)
export async function bookSession(formData) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    const studentId = await getCurrentUserId()
    const date = formData.get("date")
    const time = formData.get("time")
    const advisorId = formData.get("advisor_id")
    const location = formData.get("location")

    console.log("Booking session with data:", { studentId, date, time, advisorId, location })

    if (!studentId || !date || !time || !advisorId || !location) {
      console.error("Missing required fields:", { studentId, date, time, advisorId, location })
      throw new Error("Missing required information for booking")
    }

    // Calculate end time (1 hour after start time)
    const [hours, minutes] = time.split(":").map(Number)
    const endHours = (hours + 1) % 24
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    // Check if booking is enabled
    const isBookingEnabled = await getBookingStatus()
    if (!isBookingEnabled) {
      throw new Error("Booking is currently disabled by the career services team")
    }

    // Check for double booking
    const { data: existingSession, error: checkError } = await supabase
      .from("sessions")
      .select("id")
      .eq("advisor_id", advisorId)
      .eq("date", date)
      .eq("time", time)
      .eq("status", "scheduled")
      .limit(1)

    if (checkError) {
      console.error("Error checking for existing sessions:", checkError)
      throw new Error("Failed to check for existing sessions")
    }

    if (existingSession && existingSession.length > 0) {
      throw new Error("This time slot is already booked")
    }

    // Create the session
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        student_id: studentId,
        advisor_id: advisorId,
        date,
        time,
        end_time: endTime,
        location,
        status: "scheduled",
      })
      .select()

    if (error) {
      console.error("Error booking session:", error)
      throw new Error("Failed to book session")
    }

    console.log("Session booked successfully:", data)
    revalidatePath("/dashboard/student/one-on-one")

    return { success: true, message: "Session booked successfully" }
  } catch (error) {
    console.error("Error in bookSession:", error)
    return {
      success: false,
      message: error.message || "Failed to book session",
    }
  }
}

// Admin create session
export async function createSessionForStudent(formData) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    // Verify user is admin
    const role = await getUserRole()
    if (role !== 2) {
      throw new Error("Unauthorized")
    }

    const advisorId = await getCurrentUserId()
    const studentId = formData.get("student_id")
    const date = formData.get("date")
    const time = formData.get("time")
    const location = formData.get("location")

    console.log("Creating session with data:", { advisorId, studentId, date, time, location })

    if (!advisorId || !studentId || !date || !time || !location) {
      console.error("Missing required fields:", { advisorId, studentId, date, time, location })
      throw new Error("Missing required information for creating session")
    }

    // Calculate end time (1 hour after start time)
    const [hours, minutes] = time.split(":").map(Number)
    const endHours = (hours + 1) % 24
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    // Check for double booking
    const { data: existingSession, error: checkError } = await supabase
      .from("sessions")
      .select("id")
      .eq("advisor_id", advisorId)
      .eq("date", date)
      .eq("time", time)
      .eq("status", "scheduled")
      .limit(1)

    if (checkError) {
      console.error("Error checking for existing sessions:", checkError)
      throw new Error("Failed to check for existing sessions")
    }

    if (existingSession && existingSession.length > 0) {
      throw new Error("This time slot is already booked")
    }

    // Create the session
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        student_id: studentId,
        advisor_id: advisorId,
        date,
        time,
        end_time: endTime,
        location,
        status: "scheduled",
      })
      .select()

    if (error) {
      console.error("Error creating session:", error)
      throw new Error("Failed to create session")
    }

    console.log("Session created successfully:", data)
    revalidatePath("/dashboard/admin/one-on-one")

    return { success: true, message: "Session created successfully" }
  } catch (error) {
    console.error("Error in createSessionForStudent:", error)
    return {
      success: false,
      message: error.message || "Failed to create session",
    }
  }
}

// Get sessions for current user (student or admin)
export async function getUserSessions() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    const userId = await getCurrentUserId()
    const role = await getUserRole()

    let query

    if (role === 3) {
      // Student
      // Fetch sessions for student with advisor details
      query = supabase
        .from("sessions")
        .select(`
          *,
          advisor:advisor_id (
            id,
            fname,
            lname,
            email
          )
        `)
        .eq("student_id", userId)
    } else if (role === 2) {
      // Admin/Advisor
      // Fetch sessions for advisor with student details
      query = supabase
        .from("sessions")
        .select(`
          *,
          student:student_id (
            id,
            fname,
            lname,
            email,
            student_id
          )
        `)
        .eq("advisor_id", userId)
    } else {
      throw new Error("Invalid user role")
    }

    // Get both upcoming and past sessions
    const { data, error } = await query.order("date", { ascending: true })

    if (error) {
      console.error("Error fetching sessions:", error)
      throw new Error("Failed to fetch sessions")
    }

    // Separate into upcoming and past sessions
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingSessions = data.filter((session) => {
      if (session.status === "cancelled") return false
      const sessionDate = new Date(session.date)
      return sessionDate >= today && session.status === "scheduled"
    })

    const pastSessions = data.filter((session) => {
      const sessionDate = new Date(session.date)
      return sessionDate < today || session.status === "completed" || session.status === "cancelled"
    })

    return { upcomingSessions, pastSessions }
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return { upcomingSessions: [], pastSessions: [] }
  }
}

// Get all students for admin to create sessions
export async function getStudents() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    console.log("Fetching students...")

    const { data, error } = await supabase
      .from("users")
      .select("id, fname, lname, email, student_id")
      .eq("role_id", 3) // 3 is student
      .order("lname", { ascending: true })

    if (error) {
      console.error("Error fetching students:", error)
      throw new Error("Failed to fetch students")
    }

    console.log("Fetched students:", data)
    return data || []
  } catch (error) {
    console.error("Error in getStudents:", error)
    return []
  }
}

// Cancel a session
export async function cancelSession(sessionId, reason) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    const userId = await getCurrentUserId()

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (fetchError || !session) {
      throw new Error("Session not found")
    }

    // Validate the user is either the student or advisor
    if (session.student_id !== userId && session.advisor_id !== userId) {
      throw new Error("Unauthorized")
    }

    // Update the session status
    const { error } = await supabase
      .from("sessions")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_by: userId,
      })
      .eq("id", sessionId)

    if (error) {
      throw new Error("Failed to cancel session")
    }

    // Revalidate both admin and student pages
    revalidatePath("/dashboard/admin/one-on-one")
    revalidatePath("/dashboard/student/one-on-one")

    return { success: true, message: "Session cancelled successfully" }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to cancel session",
    }
  }
}

// Mark session as completed (admin only)
export async function markSessionCompleted(sessionId, notes) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    // Verify user is admin
    const role = await getUserRole()
    if (role !== 2) {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase
      .from("sessions")
      .update({
        status: "completed",
        notes,
      })
      .eq("id", sessionId)

    if (error) {
      throw new Error("Failed to complete session")
    }

    revalidatePath("/dashboard/admin/one-on-one")

    return { success: true, message: "Session marked as completed" }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to complete session",
    }
  }
}

// Add notes to a session (admin only)
export async function addSessionNotes(sessionId, notes) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  try {
    // Verify user is admin
    const role = await getUserRole()
    if (role !== 2) {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase.from("sessions").update({ notes }).eq("id", sessionId)

    if (error) {
      throw new Error("Failed to add notes")
    }

    revalidatePath("/dashboard/admin/one-on-one")

    return { success: true, message: "Notes added successfully" }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to add notes",
    }
  }
}

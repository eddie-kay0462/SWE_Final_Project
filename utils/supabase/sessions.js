"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Get current user ID from session
export async function getCurrentUserId() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

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
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

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
export async function getBookingStatus(advisorId) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  // If no advisorId is provided, return the global setting
  if (!advisorId) {
    const { data, error } = await supabase
      .from("session_settings")
      .select("is_booking_enabled")
      .is("advisor_id", null) // Get the global setting (where advisor_id is null)
      .order("id", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching global booking status:", error)
      return true // Default to enabled if there's an error
    }

    return data?.is_booking_enabled
  }

  // Check for advisor-specific setting
  const { data, error } = await supabase
    .from("session_settings")
    .select("is_booking_enabled")
    .eq("advisor_id", advisorId)
    .order("id", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // If no specific setting exists for this advisor, fall back to global setting
    return getBookingStatus(null)
  }

  return data?.is_booking_enabled
}

// Add debug logging to the updateBookingStatus function to help diagnose issues

// Update booking status (admin only)
export async function updateBookingStatus(isEnabled, advisorId = null) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  // Debug logging
  console.log("updateBookingStatus called with:", { isEnabled, advisorId })

  // Verify user is admin
  const role = await getUserRole()
  console.log("Current user role:", role)

  if (role !== 2) {
    console.error("Unauthorized: User role is not admin")
    throw new Error("Unauthorized")
  }

  try {
    // If updating for a specific advisor
    if (advisorId) {
      console.log("Updating for specific advisor:", advisorId)

      // Check if a record already exists for this advisor
      const { data, error: checkError } = await supabase
        .from("session_settings")
        .select("id")
        .eq("advisor_id", advisorId)
        .limit(1)

      if (checkError) {
        console.error("Error checking for existing settings:", checkError)
        throw new Error("Failed to check existing settings")
      }

      console.log("Existing settings check result:", data)

      if (data && data.length > 0) {
        // Update existing record
        console.log("Updating existing record:", data[0].id)
        const { error } = await supabase
          .from("session_settings")
          .update({ is_booking_enabled: isEnabled })
          .eq("id", data[0].id)

        if (error) {
          console.error("Error updating booking status:", error)
          throw new Error("Failed to update booking status")
        }
      } else {
        // Create new record for this advisor
        console.log("Creating new record for advisor:", advisorId)
        const { error } = await supabase.from("session_settings").insert({
          advisor_id: advisorId,
          is_booking_enabled: isEnabled,
        })

        if (error) {
          console.error("Error creating booking status:", error)
          throw new Error("Failed to create booking status")
        }
      }
    } else {
      // Update global setting
      console.log("Updating global setting")
      const { data, error: checkError } = await supabase
        .from("session_settings")
        .select("id")
        .is("advisor_id", null)
        .limit(1)

      if (checkError) {
        console.error("Error checking for global settings:", checkError)
        throw new Error("Failed to check global settings")
      }

      console.log("Existing global settings check result:", data)

      if (data && data.length > 0) {
        // Update existing global record
        console.log("Updating existing global record:", data[0].id)
        const { error } = await supabase
          .from("session_settings")
          .update({ is_booking_enabled: isEnabled })
          .eq("id", data[0].id)

        if (error) {
          console.error("Error updating global booking status:", error)
          throw new Error("Failed to update global booking status")
        }
      } else {
        // Create new global record
        console.log("Creating new global record")
        const { error } = await supabase.from("session_settings").insert({
          advisor_id: null,
          is_booking_enabled: isEnabled,
        })

        if (error) {
          console.error("Error creating global booking status:", error)
          throw new Error("Failed to create global booking status")
        }
      }
    }

    console.log("Successfully updated booking status")
    revalidatePath("/dashboard/admin/one-on-one")
    revalidatePath("/dashboard/student/one-on-one")

    return { success: true }
  } catch (error) {
    console.error("Error in updateBookingStatus:", error)
    return { success: false, message: error.message }
  }
}

// Get all advisors (for student booking)
export async function getAdvisors() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  const { data, error } = await supabase.from("users").select("id, fname, lname, email").eq("role_id", 2) // 2 is admin/advisor

  if (error) {
    throw new Error("Failed to fetch advisors")
  }

  return data
}

// Book a session (student)
export async function bookSession(formData) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  try {
    const studentId = await getCurrentUserId()
    let date = formData.get("date")
    // Check if date is in DD/MM/YYYY format and convert to YYYY-MM-DD
    if (date && date.includes("/")) {
      const [day, month, year] = date.split("/")
      date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
    const time = formData.get("time")
    const advisorId = formData.get("advisor_id")
    const location = formData.get("location")

    // Calculate end time (1 hour after start time)
    const [hours, minutes] = time.split(":").map(Number)
    const endHours = (hours + 1) % 24
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    // Check if global booking is enabled
    const isGlobalBookingEnabled = await getBookingStatus(null)
    if (!isGlobalBookingEnabled) {
      throw new Error("Booking is currently disabled by the career services team")
    }

    // Check if this specific advisor allows bookings
    const isAdvisorBookingEnabled = await getBookingStatus(advisorId)
    if (!isAdvisorBookingEnabled) {
      throw new Error("This advisor is not currently accepting bookings")
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
      throw new Error(`Failed to check for existing sessions: ${checkError.message}`)
    }

    if (existingSession && existingSession.length > 0) {
      throw new Error("This time slot is already booked")
    }

    // Create the session
    const { error } = await supabase.from("sessions").insert({
      student_id: studentId,
      advisor_id: advisorId,
      date,
      time,
      end_time: endTime,
      location,
      status: "scheduled",
    })

    if (error) {
      throw new Error("Failed to book session")
    }

    revalidatePath("/dashboard/student/one-on-one")

    return { success: true, message: "Session booked successfully" }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to book session",
    }
  }
}

// Admin create session
export async function createSessionForStudent(formData) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  try {
    // Verify user is admin
    const role = await getUserRole()
    if (role !== 2) {
      throw new Error("Unauthorized")
    }

    const advisorId = await getCurrentUserId()
    const studentId = formData.get("student_id")
    let date = formData.get("date")
    // Check if date is in DD/MM/YYYY format and convert to YYYY-MM-DD
    if (date && date.includes("/")) {
      const [day, month, year] = date.split("/")
      date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
    const time = formData.get("time")
    const location = formData.get("location")

    // Calculate end time (1 hour after start time)
    const [hours, minutes] = time.split(":").map(Number)
    const endHours = (hours + 1) % 24
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    // Debug log for double booking check
    console.log("Checking for double booking with params:", {
      advisorId,
      date,
      time,
      status: "scheduled",
    })

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
      throw new Error(`Failed to check for existing sessions: ${checkError.message}`)
    }

    console.log("Existing session check result:", existingSession)

    if (existingSession && existingSession.length > 0) {
      throw new Error("This time slot is already booked")
    }

    // Create the session
    const { error } = await supabase.from("sessions").insert({
      student_id: studentId,
      advisor_id: advisorId,
      date,
      time,
      end_time: endTime,
      location,
      status: "scheduled",
    })

    if (error) {
      throw new Error("Failed to create session")
    }

    revalidatePath("/dashboard/admin/one-on-one")

    return { success: true, message: "Session created successfully" }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create session",
    }
  }
}

// Get sessions for current user (student or admin)
export async function getUserSessions() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

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
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

  // Verify user is admin
  const role = await getUserRole()
  if (role !== 2) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, fname, lname, email, student_id")
    .eq("role_id", 3) // 3 is student
    .order("lname", { ascending: true })

  if (error) {
    throw new Error("Failed to fetch students")
  }

  return data
}

// Cancel a session
export async function cancelSession(sessionId, reason) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

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
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

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
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
    },
  })

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

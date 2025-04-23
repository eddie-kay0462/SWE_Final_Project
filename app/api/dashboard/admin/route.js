import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET handler for admin dashboard data
 */
export async function GET(request) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.role_id !== 1) { // Assuming 1 is admin role_id
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get dashboard data
    const { data: stats, error: statsError } = await supabase
      .from("events")
      .select(`
        id,
        title,
        date,
        location,
        attendance_count,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (statsError) throw statsError;

    return NextResponse.json({
      stats,
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for admin dashboard actions
 */
export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.role_id !== 1) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Handle different admin actions based on body.action
    switch (body.action) {
      case "create_event":
        const { data: event, error: eventError } = await supabase
          .from("events")
          .insert([
            {
              title: body.title,
              date: body.date,
              location: body.location,
              created_by: user.id
            }
          ])
          .select()
          .single();

        if (eventError) throw eventError;
        return NextResponse.json(event);

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

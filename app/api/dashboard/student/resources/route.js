import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET handler for student resources
 */
export async function GET(request) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Check if user has student role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.role_id !== 3) { // Assuming 3 is student role_id
      return NextResponse.json(
        { error: "Unauthorized - Student access required" },
        { status: 403 }
      );
    }

    // Get student resources
    const { data: resources, error: resourcesError } = await supabase
      .from("resources")
      .select(`
        id,
        title,
        description,
        url,
        created_at,
        type
      `)
      .order("created_at", { ascending: false });

    if (resourcesError) throw resourcesError;

    return NextResponse.json({
      resources,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Student resources error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET handler for fetching users
 */
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('users').select();

    if (error) {
      if (error.code === '42501') {
        return NextResponse.json(
          { error: "Access denied. You may not have permission to view this data." },
          { status: 403 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new user
 */
export async function POST(request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { fname, lname, email, password, role_id } = body;

    // Input validation
    if (!fname || !lname || !email || !password || !role_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ fname, lname, email, password, role_id }])
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a user
 */
export async function PATCH(request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, fname, lname, email, profilePic } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (fname) updateData.fname = fname;
    if (lname) updateData.lname = lname;
    if (email) updateData.email = email;
    if (profilePic) updateData.profilePic = profilePic;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a user
 */
export async function DELETE(request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

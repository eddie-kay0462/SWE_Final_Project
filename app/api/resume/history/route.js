import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user from auth.users
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the corresponding user from public.users table using email
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (publicUserError || !publicUser) {
      return NextResponse.json(
        { error: 'User not found in system' },
        { status: 404 }
      );
    }

    // Fetch user's documents ordered by upload date using public user ID
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', publicUser.id)
      .order('uploaded_at', { ascending: false });

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: dbError.message },
        { status: 500 }
      );
    }

    // Transform the data to match the frontend format
    const history = documents.map((doc, index) => ({
      id: doc.id,
      name: doc.file_url.split('/').pop(),
      uploadDate: new Date(doc.uploaded_at).toISOString().split('T')[0],
      status: doc.status || 'Pending Review',
      feedback: doc.feedback || '',
      version: documents.length - index,
      fileUrl: doc.file_url
    }));

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Resume history fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 
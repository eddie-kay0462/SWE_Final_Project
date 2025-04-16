import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET handler for fetching resume history
 * Uses server-side Supabase client with proper session handling
 */
export async function GET(request) {
  console.log('[Resume History API] Starting request handling')
  
  try {
    // Create server-side Supabase client
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get the session using the new method
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('[Resume History API] Session check:', {
      hasSession: !!session,
      error: sessionError?.message
    })

    if (sessionError) {
      console.error('[Resume History API] Session error:', sessionError)
      return NextResponse.json(
        { error: 'Authentication failed', details: sessionError.message },
        { status: 401 }
      )
    }

    if (!session) {
      console.warn('[Resume History API] No active session')
      return NextResponse.json(
        { error: 'Authentication required', details: 'No active session' },
        { status: 401 }
      )
    }

    // Use the session user directly
    const userId = session.user.id
    console.log('[Resume History API] Fetching documents for user:', userId)

    // Fetch documents using RLS
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (dbError) {
      console.error('[Resume History API] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: dbError.message },
        { status: 500 }
      )
    }

    console.log('[Resume History API] Successfully fetched documents:', {
      count: documents.length
    })

    const history = documents.map((doc, index) => ({
      id: doc.id,
      name: doc.file_url.split('/').pop(),
      uploadDate: new Date(doc.uploaded_at).toLocaleDateString(),
      status: doc.status || 'Pending Review',
      feedback: doc.feedback || '',
      version: documents.length - index,
      fileUrl: doc.file_url
    }))

    return NextResponse.json({
      success: true,
      history
    })

  } catch (error) {
    console.error('[Resume History API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 
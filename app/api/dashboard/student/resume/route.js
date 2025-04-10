import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET handler for fetching student's resume and comments
 * Returns the latest resume upload and any advisor comments
 * 
 * @route GET /api/dashboard/student/resume
 * @returns {Object} Object containing resume data and comments
 */
export async function GET(request) {
    const supabase = await createClient()

    try {
        // Verify user authentication
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            console.error("Authentication error:", userError)
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Get the latest resume document
        const { data: resumeData, error: resumeError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .eq('file_type', 'pdf')
            .order('uploaded_at', { ascending: false })
            .limit(1)
            .single()

        // Log the resume query results for debugging
        console.log("Resume query results:", { resumeData, resumeError })

        if (resumeError && resumeError.code !== 'PGRST116') {
            console.error("Error fetching resume:", resumeError)
            return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 })
        }

        // Get comments if resume exists
        let comments = []
        if (resumeData) {
            const { data: commentData, error: commentError } = await supabase
                .from('document_comments')  // Changed from resume_comments to document_comments
                .select(`
                    id,
                    content,
                    created_at,
                    advisor:users!advisor_id (
                        fname,
                        lname
                    )
                `)
                .eq('document_id', resumeData.id)
                .order('created_at', { ascending: true })

            if (commentError) {
                console.error("Error fetching comments:", commentError)
            } else {
                comments = commentData || []
            }
        }

        // Log the final response for debugging
        const response = {
            resume: resumeData || null,
            comments: comments
        }
        console.log("Sending response:", response)

        return NextResponse.json(response)

    } catch (error) {
        console.error("Error in GET resume:", error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST handler for uploading a new resume
 */
export async function POST(request) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file type
        if (!file.type.includes('pdf')) {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
        }

        // Upload file to storage
        const fileName = `${user.id}_${Date.now()}_${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file)

        if (uploadError) {
            console.error("Error uploading file:", uploadError)
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
        }

        // Get file URL
        const { data: urlData } = await supabase.storage
            .from('resumes')
            .getPublicUrl(fileName)

        const fileUrl = urlData?.publicUrl

        // Create document record
        const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .insert([{
                file_type: 'pdf',
                file_url: fileUrl,
                user_id: user.id
            }])
            .select()
            .single()

        if (documentError) {
            console.error("Error creating document record:", documentError)
            return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Resume uploaded successfully',
            document: documentData
        })

    } catch (error) {
        console.error("Error in POST resume:", error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

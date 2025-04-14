/**
 * Custom hook for managing resume operations with Supabase
 * Handles resume fetching, uploading, and comment management
 */

import { useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useResume() {
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClientComponentClient()

  /**
   * Fetches the latest resume and its comments
   * @returns {Promise<{resume: Object, comments: Array}>}
   */
  const fetchResumeData = useCallback(async () => {
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error('Authentication required')

      // Get resume data with comments in a single query
      const { data: resumeData, error: resumeError } = await supabase
        .from('documents')
        .select(`
          *,
          user:users!inner (
            id,
            email
          ),
          comments:document_comments (
            id,
            content,
            created_at,
            advisor:users!advisor_id (
              fname,
              lname,
              email
            )
          )
        `)
        .eq('user.email', user.email)
        .eq('file_type', 'pdf')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single()

      if (resumeError && resumeError.code !== 'PGRST116') {
        throw resumeError
      }

      return {
        resume: resumeData || null,
        comments: resumeData?.comments || []
      }
    } catch (error) {
      console.error('Error in fetchResumeData:', error)
      throw error
    }
  }, [supabase])

  /**
   * Uploads a new resume file
   * @param {File} file - The PDF file to upload
   * @returns {Promise<Object>} The uploaded document data
   */
  const uploadResume = useCallback(async (file) => {
    if (!file) throw new Error('No file provided')
    if (file.type !== 'application/pdf') throw new Error('Only PDF files are allowed')
    
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) throw new Error('File size must be less than 20MB')

    setIsUploading(true)
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error('Authentication required')

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (userError) throw new Error('User not found')

      // Create unique storage path
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const storagePath = `resumes/${userData.id}/${timestamp}_resume.${fileExt}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('docs')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
        })

      if (uploadError) throw new Error('Failed to upload file')

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('docs')
        .getPublicUrl(storagePath)

      // Create document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          file_type: 'pdf',
          file_url: urlData.publicUrl,
          user_id: userData.id,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (documentError) {
        // Rollback: delete uploaded file if record creation fails
        await supabase.storage
          .from('docs')
          .remove([storagePath])
        throw new Error('Failed to create document record')
      }

      return documentData
    } catch (error) {
      console.error('Error in uploadResume:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [supabase])

  return {
    isLoading,
    setIsLoading,
    isUploading,
    fetchResumeData,
    uploadResume
  }
} 
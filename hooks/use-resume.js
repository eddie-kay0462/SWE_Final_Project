/**
 * Custom hook for managing resume operations with Supabase
 * Handles resume fetching, uploading, and comment management
 * 
 * @returns {Object} Resume management functions and state
 */

import { useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from './use-session'

export function useResume() {
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClientComponentClient()
  const { session, isLoading: isSessionLoading } = useSession()

  /**
   * Gets the current user from session
   * @returns {Object} The user data
   */
  const getCurrentUser = () => {
    if (isSessionLoading) {
      throw new Error('Session loading')
    }
    if (!session) {
      throw new Error('Authentication required')
    }
    return session
  }

  /**
   * Fetches the latest resume and its comments for the current user
   * @returns {Promise<{resume: Object, comments: Array}>}
   */
  const fetchResumeData = useCallback(async () => {
    try {
      if (isSessionLoading) {
        return { resume: null, comments: [] }
      }

      const user = getCurrentUser()

      // Get resume data
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_type', 'pdf')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single()

      if (documentsError && documentsError.code !== 'PGRST116') {
        throw documentsError
      }

      return {
        resume: documents || null,
        comments: [] // We'll implement comments later
      }
    } catch (error) {
      console.error('Error in fetchResumeData:', error)
      throw error
    }
  }, [supabase, session, isSessionLoading])

  /**
   * Uploads a new resume file to Supabase storage
   * @param {File} file - The PDF file to upload
   * @returns {Promise<Object>} The uploaded document data
   */
  const uploadResume = useCallback(async (file) => {
    if (!file) throw new Error('No file provided')
    if (file.type !== 'application/pdf') throw new Error('Only PDF files are allowed')
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) throw new Error('File size must be less than 10MB')

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const user = getCurrentUser()

      // Create unique file name
      const timestamp = Date.now()
      const fileName = `${user.id}_${timestamp}_${file.name.replace(/\s+/g, '_')}`
      const filePath = `resumes/${fileName}`

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('docs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('docs')
        .getPublicUrl(filePath)

      // Create document record in database
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          file_type: 'pdf',
          file_url: publicUrl,
          user_id: user.id,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (documentError) throw documentError

      setUploadProgress(100)
      return document
    } catch (error) {
      console.error('Error in uploadResume:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [supabase, session, isSessionLoading])

  return {
    isLoading: isLoading || isSessionLoading,
    setIsLoading,
    isUploading,
    uploadProgress,
    fetchResumeData,
    uploadResume,
    isAuthenticated: !!session
  }
} 
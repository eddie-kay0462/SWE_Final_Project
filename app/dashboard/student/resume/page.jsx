/**
 * Resume upload page component that handles file uploads, validation and history management
 * 
 * <p>Allows students to upload, view and manage their resume documents with drag & drop
 * support, file validation, and status tracking.</p>
 *
 * @author Resume Team
 * @version 1.0.0
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, FileText, Download, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function ResumeUploadPage() {
  const router = useRouter()
  const { authUser, loading: authLoading } = useAuth()
  const [file, setFile] = useState(null)
  const [uploadHistory, setUploadHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)
  const supabase = createClient()

  /**
   * Checks if user is authenticated and redirects to login if not
   */
  useEffect(() => {
    if (!authLoading && !authUser) {
      console.log('[ResumeUpload] No authenticated user, redirecting to login')
      router.push('/auth/login')
      return
    }
  }, [authUser, authLoading, router])

  /**
   * Fetches resume upload history when component mounts
   */
  useEffect(() => {
    if (authUser) {
      fetchResumeHistory()
    }
  }, [authUser])

  /**
   * Fetches user's resume upload history from Supabase
   * @throws {Error} If database query fails
   */
  const fetchResumeHistory = async () => {
    if (!authUser) return
    try {
      // First get the public.users ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', authUser.email)
        .single()

      if (userError || !userData) throw userError

      // Then get documents for that user
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, file_url, status, uploaded_at, file_type')
        .eq('user_id', userData.id)

      if (error) throw error
      setUploadHistory(data)
    } catch (error) {
      console.error('[ResumeUpload] History fetch error:', error)
      toast.error('Failed to load resume history')
    }
  }

  /**
   * Handles drag over event for file drop zone
   * @param {DragEvent} e - The drag event object
   */
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  /**
   * Handles file drop event
   * @param {DragEvent} e - The drop event object
   */
  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  /**
   * Handles file selection from input
   * @param {Event} e - The change event object
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  /**
   * Validates file type and size before setting it
   * @param {File} file - The file to validate
   */
  const validateAndSetFile = (file) => {
    // Check allowed file types
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF or DOC/DOCX files are allowed")
      return
    }

    // Check file size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    setFile(file)
    handleUpload(file)
  }

  /**
   * Handles file upload to Supabase storage
   * @param {File} file - The file to upload
   * @throws {Error} If upload or database insert fails
   */
  const handleUpload = async (file) => {
    if (!authUser) {
      toast.error('Please log in to upload resumes')
      router.push('/auth/login')
      return
    }

    try {
      setIsLoading(true)

      // First, get the public.users record for this authenticated user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', authUser.email)  // Match by email since that's unique
        .single()

      if (userError || !userData) {
        console.error('Failed to find user record:', userError)
        throw new Error('User record not found')
      }

      // Now we have the public.users ID
      const publicUserId = userData.id

      // Generate unique file path with timestamp
      const timestamp = new Date().getTime()
      const filePath = `users/${publicUserId}/resumes/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      // Upload file to storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('docs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('docs')
        .getPublicUrl(filePath)

      // Insert into documents using the public.users ID
      const { error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            name: file.name,
            file_type: file.type.split("/")[1],
            file_url: publicUrl,
            user_id: publicUserId,  // Using the public.users ID here
            status: 'Pending Review'
          }
        ])

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw dbError
      }

      toast.success("Resume uploaded successfully!")
      fetchResumeHistory()
      setFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload resume: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Opens file URL in new tab for download
   * @param {string} fileUrl - The URL of the file to download
   */
  const handleDownload = (fileUrl) => {
    window.open(fileUrl, "_blank")
  }

  /**
   * Triggers file input click for replacement
   */
  const handleReplace = () => {
    fileInputRef.current.click()
  }

  /**
   * Returns appropriate icon based on document status
   * @param {string} status - The document status
   * @returns {JSX.Element} Icon component
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending Review":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "Approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "Needs Edits":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!authUser) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resume Upload</h1>
      <div className="bg-white shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
        <div
          className="border-2 border-dashed p-8 text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          {isLoading ? (
            <p>Uploading...</p>
          ) : (
            <div>
              <Upload className="h-12 w-12 mx-auto mb-4" />
              <p className="mb-4">Drag and drop your resume or click to browse</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Your Upload History</h2>
        {uploadHistory.length > 0 ? (
          <div>
            {uploadHistory.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-4">
                <div>
                  <h3>{item.name}</h3>
                  <p className="text-sm">{new Date(item.uploaded_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(item.status)}
                  <button
                    onClick={() => handleDownload(item.file_url)}
                    className="ml-2 text-blue-600"
                  >
                    Download
                  </button>
                  <button
                    onClick={handleReplace}
                    className="ml-2 text-red-600"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No uploads yet.</p>
        )}
      </div>
    </div>
  )
}

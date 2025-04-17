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

  // Frontend
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">Resume Upload</h1>
        <p className="mt-2 text-gray-600 dark:text-neutral-400">Upload and manage your resume for career advisor review</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm p-6">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 dark:border-[#363636] rounded-lg p-8 text-center hover:border-[#A91827] dark:hover:border-[#A91827] transition-colors"
        >
          <div className="mx-auto flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 dark:text-neutral-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">
              Drag and drop your resume here
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
              or click to select a file (PDF, DOC, DOCX up to 2MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-[#A91827] hover:bg-[#A91827]/90 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] focus:ring-offset-2 dark:focus:ring-offset-[#1c1c1c] transition-colors"
            >
              Select File
            </button>
          </div>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-[#262626]">
          <h2 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Upload History</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-[#262626]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-neutral-400">
              Loading...
            </div>
          ) : uploadHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-neutral-400">
              No resumes uploaded yet
            </div>
          ) : (
            uploadHistory.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 bg-gray-100 dark:bg-[#262626] rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-gray-500 dark:text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                        {doc.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-4">
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(doc.status)}
                          <span className="text-xs font-medium text-gray-700 dark:text-neutral-300">
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(doc.file_url)}
                      className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 rounded-lg"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleReplace}
                      className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 rounded-lg"
                      title="Replace"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">Resume Upload</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your resume for review by career advisors</p>

          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isLoading
                  ? "border-[#A91827] bg-[#A91827]/5"
                  : "border-gray-300 hover:border-[#A91827] hover:bg-[#A91827]/5"
              }`}
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
                disabled={isLoading}
              />
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827] mb-4"></div>
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-[#A91827]" />
                  <h3 className="text-lg font-medium mb-2">Drag and drop your resume here</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Supported formats: PDF, DOC, DOCX (Max 2MB)
                  </p>
                  <button
                    className="bg-[#A91827] hover:bg-[#8a1420] text-white font-medium py-2 px-4 rounded-md transition-colors"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isLoading}
                  >
                    Browse Files
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Current Resume Section */}
          {uploadHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Current Resume</h2>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-[#A91827] mr-3" />
                    <div>
                      <h3 className="font-medium">{uploadHistory[0].name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(uploadHistory[0].uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(uploadHistory[0].status)}
                    <span className="ml-2 font-medium">{uploadHistory[0].status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleDownload(uploadHistory[0].file_url)}
                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1.5 px-3 rounded-md text-sm transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDownload(uploadHistory[0].file_url)}
                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1.5 px-3 rounded-md text-sm transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1.5 px-3 rounded-md text-sm transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Replace
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/3">
          {/* Status Tracker */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Resume Status</h2>

            <div className="space-y-4">
              {uploadHistory.map((item) => (
                <div key={item.id} className="flex items-start border-b pb-4 last:border-0">
                  <div className="mr-3 mt-1">{getStatusIcon(item.status)}</div>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(item.uploaded_at).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : item.status === "Needs Edits"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {uploadHistory.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>No resume uploads yet</p>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Resume Guidelines</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-[#A91827] text-white text-xs flex items-center justify-center mr-2 mt-0.5">
                  1
                </span>
                <span>Keep your resume to 1-2 pages maximum</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-[#A91827] text-white text-xs flex items-center justify-center mr-2 mt-0.5">
                  2
                </span>
                <span>Use bullet points to highlight achievements</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-[#A91827] text-white text-xs flex items-center justify-center mr-2 mt-0.5">
                  3
                </span>
                <span>Quantify your accomplishments when possible</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-[#A91827] text-white text-xs flex items-center justify-center mr-2 mt-0.5">
                  4
                </span>
                <span>Tailor your resume for each job application</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-[#A91827] text-white text-xs flex items-center justify-center mr-2 mt-0.5">
                  5
                </span>
                <span>Proofread carefully for errors and typos</span>
              </li>
            </ul>
            <div className="mt-4">
              <a href="#" className="text-[#A91827] hover:underline text-sm font-medium">
                View full resume writing guide →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

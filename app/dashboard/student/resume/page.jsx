"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Clock, CheckCircle, AlertCircle, FileText, Download, RefreshCw, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function ResumeUploadPage() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadHistory, setUploadHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Debug logging for component mount
  useEffect(() => {
    console.debug("[ResumeUpload] Component mounted")
    fetchResumeHistory()
  }, [])

  const fetchResumeHistory = async () => {
    try {
      console.debug("[ResumeUpload] Fetching resume history...")
      const response = await fetch('/api/resume/history')
      const data = await response.json()

      console.debug("[ResumeUpload] History response:", data)

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch history')
      }

      setUploadHistory(data.history)
    } catch (error) {
      console.error('[ResumeUpload] History fetch error:', error)
      toast.error('Failed to load resume history')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleFileChange = (e) => {
    console.debug("[ResumeUpload] File selected:", e.target.files[0]?.name)
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const validateAndSetFile = async (file) => {
    if (!file) {
      console.debug("[ResumeUpload] No file selected")
      return
    }

    console.debug("[ResumeUpload] Validating file:", {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      console.warn("[ResumeUpload] Invalid file type:", file.type)
      toast.error("Please upload a PDF or DOC file")
      return
    }

    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      console.warn("[ResumeUpload] File too large:", file.size)
      toast.error("File size must be less than 2MB")
      return
    }

    setFile(file)
    await handleUpload(file)
  }

  const handleUpload = async (file) => {
    try {
      setIsLoading(true)
      console.debug("[ResumeUpload] Starting upload for:", file.name)

      const formData = new FormData()
      formData.append('file', file)

      // Log request details
      console.debug("[ResumeUpload] Upload request:", {
        url: '/api/resume/upload',
        fileSize: file.size,
        fileType: file.type
      })

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
        // Add credentials to ensure cookies are sent
        credentials: 'include',
      })

      console.debug("[ResumeUpload] Upload response status:", response.status)

      if (!response.ok) {
        // Log detailed error information
        const errorText = await response.text()
        console.error("[ResumeUpload] Upload failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        if (response.status === 401) {
          throw new Error("Authentication required - Please log in")
        }
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.debug("[ResumeUpload] Upload success:", data)

      if (!data.success) {
        throw new Error(data.error || 'Upload failed')
      }

      toast.success("Resume uploaded successfully!")
      await fetchResumeHistory() // Refresh the history
      setFile(null)
    } catch (error) {
      console.error('[ResumeUpload] Upload error:', error)
      toast.error(error.message || 'Failed to upload resume')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitClick = () => {
    if (!file) {
      fileInputRef.current.click()
    }
  }

  const handleDownload = async (fileUrl) => {
    try {
      console.debug("[ResumeUpload] Downloading file:", fileUrl)
      window.open(fileUrl, '_blank')
    } catch (error) {
      console.error('[ResumeUpload] Download error:', error)
      toast.error('Failed to download resume')
    }
  }

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
                isDragging
                  ? "border-[#A91827] bg-[#A91827]/5"
                  : "border-gray-300 hover:border-[#A91827] hover:bg-[#A91827]/5"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
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
                    onClick={handleSubmitClick}
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
                      <p className="text-sm text-gray-500">Uploaded on {uploadHistory[0].uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(uploadHistory[0].status)}
                    <span className="ml-2 font-medium">{uploadHistory[0].status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => window.open(uploadHistory[0].fileUrl, '_blank')}
                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1.5 px-3 rounded-md text-sm transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDownload(uploadHistory[0].fileUrl)}
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

                {uploadHistory[0].feedback && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Advisor Feedback
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{uploadHistory[0].feedback}</p>
                  </div>
                )}
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
                      <span>Version {item.version}</span>
                      <span className="mx-2">•</span>
                      <span>{item.uploadDate}</span>
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

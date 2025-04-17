/**
 * Resume Admin Dashboard component for career advisors to review and manage student resume submissions
 * 
 * <p>Provides tools for advisors to view, filter, provide feedback on, and manage student resumes</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */

"use client"

import { useState, useEffect } from "react"
import { 
  FileText, Download, CheckCircle, Clock, AlertCircle, 
  Search, Filter, ChevronDown, ChevronUp, ArrowUpDown, 
  MessageSquare, X, Send, User, Loader2
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

// Constants for file handling
const STORAGE_BUCKET = 'docs'
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

// Role IDs from database
const ROLE_ADMIN = 2 // Assuming 2 is the role_id for advisors

export default function AdvisorDashboardPage() {
  const router = useRouter()
  const { authUser, loading: authLoading } = useAuth()
  const [resumes, setResumes] = useState([])
  const [filteredResumes, setFilteredResumes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortConfig, setSortConfig] = useState({ key: "uploaded_at", direction: "desc" })
  const [selectedResume, setSelectedResume] = useState(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    needsEdits: 0
  })
  const supabase = createClient()

  /**
   * Checks if user is authenticated as advisor and redirects if not
   */
  useEffect(() => {
    if (!authLoading && !authUser) {
      console.log('[AdvisorDashboard] No authenticated user, redirecting to login')
      router.push('/auth/login')
      return
    }

    // Check if user has advisor role
    if (authUser && !authLoading) {
      checkAdvisorRole()
    }
  }, [authUser, authLoading, router])

  /**
   * Verifies the authenticated user has advisor permissions
   */
  const checkAdvisorRole = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role_id')
        .eq('email', authUser.email)
        .single()

      if (error) throw error
      
      if (data.role_id !== ROLE_ADMIN) {
        toast.error("You don't have permission to access this page")
        router.push('/')
      }
    } catch (error) {
      console.error('[AdvisorDashboard] Role check error:', error)
      toast.error('Failed to verify permissions')
      router.push('/')
    }
  }

  /**
   * Fetches resume submissions when component mounts
   */
  useEffect(() => {
    if (authUser) {
      fetchResumeSubmissions()
    }
  }, [authUser])

  /**
   * Fetches all student resume submissions from Supabase
   * @throws {Error} If database query fails
   */
  const fetchResumeSubmissions = async () => {
    try {
      setIsLoading(true)

      // Just fetch the documents with user data
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id, name, file_url, status, uploaded_at, file_type, feedback,
          users:user_id (id, email, fname, lname, student_id)
        `)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      
      // Just set the data directly, no need for signed URLs
      setResumes(data)
      setFilteredResumes(data)
      
      // Calculate statistics
      const stats = {
        total: data.length,
        pending: data.filter(item => item.status === 'Pending Review').length,
        approved: data.filter(item => item.status === 'Approved').length,
        needsEdits: data.filter(item => item.status === 'Needs Edits').length
      }
      setStats(stats)
      
    } catch (error) {
      console.error('[AdvisorDashboard] Fetch error:', error)
      toast.error('Failed to load resume submissions')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Filters and sorts resume list based on search query and status filter
   */
  useEffect(() => {
    let results = [...resumes]
    
    // Apply status filter
    if (statusFilter !== "All") {
      results = results.filter(resume => resume.status === statusFilter)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(resume => 
        resume.name.toLowerCase().includes(query) || 
        resume.users?.email.toLowerCase().includes(query) ||
        resume.users?.fname?.toLowerCase().includes(query) ||
        resume.users?.lname?.toLowerCase().includes(query) ||
        resume.users?.student_id?.toString().includes(query)
      )
    }
    
    // Apply sorting
    results.sort((a, b) => {
      const key = sortConfig.key
      
      // Handle nested user fields
      if (key.startsWith('user_')) {
        const userKey = key.replace('user_', '')
        if (a.users?.[userKey] < b.users?.[userKey]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a.users?.[userKey] > b.users?.[userKey]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      }
      
      // Handle regular fields
      if (a[key] < b[key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    
    setFilteredResumes(results)
  }, [resumes, searchQuery, statusFilter, sortConfig])

  /**
   * Updates sort configuration for table columns
   * @param {string} key - The column key to sort by
   */
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  /**
   * Opens file URL in new tab for download
   * @param {string} fileUrl - The URL of the file to download
   */
  const handleViewResume = (fileUrl) => {
    window.open(fileUrl, "_blank")
  }

  /**
   * Updates resume status in database
   * @param {string} resumeId - The ID of the resume to update
   * @param {string} newStatus - The new status value
   */
  const handleStatusChange = async (resumeId, newStatus) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', resumeId)
      
      if (error) throw error
      
      // Update local state
      const updatedResumes = resumes.map(resume => 
        resume.id === resumeId ? { ...resume, status: newStatus } : resume
      )
      setResumes(updatedResumes)
      
      // Update stats
      const stats = {
        total: updatedResumes.length,
        pending: updatedResumes.filter(item => item.status === 'Pending Review').length,
        approved: updatedResumes.filter(item => item.status === 'Approved').length,
        needsEdits: updatedResumes.filter(item => item.status === 'Needs Edits').length
      }
      setStats(stats)
      
      toast.success(`Resume status updated to "${newStatus}"`)
    } catch (error) {
      console.error('[AdvisorDashboard] Status update error:', error)
      toast.error('Failed to update resume status')
    }
  }

  /**
   * Opens feedback modal for selected resume
   * @param {Object} resume - The resume object to provide feedback for
   */
  const openFeedbackModal = (resume) => {
    setSelectedResume(resume)
    setFeedbackText(resume.feedback || "")
    setShowFeedbackModal(true)
  }

  /**
   * Submits feedback for a resume
   */
  const handleSubmitFeedback = async () => {
    if (!selectedResume) return
    
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          feedback: feedbackText,
          // If no feedback, set to Pending Review, otherwise Needs Edits
          status: feedbackText.trim() ? 'Needs Edits' : 'Pending Review'
        })
        .eq('id', selectedResume.id)
      
      if (error) throw error
      
      // Update local state
      const updatedResumes = resumes.map(resume => 
        resume.id === selectedResume.id 
          ? { 
              ...resume, 
              feedback: feedbackText,
              status: feedbackText.trim() ? 'Needs Edits' : 'Pending Review'
            } 
          : resume
      )
      setResumes(updatedResumes)
      
      // Update stats
      const updatedStats = {
        total: updatedResumes.length,
        pending: updatedResumes.filter(item => item.status === 'Pending Review').length,
        approved: updatedResumes.filter(item => item.status === 'Approved').length,
        needsEdits: updatedResumes.filter(item => item.status === 'Needs Edits').length
      }
      setStats(updatedStats)
      
      toast.success('Feedback submitted successfully')
      setShowFeedbackModal(false)
    } catch (error) {
      console.error('[AdvisorDashboard] Feedback submission error:', error)
      toast.error('Failed to submit feedback')
    }
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
    return <div className="container mx-auto p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
    </div>
  }

  if (!authUser) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white sm:text-4xl">Resume Reviews</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 sm:text-lg">Review and manage student resume submissions</p>

      {/* Statistics Cards - Updated for better responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-500 dark:text-gray-400">Total Submissions</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-500 dark:text-gray-400">Pending Review</h3>
          <div className="flex items-center">
            <p className="text-2xl sm:text-3xl font-bold mr-2">{stats.pending}</p>
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-500 dark:text-gray-400">Approved</h3>
          <div className="flex items-center">
            <p className="text-2xl sm:text-3xl font-bold mr-2">{stats.approved}</p>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-500 dark:text-gray-400">Needs Edits</h3>
          <div className="flex items-center">
            <p className="text-2xl sm:text-3xl font-bold mr-2">{stats.needsEdits}</p>
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search - Updated for better responsiveness */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Resume Submissions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or email"
                className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#A91827] focus:border-[#A91827]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select
                className="pl-4 pr-10 py-2 border rounded-md appearance-none w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#A91827] focus:border-[#A91827]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Needs Edits">Needs Edits</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Table - Updated for better responsiveness */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-200 text-sm sm:text-base">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('name')}
                  >
                    File Name
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-200 text-sm sm:text-base">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('user_student_id')}
                  >
                    Student
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-200 text-sm sm:text-base">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('uploaded_at')}
                  >
                    Uploaded
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-200 text-sm sm:text-base">
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-200 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-600">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A91827]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredResumes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No resume submissions found
                  </td>
                </tr>
              ) : (
                filteredResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-[#A91827] mr-2" />
                        <span className="font-medium dark:text-white">{resume.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium dark:text-white">
                          {resume.users?.fname} {resume.users?.lname}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{resume.users?.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(resume.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(resume.status)}
                        <span className="ml-2 dark:text-white">{resume.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewResume(resume.file_url)}
                          className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#A91827] group"
                          title="View Resume"
                        >
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 group-hover:text-[#A91827]" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(resume.id, 'Approved')}
                          className="p-2 sm:p-2.5 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-md text-green-700 dark:text-green-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 group"
                          title="Approve Resume"
                        >
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-green-600" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(resume.id, 'Needs Edits')}
                          className="p-2 sm:p-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-md text-red-700 dark:text-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 group"
                          title="Mark as Needs Edits"
                        >
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Feedback Modal - Updated for better responsiveness */}
      {showFeedbackModal && selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold dark:text-white">Resume Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium dark:text-white">
                    {selectedResume.users?.fname} {selectedResume.users?.lname}
                  </h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{selectedResume.users?.email}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Resume: {selectedResume.name}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback
                </label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-32 focus:ring-2 focus:ring-[#A91827] focus:border-[#A91827] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Provide feedback on this resume..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="px-4 py-2 bg-[#A91827] hover:bg-[#8a1420] text-white rounded-md flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

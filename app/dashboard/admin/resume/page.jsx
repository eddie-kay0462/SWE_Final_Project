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
      const supabase = createClient()
      
      // Update document with feedback
      const { error: docError } = await supabase
        .from('documents')
        .update({ 
          feedback: feedbackText,
          status: feedbackText.trim() ? 'Needs Edits' : 'Pending Review'
        })
        .eq('id', selectedResume.id)
      
      if (docError) {
        console.error('[AdvisorDashboard] Document update error:', docError)
        toast.error('Failed to submit feedback')
        return
      }

      // Create notification for student
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: selectedResume.users.id,
          type: 'feedback',
          title: 'Resume Feedback Received',
          message: feedbackText.substring(0, 100) + (feedbackText.length > 100 ? '...' : ''),
          document_id: selectedResume.id,
          metadata: {
            resumeName: selectedResume.name,
            fullFeedback: feedbackText,
            status: selectedResume.status
          }
        }])

      if (notifError) {
        console.error('[AdvisorDashboard] Notification creation error:', notifError)
        // Even if notification fails, feedback was still saved
        toast.success('Feedback submitted successfully (notification delivery failed)')
        setShowFeedbackModal(false)
        return
      }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">Resume Reviews</h1>
        <p className="mt-2 text-gray-600 dark:text-neutral-400">Review and manage student resume submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Total Submissions</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-neutral-100">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 bg-gray-100 dark:bg-[#262626] rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600 dark:text-neutral-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Pending Review</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{stats.pending}</h3>
            </div>
            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Approved</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.approved}</h3>
            </div>
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Needs Edits</p>
              <h3 className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{stats.needsEdits}</h3>
            </div>
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Resume Submissions Section */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-[#262626]">
          <h2 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Resume Submissions</h2>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-[#262626] space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#363636] rounded-lg bg-white dark:bg-[#161616] text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A91827] focus:border-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  // Cycle through status options
                  const statusOptions = ["All", "Pending Review", "Approved", "Needs Edits"]
                  const currentIndex = statusOptions.indexOf(statusFilter)
                  const nextIndex = (currentIndex + 1) % statusOptions.length
                  setStatusFilter(statusOptions[nextIndex])
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-[#262626] border border-gray-300 dark:border-[#363636] rounded-lg text-gray-700 dark:text-neutral-100 hover:bg-gray-50 dark:hover:bg-[#363636] focus:outline-none focus:ring-2 focus:ring-[#A91827] focus:border-transparent flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Status: {statusFilter}
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#161616] border-b border-gray-200 dark:border-[#262626]">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-neutral-400"
                  >
                    File Name
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('user_fname')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-neutral-400"
                  >
                    Student
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('uploaded_at')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-neutral-400"
                  >
                    Uploaded
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-neutral-400"
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading resumes...
                    </div>
                  </td>
                </tr>
              ) : filteredResumes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-neutral-400">
                    No resumes found
                  </td>
                </tr>
              ) : (
                filteredResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50 dark:hover:bg-[#161616]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                        <span className="text-sm text-gray-900 dark:text-neutral-100">{resume.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                            {resume.users?.fname} {resume.users?.lname}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-neutral-400">
                            {resume.users?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500 dark:text-neutral-400">
                        {new Date(resume.uploaded_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusIcon(resume.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewResume(resume.file_url)}
                          className="p-1 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200"
                          title="View Resume"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openFeedbackModal(resume)}
                          className="p-1 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200"
                          title="Add Feedback"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <select
                          value={resume.status}
                          onChange={(e) => handleStatusChange(resume.id, e.target.value)}
                          className="text-sm border border-gray-300 dark:border-[#363636] rounded-lg bg-white dark:bg-[#262626] text-gray-700 dark:text-neutral-100 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#A91827] focus:border-transparent"
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Needs Edits">Needs Edits</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-lg max-w-lg w-full">
            <div className="p-4 border-b border-gray-200 dark:border-[#262626] flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100">
                Add Feedback
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter your feedback here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#363636] rounded-lg bg-white dark:bg-[#161616] text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A91827] focus:border-transparent"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-neutral-100 bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#363636] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] focus:ring-offset-2 dark:focus:ring-offset-[#1c1c1c]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="px-4 py-2 bg-[#A91827] hover:bg-[#A91827]/90 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] focus:ring-offset-2 dark:focus:ring-offset-[#1c1c1c] flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

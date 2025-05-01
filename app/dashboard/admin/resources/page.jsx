/**
 * Admin Resources Page
 *
 * Allows administrators to manage career resources including:
 * - Uploading new resources
 * - Deleting existing resources
 * - Viewing resource requests
 * - Tracking resource analytics
 */

"use client"

import { useState, useEffect } from "react"
import {
  Search,
  FileText,
  Download,
  Upload,
  Trash2,
  Tag,
  Filter,
  X,
  ChevronDown,
  Eye,
  CheckCircle,
  BarChart2,
  Clock,
  User,
  RefreshCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function AdminResourcesPage() {
  const router = useRouter()
  const { authUser, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("resources")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [resourceFile, setResourceFile] = useState(null)
  const [resourceDetails, setResourceDetails] = useState({
    title: "",
    description: "",
    category: "",
  })
  const [viewRequestDialogOpen, setViewRequestDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resources, setResources] = useState([])
  const [resourceRequests, setResourceRequests] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false)
  const [topResources, setTopResources] = useState([])
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const supabase = createClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [requestsLoading, setRequestsLoading] = useState(true)

  /**
   * Checks if user is authenticated and has admin privileges
   */
  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        console.log("[AdminResources] No authenticated user, redirecting to login")
        router.push("/auth/login")
        return
      }

      // Check if user is admin or super admin
      checkAdminRole()
    }
  }, [authUser, authLoading, router])

  /**
   * Checks if the current user has admin privileges
   */
  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase.from("users").select("role_id").eq("email", authUser.email).single()

      if (error) throw error

      // If not admin or super admin, redirect to dashboard
      if (data.role_id !== 1 && data.role_id !== 2) {
        console.log("[AdminResources] User is not an admin, redirecting to dashboard")
        router.push("/dashboard/student")
        return
      }

      // If admin, fetch resources and requests
      fetchResources()
      fetchResourceRequests()
      fetchCategories()
      fetchTopResources()
    } catch (error) {
      console.error("[AdminResources] Role check error:", error)
      router.push("/dashboard/student")
    }
  }

  /**
   * Fetches all resources from Supabase
   */
  const fetchResources = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("resources")
        .select(`
          id, 
          title, 
          description, 
          file_url, 
          file_type, 
          file_size, 
          uploaded_at, 
          downloads,
          category_id, 
          resource_categories(name)
        `)
        .order("uploaded_at", { ascending: false })

      if (error) throw error

      // Format the resources data
      const formattedResources = data.map((resource) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        category: resource.resource_categories?.name || "Uncategorized",
        categoryId: resource.category_id,
        type: resource.file_type?.toUpperCase() || "PDF",
        size: formatFileSize(resource.file_size),
        updated: formatTimeAgo(resource.uploaded_at),
        downloads: resource.downloads,
        fileUrl: resource.file_url,
      }))

      setResources(formattedResources)
    } catch (error) {
      console.error("[AdminResources] Fetch error:", error)
      toast({
        title: "Failed to load resources",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Fetches all resource requests from Supabase
   */
  const fetchResourceRequests = async () => {
    try {
      setRequestsLoading(true)
      const { data, error } = await supabase
        .from('resource_requests')
        .select(`
          *,
          users (
            fname,
            lname,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setResourceRequests(data)
    } catch (error) {
      console.error('Error fetching resource requests:', error)
      toast.error('Failed to load resource requests')
    } finally {
      setRequestsLoading(false)
    }
  }

  /**
   * Fetches all resource categories from Supabase
   */
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("resource_categories").select("id, name").order("name")

      if (error) throw error

      setCategories(data)
    } catch (error) {
      console.error("[AdminResources] Categories fetch error:", error)
      toast({
        title: "Failed to load categories",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  /**
   * Fetches top downloaded resources for analytics
   */
  const fetchTopResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select(`
          id, 
          title, 
          downloads,
          resource_categories(name)
        `)
        .order("downloads", { ascending: false })
        .limit(10)

      if (error) throw error

      setTopResources(
        data.map((resource) => ({
          id: resource.id,
          title: resource.title,
          category: resource.resource_categories?.name || "Uncategorized",
          downloads: resource.downloads,
        })),
      )
    } catch (error) {
      console.error("[AdminResources] Top resources fetch error:", error)
    }
  }

  /**
   * Formats file size in bytes to human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size"

    const kb = bytes / 1024
    if (kb < 1024) {
      return `${Math.round(kb)} KB`
    } else {
      return `${(kb / 1024).toFixed(1)} MB`
    }
  }

  /**
   * Formats timestamp to "time ago" format
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Time ago string
   */
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown date"

    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "just now"

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 5) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

  /**
   * Formats date to readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  /**
   * Handles file selection for resource upload
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        })
        return
      }

      setResourceFile(file)
    }
  }

  /**
   * Handles resource upload to Supabase
   */
  const handleUploadResource = async () => {
    if (!resourceFile) {
      toast({
        title: "Missing File",
        description: "Please upload a resource file.",
        variant: "destructive",
      })
      return
    }

    if (!resourceDetails.title || !resourceDetails.description || !resourceDetails.category) {
      toast({
        title: "Missing Information",
        description: "Please provide a title, description, and category for the resource.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // First get the public.users ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (userError || !userData) throw userError

      // Generate unique file path with timestamp
      const timestamp = new Date().getTime()
      const filePath = `resources/${resourceDetails.category.replace(/\s+/g, "_").toLowerCase()}/${timestamp}_${resourceFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

      // Upload file to storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, resourceFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("resources").getPublicUrl(filePath)

      // Insert into resources table
      const { error: dbError } = await supabase.from("resources").insert([
        {
          title: resourceDetails.title,
          description: resourceDetails.description,
          category_id: Number.parseInt(resourceDetails.category),
          file_url: publicUrl,
          file_type: resourceFile.type.split("/")[1],
          file_size: resourceFile.size,
          uploaded_by: userData.id,
        },
      ])

      if (dbError) throw dbError

      toast({
        title: "Resource Uploaded",
        description: "The resource has been successfully uploaded.",
      })

      // Reset form and refresh resources
      setUploadDialogOpen(false)
      setResourceFile(null)
      setResourceDetails({
        title: "",
        description: "",
        category: "",
      })
      fetchResources()
      fetchTopResources()
    } catch (error) {
      console.error("[AdminResources] Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Directly deletes a resource with inline confirmation
   * @param {Object} resource - Resource to delete
   */
  const handleDeleteResource = async (resource) => {
    try {
      console.log("handleDeleteResource called with resource:", resource.id)

      // Alert for debugging
      // alert(`Attempting to delete resource: ${resource.title} (ID: ${resource.id})`)

      // Reset the resourceToDelete state
      setResourceToDelete(null)

      // First delete from database
      const { error: dbError } = await supabase.from("resources").delete().eq("id", resource.id)

      if (dbError) {
        console.error("Database deletion error:", dbError)
        toast({
          title: "Delete Failed",
          description: `Database error: ${dbError.message}`,
          variant: "destructive",
        })
        return
      }

      // Update local state immediately
      setResources(resources.filter((r) => r.id !== resource.id))

      toast({
        title: "Resource Deleted",
        description: "The resource has been successfully deleted.",
      })

      // Try to delete from storage in the background
      try {
        // We'll attempt to delete from storage, but won't block on it
        const fileUrl = resource.fileUrl
        console.log("Attempting to delete file:", fileUrl)

        // This is a background operation - we don't wait for it
        supabase.storage
          .from("resources")
          .remove([fileUrl])
          .then((result) => {
            console.log("Storage deletion result:", result)
          })
          .catch((err) => {
            console.warn("Storage deletion error (non-blocking):", err)
          })
      } catch (storageError) {
        console.warn("Storage deletion setup error (non-blocking):", storageError)
      }

      // Refresh analytics in the background
      fetchTopResources()
    } catch (error) {
      console.error("Delete process failed:", error)
      toast({
        title: "Delete Failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  /**
   * Opens request details dialog
   * @param {Object} request - Request to view
   */
  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setViewRequestDialogOpen(true)
  }

  /**
   * Clears a resource request from the list
   * @param {number} requestId - ID of request to clear
   */
  const handleClearRequest = async (requestId) => {
    try {
      console.log("Clearing request with ID:", requestId)

      // Update the request status to "cleared" instead of deleting
      const { error } = await supabase.from("resource_requests").update({ status: "cleared" }).eq("id", requestId)

      if (error) {
        console.error("Update operation error:", error)
        throw error
      }

      // Update local state - remove the cleared request
      setResourceRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId))

      toast({
        title: "Request Cleared",
        description: "The resource request has been cleared.",
      })

      // Close dialog if open
      if (viewRequestDialogOpen) {
        setViewRequestDialogOpen(false)
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error("[AdminResources] Clear request error:", error)
      toast({
        title: "Action Failed",
        description: error.message || "Failed to clear the request. Please try again.",
        variant: "destructive",
      })
    }
  }

  /**
   * Clears all pending resource requests
   */
  const handleClearAllRequests = async () => {
    try {
      console.log("Clearing all pending requests")

      // Update all pending requests to "cleared" status
      const { error } = await supabase.from("resource_requests").update({ status: "cleared" }).eq("status", "pending")

      if (error) {
        console.error("Update all operation error:", error)
        throw error
      }

      // Update local state - remove all pending requests
      setResourceRequests((prevRequests) => prevRequests.filter((req) => req.status !== "pending"))

      toast({
        title: "All Requests Cleared",
        description: "All pending resource requests have been cleared.",
      })
    } catch (error) {
      console.error("[AdminResources] Clear all requests error:", error)
      toast({
        title: "Action Failed",
        description: error.message || "Failed to clear requests. Please try again.",
        variant: "destructive",
      })
    }
  }

  /**
   * Creates a new resource category
   */
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a category name.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // First get the public.users ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (userError || !userData) throw userError

      // Insert new category
      const { data, error } = await supabase
        .from("resource_categories")
        .insert([
          {
            name: newCategoryName.trim(),
            created_by: userData.id,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Category Created",
        description: "The new category has been created successfully.",
      })

      // Reset form and refresh categories
      setNewCategoryDialogOpen(false)
      setNewCategoryName("")
      fetchCategories()
    } catch (error) {
      console.error("[AdminResources] Create category error:", error)
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter resources based on search query and selected category
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Filter resource requests based on search query
  const filteredRequests = resourceRequests.filter((request) => {
    return (
      request.resource_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.users.fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.users.lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.users.email.includes(searchQuery)
    )
  })

  // Get pending requests count
  const pendingRequestsCount = resourceRequests.filter((req) => req.status === "pending").length

  // Add Supabase subscription for real-time updates
  useEffect(() => {
    if (!authUser) return

    // Subscribe to resource requests
    const channel = supabase
      .channel('admin-resource-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'resource_requests'
        },
        (payload) => {
          // Show toast notification for new requests
          toast.info("New Resource Request", {
            description: `A new resource has been requested: ${payload.new.resource_title}`,
            action: {
              label: "View",
              onClick: () => setActiveTab("requests")
            }
          })
          // Update requests list
          fetchResourceRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authUser])

  // Add this to your existing useEffect that runs on component mount
  useEffect(() => {
    if (authUser) {
      fetchResourceRequests()
    }
  }, [authUser])

  // Handle request status update
  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('resource_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) throw error

      // Update local state
      setResourceRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      )

      toast.success(`Request ${newStatus}`)
    } catch (error) {
      console.error('Error updating request status:', error)
      toast.error('Failed to update request status')
    }
  }

  // Add this section to your JSX where you want to display the requests
  const renderResourceRequests = () => {
    if (requestsLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading requests...</p>
        </div>
      )
    }

    if (resourceRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">No resource requests found.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {resourceRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{request.resource_title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.importance === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : request.importance === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {request.importance.charAt(0).toUpperCase() + request.importance.slice(1)} Priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' 
                        ? 'bg-blue-100 text-blue-800' 
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{request.reason}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{request.users.fname} {request.users.lname}</span>
                    <span>•</span>
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!authUser) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">Resources</h1>
          <p className="text-muted-foreground mt-1">Manage career resources for students</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log("Analytics button clicked")
              setAnalyticsDialogOpen(true)
            }}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          {/* Upload Resource Button */}
          <Button
            onClick={() => {
              console.log("Upload button clicked")
              setUploadDialogOpen(true)
            }}
            className="bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2 " />
            Upload Resource
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-4 ${activeTab === "resources" ? "border-b-2 border-[#A91827] text-[#A91827]" : "text-muted-foreground"}`}
          onClick={() => setActiveTab("resources")}
        >
          Resources
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === "requests" ? "border-b-2 border-[#A91827] text-[#A91827]" : "text-muted-foreground"}`}
          onClick={() => setActiveTab("requests")}
        >
          Resource Requests{" "}
          {pendingRequestsCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={activeTab === "resources" ? "Search resources..." : "Search requests..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === "resources" && (
            <div className="relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <select
                className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resources Tab Content */}
      {activeTab === "resources" && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-background border border-border rounded-lg shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <div className="h-6 w-40 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6 pt-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold">{resource.title}</h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{resource.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs px-2 py-1 bg-accent flex items-center text-white rounded-lg">
                          <Tag className="h-3 w-3 mr-1" />
                          {resource.category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-accent rounded-full flex items-center text-white">
                          <FileText className="h-3 w-3 mr-1" />
                          {resource.type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-accent rounded-full flex items-center text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          {resource.updated}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{resource.downloads} downloads</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(resource.fileUrl, "_blank")}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log("Delete button clicked for resource:", resource.id)
                              setResourceToDelete(resource)
                              setDeleteDialogOpen(true)
                              console.log("deleteDialogOpen set to:", true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">No resources found matching your criteria.</p>
                  <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                    Upload New Resource
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Resource Requests Tab Content */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Resource Requests</h2>
            <Button
              variant="outline"
              onClick={fetchResourceRequests}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          {renderResourceRequests()}
        </div>
      )}

      {/* New Category Dialog */}
      <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <input
                id="category-name"
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNewCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog - Direct Implementation */}
      {analyticsDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              console.log("Analytics backdrop clicked, closing dialog")
              setAnalyticsDialogOpen(false)
            }}
          />
          <div className="relative z-[101] w-full max-w-lg bg-background p-6 rounded-lg shadow-lg border overflow-y-auto max-h-[90vh]">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setAnalyticsDialogOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only ">Close</span>
            </button>

            <h2 className="text-lg font-semibold mb-4">Resource Analytics</h2>

            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Top Downloaded Resources</h3>
                <div className="space-y-2">
                  {topResources.length > 0 ? (
                    topResources.map((resource, index) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">{index + 1}.</span>
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.category}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{resource.downloads} downloads</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">No download data available yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Resource Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{resources.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {resources.reduce((total, resource) => total + resource.downloads, 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{categories.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{pendingRequestsCount}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 ">
              <Button onClick={() => setAnalyticsDialogOpen(false)} className="bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Resource Dialog - Simplified */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setUploadDialogOpen(false)} />
          <div
            className="relative z-50 w-full max-w-md bg-background p-6 rounded-lg shadow-lg border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setUploadDialogOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>

            <h2 className="text-lg font-semibold mb-4 ">Upload Resource</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-title">Resource Title</Label>
                <input
                  id="resource-title"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter resource title"
                  value={resourceDetails.title}
                  onChange={(e) => setResourceDetails({ ...resourceDetails, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-description">Description</Label>
                <textarea
                  id="resource-description"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Enter resource description"
                  value={resourceDetails.description}
                  onChange={(e) => setResourceDetails({ ...resourceDetails, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="resource-category">Category</Label>
                  {/* <Button variant="ghost" size="sm" className="text-xs" onClick={() => setNewCategoryDialogOpen(true)}>
                    + New Category
                  </Button> */}
                </div>
                <select
                  id="resource-category"
                  className="w-full p-2 border rounded-md"
                  value={resourceDetails.category}
                  onChange={(e) => setResourceDetails({ ...resourceDetails, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-file">Resource File</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="resource-file"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      resourceFile ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {resourceFile ? (
                        <>
                          <CheckCircle className="w-8 h-8 mb-3 text-green-500" />
                          <p className="mb-2 text-sm text-green-700 font-medium">File selected</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-3 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                        </>
                      )}
                      <p className="text-xs text-gray-500">PDF only (MAX. 5MB)</p>
                    </div>
                    <input
                      id="resource-file"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {resourceFile && (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 truncate">{resourceFile.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => setResourceFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadResource} disabled={isSubmitting} className="bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors">
                {isSubmitting ? "Uploading..." : "Upload Resource"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Resource Confirmation Dialog - Simplified Direct Implementation */}
      {deleteDialogOpen && resourceToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              console.log("Backdrop clicked, closing dialog")
              setDeleteDialogOpen(false)
            }}
          />
          <div className="relative z-[101] w-full max-w-md bg-background p-6 rounded-lg shadow-lg border">
            <h2 className="text-lg font-semibold mb-4">Delete Resource</h2>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{resourceToDelete.title}"? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log("Cancel button clicked")
                  setDeleteDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  console.log("Confirm delete clicked for resource:", resourceToDelete.id)
                  handleDeleteResource(resourceToDelete)
                  setDeleteDialogOpen(false)
                }}
              >
                Delete Resource
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

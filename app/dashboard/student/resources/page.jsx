/**
 * Student Resources Page
 *
 * Allows students to browse, download, and request career resources
 * with filtering, search, and resource request functionality.
 */

"use client"

import React, { useState, useEffect } from "react"
import { FileText, Download, Search, Filter, Tag, Clock, Star, Plus, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function ResourcesPage() {
  const router = useRouter()
  const { authUser, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({
    resourceTitle: "",
    reason: "",
    importance: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resources, setResources] = useState([])
  const [categories, setCategories] = useState(["All"])
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteResources, setFavoriteResources] = useState([])
  const supabase = createClient()
   // Add a favorites filter state
  const [showFavorites, setShowFavorites] = useState(false)



  /**
   * Checks if user is authenticated and redirects to login if not
   */
  useEffect(() => {
    if (!authLoading && !authUser) {
      console.log("[Resources] No authenticated user, redirecting to login")
      router.push("/auth/login")
      return
    }
  }, [authUser, authLoading, router])

  /**
   * Fetches resources and categories when component mounts
   */
  useEffect(() => {
    if (authUser) {
      fetchResources()
      fetchCategories()
      fetchFavorites()
    }
  }, [authUser])

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
        type: resource.file_type?.toUpperCase() || "PDF",
        size: formatFileSize(resource.file_size),
        updated: formatTimeAgo(resource.uploaded_at),
        downloads: resource.downloads,
        fileUrl: resource.file_url,
        starred: false, // Will be updated after fetching favorites
      }))

      setResources(formattedResources)
    } catch (error) {
      console.error("[Resources] Fetch error:", error)
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
   * Fetches all resource categories from Supabase
   */
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("resource_categories").select("name").order("name")

      if (error) throw error

      // Add "All" category at the beginning
      setCategories(["All", ...data.map((category) => category.name)])
    } catch (error) {
      console.error("[Resources] Categories fetch error:", error)
      toast({
        title: "Failed to load categories",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  /**
   * Fetches user's favorite resources
   */
  const fetchFavorites = async () => {
    if (!authUser) return

    try {
      // First get the public.users ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (userError || !userData) throw userError

      // Then get favorites for that user
      const { data, error } = await supabase.from("resource_favorites").select("resource_id").eq("user_id", userData.id)

      if (error) throw error

      // Store favorite resource IDs
      const favoriteIds = data.map((fav) => fav.resource_id)
      setFavoriteResources(favoriteIds)

      // Update starred status in resources
      setResources((prevResources) =>
        prevResources.map((resource) => ({
          ...resource,
          starred: favoriteIds.includes(resource.id),
        })),
      )
    } catch (error) {
      console.error("[Resources] Favorites fetch error:", error)
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
   * Handles form input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Handles select input changes
   * @param {string} name - Field name
   * @param {string} value - Field value
   */
  const handleSelectChange = (name, value) => {
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Handles resource download
   * @param {Object} resource - Resource to download
   */
  const handleDownload = async (resource) => {
    try {
      // First get the public.users ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (userError || !userData) throw userError

      // Increment download count
      const { error } = await supabase.rpc("increment_resource_download", { resource_id: resource.id })

      if (error) throw error

      // Update local state
      setResources((prevResources) =>
        prevResources.map((r) => (r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r)),
      )

      // Open the file in a new tab
      window.open(resource.fileUrl, "_blank")
    } catch (error) {
      console.error("[Resources] Download error:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading this resource.",
        variant: "destructive",
      })
    }
  }

  /**
   * Toggles resource favorite status
   * @param {Object} resource - Resource to toggle
   */
  const handleToggleFavorite = async (resource) => {
    if (!authUser) return

    try {
      // First get the public.users ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (userError || !userData) throw userError

      if (resource.starred) {
        // Remove from favorites
        const { error } = await supabase
          .from("resource_favorites")
          .delete()
          .eq("resource_id", resource.id)
          .eq("user_id", userData.id)

        if (error) throw error

        // Update local state
        setFavoriteResources((prev) => prev.filter((id) => id !== resource.id))
        setResources((prevResources) => prevResources.map((r) => (r.id === resource.id ? { ...r, starred: false } : r)))

        toast({
          title: "Removed from favorites",
          description: `"${resource.title}" has been removed from your favorites.`,
        })
      } else {
        // Add to favorites
        const { error } = await supabase.from("resource_favorites").insert([
          {
            resource_id: resource.id,
            user_id: userData.id,
          },
        ])

        if (error) throw error

        // Update local state
        setFavoriteResources((prev) => [...prev, resource.id])
        setResources((prevResources) => prevResources.map((r) => (r.id === resource.id ? { ...r, starred: true } : r)))

        toast({
          title: "Added to favorites",
          description: `"${resource.title}" has been added to your favorites.`,
        })
      }
    } catch (error) {
      console.error("[Resources] Favorite toggle error:", error)
      toast({
        title: "Action failed",
        description: "There was an error updating your favorites.",
        variant: "destructive",
      })
    }
  }

  /**
   * Submits resource request
   */
  const handleRequestSubmit = async () => {
    if (!authUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to request resources.",
        variant: "destructive",
      })
      return
    }

    if (!requestForm.resourceTitle || !requestForm.reason) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
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

      // Insert resource request
      const { error } = await supabase.from("resource_requests").insert([
        {
          resource_title: requestForm.resourceTitle,
          reason: requestForm.reason,
          importance: requestForm.importance,
          user_id: userData.id,
        },
      ])

      if (error) throw error

      toast({
        title: "Request Submitted",
        description: "Your resource request has been submitted. We'll notify you when it's available.",
      })

      // Reset form
      setRequestForm({
        resourceTitle: "",
        reason: "",
        importance: "medium",
      })
      setShowRequestModal(false)
    } catch (error) {
      console.error("[Resources] Request submit error:", error)
      toast({
        title: "Request failed",
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
    const matchesFavorites = showFavorites ? resource.starred : true
    return matchesSearch && matchesCategory && matchesFavorites
  })

  // Effect to prevent body scrolling when modal is open
  React.useEffect(() => {
    if (showRequestModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [showRequestModal])

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
          <p className="text-muted-foreground mt-1">Access templates, guides, and tools for your career development</p>
        </div>
        <Button onClick={() => setShowRequestModal(true)} className="bg-[#A91827]">
          <Plus className="h-4 w-4 mr-2" />
          Request Resource
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <select
              className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Button
            variant={showFavorites ? "default" : "outline"}
            className={showFavorites ? "bg-[#A91827]" : ""}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Star className={`h-4 w-4 mr-2 ${showFavorites ? "fill-white" : ""}`} />
            {showFavorites ? "All Resources" : "Favorites"}
          </Button>
        </div>
      </div>

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
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
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
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-background border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(resource)}
                    className="text-gray-400 hover:text-amber-400 focus:outline-none"
                  >
                    <Star className={`h-5 w-5 ${resource.starred ? "text-amber-400 fill-amber-400" : ""}`} />
                  </button>
                </div>
                <p className="text-muted-foreground mb-4">{resource.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-muted rounded-full flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {resource.category}
                  </span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {resource.type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {resource.updated}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{resource.downloads} downloads</span>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-[#A91827] text-white text-xs font-medium"
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredResources.length === 0 && (
        <div className="text-center py-12 bg-background border border-border rounded-lg shadow-sm">
          <p className="text-lg text-muted-foreground">No resources found matching your criteria.</p>
          <Button onClick={() => setShowRequestModal(true)} className="mt-4">
            Request a Resource
          </Button>
        </div>
      )}

      {/* Resource Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />

          {/* Modal Content */}
          <div className="relative z-50 w-full max-w-md bg-background p-6 rounded-lg shadow-lg border">
            {/* Close Button */}
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowRequestModal(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Request a Resource</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill out this form to request a resource that would help with your career development.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resourceTitle">Resource Title/Type</Label>
                <Input
                  id="resourceTitle"
                  name="resourceTitle"
                  placeholder="E.g., Resume Templates, Cover Letters, Interview Prep..."
                  value={requestForm.resourceTitle}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Please explain why you need this resource and how it would help you..."
                  value={requestForm.reason}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="importance">Importance</Label>
                <select
                  id="importance"
                  name="importance"
                  className="w-full p-2 border rounded-md"
                  value={requestForm.importance}
                  onChange={handleInputChange}
                >
                  <option value="low">Low - Nice to have</option>
                  <option value="medium">Medium - Would be helpful</option>
                  <option value="high">High - Urgently needed</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestSubmit} disabled={isSubmitting} className="bg-[#A91827] text-white">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

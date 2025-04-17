"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { useState } from "react"
import { Search, Plus, FileText, Download, Upload, Trash2, Tag, Filter, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import React from "react"

export default function AdminResourcesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("resources")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [uploadedFile, setUploadedFile] = useState(null)
  const [resourceTitle, setResourceTitle] = useState("")
  const [resourceDescription, setResourceDescription] = useState("")
  const [resourceCategory, setResourceCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add this useEffect near the top of the component with the other hooks
  React.useEffect(() => {
    if (uploadDialogOpen || deleteDialogOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [uploadDialogOpen, deleteDialogOpen])

  // Mock categories
  const categories = [
    "All",
    "Resume Templates",
    "Cover Letters",
    "Interview Prep",
    "Career Guides",
    "Industry Research",
  ]

  // Mock resources data
  const [resources, setResources] = useState([
    {
      id: 1,
      title: "Professional Resume Template",
      description: "A clean and modern resume template suitable for all professional fields.",
      category: "Resume Templates",
      type: "PDF",
      size: "245 KB",
      updated: "2 weeks ago",
      downloads: 328,
      starred: true,
    },
    {
      id: 2,
      title: "Cover Letter Writing Guide",
      description: "Learn how to write compelling cover letters that grab employers' attention.",
      category: "Cover Letters",
      type: "PDF",
      size: "1.2 MB",
      updated: "1 month ago",
      downloads: 156,
      starred: false,
    },
    {
      id: 3,
      title: "STAR Method Interview Preparation",
      description: "Prepare for behavioral interviews using the Situation, Task, Action, Result method.",
      category: "Interview Prep",
      type: "PDF",
      size: "560 KB",
      updated: "3 weeks ago",
      downloads: 247,
      starred: true,
    },
    {
      id: 4,
      title: "Creative Field Resume Template",
      description: "Designed specifically for creative professionals to showcase their skills and experience.",
      category: "Resume Templates",
      type: "DOCX",
      size: "350 KB",
      updated: "5 days ago",
      downloads: 102,
      starred: false,
    },
  ])

  // Change from constant to state
  const [resourceRequests, setResourceRequests] = useState([
    {
      id: 1,
      studentName: "John Doe",
      studentId: "20242025",
      resourceTitle: "Finance Industry Career Guide",
      reason:
        "I'm planning to pursue a career in finance after graduation and would like resources specific to this industry.",
      importance: "High",
      requestDate: "April 2, 2025",
      status: "pending",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "20242026",
      resourceTitle: "Negotiation Skills Guide",
      reason: "I want to improve my salary negotiation skills for upcoming job offers.",
      importance: "Medium",
      requestDate: "March 28, 2025",
      status: "pending",
    },
    {
      id: 3,
      studentName: "Michael Johnson",
      studentId: "20242027",
      resourceTitle: "Remote Work Best Practices",
      reason: "I'm targeting remote positions and want to learn how to be effective in a remote work environment.",
      importance: "Medium",
      requestDate: "March 25, 2025",
      status: "approved",
    },
    {
      id: 4,
      studentName: "Emily Williams",
      studentId: "20242028",
      resourceTitle: "Networking in Tech Industry",
      reason: "I would like to build my professional network in the tech industry but don't know where to start.",
      importance: "High",
      requestDate: "March 20, 2025",
      status: "rejected",
      rejectionReason: "Similar content already available in 'Networking 101' resource",
    },
  ])

  // Filter resources based on search query and selected category
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Filter requests based on status
  const pendingRequests = resourceRequests.filter((req) => req.status === "pending")
  const approvedRequests = resourceRequests.filter((req) => req.status === "approved")
  const rejectedRequests = resourceRequests.filter((req) => req.status === "rejected")

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }
      setUploadedFile(file)
    }
  }

  const handleUploadResource = () => {
    if (!uploadedFile) {
      toast({
        title: "Missing File",
        description: "Please upload a file for this resource.",
        variant: "destructive",
      })
      return
    }

    if (!resourceTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for this resource.",
        variant: "destructive",
      })
      return
    }

    if (!resourceDescription.trim()) {
      toast({
        title: "Missing Description",
        description: "Please provide a description for this resource.",
        variant: "destructive",
      })
      return
    }

    if (!resourceCategory) {
      toast({
        title: "Missing Category",
        description: "Please select a category for this resource.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newResource = {
        id: resources.length + 1,
        title: resourceTitle,
        description: resourceDescription,
        category: resourceCategory,
        type: uploadedFile.name.split(".").pop().toUpperCase(),
        size: `${Math.round(uploadedFile.size / 1024)} KB`,
        updated: "Just now",
        downloads: 0,
        starred: false,
      }

      setResources([newResource, ...resources])
      setUploadDialogOpen(false)
      setUploadedFile(null)
      setResourceTitle("")
      setResourceDescription("")
      setResourceCategory("")
      setIsSubmitting(false)

      toast({
        title: "Resource Uploaded",
        description: "The resource has been successfully uploaded.",
      })
    }, 1500)
  }

  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (resourceToDelete) {
      setResources(resources.filter((resource) => resource.id !== resourceToDelete.id))
      setDeleteDialogOpen(false)

      toast({
        title: "Resource Deleted",
        description: `"${resourceToDelete.title}" has been deleted.`,
      })
    }
  }

  const handleClearRequest = (requestId) => {
    // Update the state by filtering out the cleared request
    setResourceRequests(resourceRequests.filter((req) => req.id !== requestId))

    toast({
      title: "Request Cleared",
      description: "The resource request has been cleared from your list.",
    })
  }

  const handleClearAllRequests = () => {
    // Clear all pending requests by filtering them out
    setResourceRequests(resourceRequests.filter((req) => req.status !== "pending"))

    toast({
      title: "All Requests Cleared",
      description: "All pending resource requests have been cleared from your list.",
    })
  }

  const handleApproveRequest = (requestId) => {
    // Simulate API call
    toast({
      title: "Request Approved",
      description: "The resource request has been approved.",
    })
  }

  const handleRejectRequest = (requestId) => {
    // Simulate API call
    toast({
      title: "Request Rejected",
      description: "The resource request has been rejected.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">Resources</h1>
          <p className="text-muted-foreground mt-1">Manage resources for student career development</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="bg-[#A91827] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="requests">Resource Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{resource.title}</h3>
                          <p className="text-muted-foreground mt-1">{resource.description}</p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-[#A91827] text-white text-xs px-2 py-1 bg-accent rounded-full flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              {resource.category}
                            </span>
                            <span className="bg-[#A91827] text-white text-xs px-2 py-1 bg-accent rounded-full">
                              {resource.type} • {resource.size}
                            </span>
                            {/* <span className="text-xs px-2 py-1 bg-accent rounded-full">Updated {resource.updated}</span> */}
                            {/* <span className="text-xs px-2 py-1 bg-accent rounded-full">
                              {resource.downloads} downloads
                            </span> */}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteClick(resource)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No resources found matching your criteria.</p>
                  <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload New Resource
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">Resource Requests</h3>
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {pendingRequests.length} pending
              </span>
            </div>
            {pendingRequests.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllRequests}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Requests
              </Button>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This section shows resource requests from students. You can view the details and
              clear requests from your list. There is no approval or rejection functionality as these are just
              informational requests.
            </p>
          </div>

          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between">
                      <span>{request.resourceTitle}</span>
                      {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {request.importance} Priority
                      </span> */}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="mb-4">
                      <div className="text-sm mb-1">
                        <span className="font-medium">Requested by:</span> {request.studentName} (ID:{" "}
                        {request.studentId})
                      </div>
                      <div className="text-sm mb-2">
                        <span className="font-medium">Date:</span> {request.requestDate}
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-md mb-4">
                      <p className="font-medium mb-1">Reason for Request:</p>
                      <p className="text-sm">{request.reason}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleClearRequest(request.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Request
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center py-12">
                  <p className="text-muted-foreground">No pending resource requests.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Resource Modal */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setUploadDialogOpen(false)} />

          {/* Modal Content */}
          <div className="relative z-50 w-full max-w-md bg-background p-6 rounded-lg shadow-lg border">
            {/* Close Button */}
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setUploadDialogOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Upload Resource</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill out this form to upload a new resource for students.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-title">Resource Title</Label>
                <Input
                  id="resource-title"
                  placeholder="Enter resource title"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-description">Description</Label>
                <Textarea
                  id="resource-description"
                  placeholder="Enter resource description"
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-category">Category</Label>
                <select
                  id="resource-category"
                  className="w-full p-2 border rounded-md"
                  value={resourceCategory}
                  onChange={(e) => setResourceCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    uploadedFile ? "border-green-300 bg-green-50" : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setUploadedFile(e.dataTransfer.files[0])
                    }
                  }}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <FileText className="w-10 h-10 mb-2 text-green-500" />
                      <p className="mb-1 text-sm font-medium text-green-700">{uploadedFile.name}</p>
                      <p className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setUploadedFile(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Clear file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 text-center">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOCX, or other document formats</p>
                      <input type="file" className="hidden" id="file-upload" onChange={handleFileChange} />
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => document.getElementById("file-upload").click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false)
                  setUploadedFile(null)
                  setResourceTitle("")
                  setResourceDescription("")
                  setResourceCategory("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadResource}
                disabled={isSubmitting || !uploadedFile || !resourceTitle || !resourceDescription || !resourceCategory}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Uploading...</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Resource Modal */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteDialogOpen(false)} />

          {/* Modal Content */}
          <div className="relative z-50 w-full max-w-md bg-background p-6 rounded-lg shadow-lg border">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Delete Resource</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to delete the resource "{resourceToDelete?.title}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

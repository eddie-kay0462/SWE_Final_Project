"use client"

import { useState } from "react"
import { FileText, Download, Upload, Trash2, Search, Filter, Tag, Clock, Eye, CheckCircle, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminResourcesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("resources")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [resourceFile, setResourceFile] = useState(null)
  const [resourceDetails, setResourceDetails] = useState({
    title: "",
    description: "",
    category: "Resume Templates",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [viewRequestDialogOpen, setViewRequestDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const allResources = [
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
    {
      id: 5,
      title: "Technology Industry Career Guide",
      description: "Comprehensive guide to navigating careers in the technology sector.",
      category: "Career Guides",
      type: "PDF",
      size: "4.5 MB",
      updated: "2 months ago",
      downloads: 198,
      starred: true,
    },
  ]

  // Mock resource requests
  const resourceRequests = [
    {
      id: 1,
      studentName: "John Doe",
      studentId: "20242025",
      resourceTitle: "Finance Industry Guide",
      reason:
        "I'm interested in pursuing a career in finance and would like to learn more about the industry landscape and career paths.",
      importance: "High",
      status: "pending",
      date: "March 25, 2025",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "20242026",
      resourceTitle: "Consulting Case Interview Guide",
      reason: "I have upcoming interviews with consulting firms and need help preparing for case interviews.",
      importance: "High",
      status: "approved",
      date: "March 20, 2025",
    },
    {
      id: 3,
      studentName: "Michael Johnson",
      studentId: "20242027",
      resourceTitle: "Data Science Resume Examples",
      reason: "I'm transitioning to a data science role and need examples of effective resumes in this field.",
      importance: "Medium",
      status: "rejected",
      reason: "Similar resources already available in the Data Science Career Guide.",
      date: "March 15, 2025",
    },
  ]

  // Filter resources based on search query and selected category
  const filteredResources = allResources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Filter resource requests based on search query
  const filteredRequests = resourceRequests.filter((request) => {
    return (
      request.resourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentId.includes(searchQuery)
    )
  })

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResourceFile(e.target.files[0])
    }
  }

  const handleUploadResource = () => {
    if (!resourceFile) {
      toast({
        title: "Missing File",
        description: "Please upload a resource file.",
        variant: "destructive",
      })
      return
    }

    if (!resourceDetails.title || !resourceDetails.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description for the resource.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setUploadDialogOpen(false)
      setResourceFile(null)
      setResourceDetails({
        title: "",
        description: "",
        category: "Resume Templates",
      })

      toast({
        title: "Resource Uploaded",
        description: "The resource has been successfully uploaded.",
      })
    }, 1500)
  }

  const handleDeleteResource = (resource) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Simulate API call
    setTimeout(() => {
      setDeleteDialogOpen(false)
      setResourceToDelete(null)

      toast({
        title: "Resource Deleted",
        description: "The resource has been successfully deleted.",
      })
    }, 1000)
  }

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setViewRequestDialogOpen(true)
  }

  const handleApproveRequest = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setViewRequestDialogOpen(false)

      toast({
        title: "Request Approved",
        description: "The resource request has been approved.",
      })
    }, 1000)
  }

  const handleRejectRequest = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setViewRequestDialogOpen(false)

      toast({
        title: "Request Rejected",
        description: "The resource request has been rejected.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">Resources</h1>
          <p className="text-muted-foreground mt-1">Manage career resources for students</p>
        </div>

        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
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
          Resource Requests
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
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resources Tab Content */}
      {activeTab === "resources" && (
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
                    <span className="text-xs px-2 py-1 bg-accent rounded-full flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {resource.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-accent rounded-full flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {resource.type}
                    </span>
                    <span className="text-xs px-2 py-1 bg-accent rounded-full flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {resource.updated}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{resource.downloads} downloads</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteResource(resource)}
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
            </div>
          )}
        </div>
      )}

      {/* Resource Requests Tab Content */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6 pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{request.resourceTitle}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        Requested by: {request.studentName} (ID: {request.studentId})
                      </p>
                      <p className="text-muted-foreground">Date: {request.date}</p>
                      <p className="text-muted-foreground">Importance: {request.importance}</p>

                      {/* <div className="mt-4">
                        <p className="text-sm font-medium">Reason:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div> */}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No resource requests found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Upload Resource Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
              <Label htmlFor="resource-category">Category</Label>
              <select
                id="resource-category"
                className="w-full p-2 border rounded-md"
                value={resourceDetails.category}
                onChange={(e) => setResourceDetails({ ...resourceDetails, category: e.target.value })}
              >
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
                    <p className="text-xs text-gray-500">PDF, DOCX, or PPTX (MAX. 10MB)</p>
                  </div>
                  <input
                    id="resource-file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.pptx"
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadResource} disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Resource Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Request Dialog */}
      <Dialog open={viewRequestDialogOpen} onOpenChange={setViewRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resource Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-md">
                <h3 className="font-medium">{selectedRequest.resourceTitle}</h3>
                {/* <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-muted-foreground">Requested by: {selectedRequest.studentName}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedRequest.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedRequest.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                </div> */}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Student Information</h3>
                <div className="p-3 bg-muted rounded-md">
                  <p>
                    <span className="font-medium">Name:</span> {selectedRequest.studentName}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span> {selectedRequest.studentId}
                  </p>
                  <p>
                    <span className="font-medium">Date Requested:</span> {selectedRequest.date}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Reason</h3>
                <div className="p-3 bg-muted rounded-md">
                  {/* <p>
                    <span className="font-medium">Resource Title:</span> {selectedRequest.resourceTitle}
                  </p>
                  <p>
                    <span className="font-medium">Importance:</span> {selectedRequest.importance}
                  </p> */}
                  {/* <p className="mt-2">
                    <span className="font-medium">Reason:</span>
                  </p> */}
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
              </div>

              {/* {selectedRequest.status === "pending" && (
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleRejectRequest}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                  <Button onClick={handleApproveRequest} disabled={isSubmitting}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Request
                  </Button>
                </div>
              )} */}
              
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

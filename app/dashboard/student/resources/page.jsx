"use client"

import React from "react"

import { useState } from "react"
import { FileText, Download, Search, Filter, Tag, Clock, Star, Plus, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function ResourcesPage() {
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
    {
      id: 6,
      title: "Healthcare Industry Trends",
      description: "Analysis of current trends and future outlook for careers in healthcare.",
      category: "Industry Research",
      type: "PDF",
      size: "3.2 MB",
      updated: "1 month ago",
      downloads: 87,
      starred: false,
    },
    {
      id: 7,
      title: "LinkedIn Profile Optimization Guide",
      description: "Tips and strategies to make your LinkedIn profile stand out to recruiters.",
      category: "Career Guides",
      type: "PDF",
      size: "2.1 MB",
      updated: "3 weeks ago",
      downloads: 175,
      starred: false,
    },
    {
      id: 8,
      title: "Entry-Level Cover Letter Template",
      description: "Perfect for students and recent graduates applying for their first professional roles.",
      category: "Cover Letters",
      type: "DOCX",
      size: "280 KB",
      updated: "2 weeks ago",
      downloads: 143,
      starred: true,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRequestSubmit = () => {
    if (!requestForm.resourceTitle || !requestForm.reason || !requestForm.importance) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowRequestModal(false)

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
    }, 1500)
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">Resources</h1>
          <p className="text-muted-foreground mt-1">Access templates, guides, and tools for your career development</p>
        </div>
        <Button onClick={() => setShowRequestModal(true)}>
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
        </div>
      </div>

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
                {resource.starred && <Star className="h-5 w-5 text-amber-400 fill-amber-400" />}
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
                <Button variant="default" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-background border border-border rounded-lg shadow-sm">
          <p className="text-lg text-muted-foreground">No resources found matching your criteria.</p>
          <Button onClick={() => setShowRequestModal(true)} className="mt-4">
            Request a Resource
          </Button>
        </div>
      )}

      {/* Simple Modal Implementation */}
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
                  placeholder="E.g., Consulting Industry Guide, Salary Negotiation Templates"
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

              {/* <div className="space-y-2">
                <Label htmlFor="importance">Importance</Label>
                <Select
                  value={requestForm.importance}
                  onValueChange={(value) => handleSelectChange("importance", value)}
                >
                  <SelectTrigger id="importance">
                    <SelectValue placeholder="Select importance level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Nice to have</SelectItem>
                    <SelectItem value="medium">Medium - Would be helpful</SelectItem>
                    <SelectItem value="high">High - Urgently needed</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

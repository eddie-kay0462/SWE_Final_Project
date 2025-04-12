"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Download, Search, Filter, Tag, Clock, Bookmark, Star, ChevronDown } from 'lucide-react'

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Mock categories
  const categories = ["All", "Resume Templates", "Cover Letters", "Interview Prep", "Career Guides", "Industry Research"]

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
      starred: true
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
      starred: false
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
      starred: true
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
      starred: false
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
      starred: true
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
      starred: false
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
      starred: false
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
      starred: true
    }
  ]

  // Filter resources based on search query and selected category
  const filteredResources = allResources
    .filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory
      return matchesSearch && matchesCategory
    })

  return (
    <div className="min-h-screen bg-background pt-6 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Career Resources</h1>
            <p className="text-muted-foreground">Access templates, guides, and tools to help you succeed</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Saved Resources
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
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

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                  </div>
                  {resource.starred && (
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  )}
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
                  <span className="text-xs text-muted-foreground">
                    {resource.downloads} downloads
                  </span>
                  <button className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No resources found matching your criteria.</p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 bg-primary/5 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">Need a specific resource?</h3>
            <p className="text-muted-foreground">Request materials from our career advisors or suggest new resources.</p>
          </div>
          <Link
            href=""
            className="inline-flex items-center px-4 py-2 rounded-md border border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <FileText className="mr-2 h-4 w-4" />
            Request Resource
          </Link>
        </div>
      </div>
    </div>
  )
}
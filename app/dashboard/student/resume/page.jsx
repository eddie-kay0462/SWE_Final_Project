"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "@/lib/date-utils"

export default function ResumePage() {
  const { toast } = useToast()
  const [resume, setResume] = useState(null)
  const [comments, setComments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResumeAndComments()
  }, [])

  const fetchResumeAndComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard/student/resume')
      const data = await response.json()
      
      if (response.ok) {
        console.log("Received data:", data) // Debug log
        setResume(data.resume)
        setComments(data.comments || [])
      } else {
        console.error('Error fetching resume:', data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to load resume data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching resume:', error)
      toast({
        title: "Error",
        description: "Failed to load resume data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/dashboard/student/resume', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Resume uploaded successfully",
        })
        // Wait a brief moment before fetching to ensure the database has updated
        setTimeout(() => {
          fetchResumeAndComments()
        }, 500)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to upload resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-medium mb-6 mt-2">Resume</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-medium mb-6 mt-2">Resume</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {resume ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">Current Resume</h2>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {format(new Date(resume.uploaded_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild>
                      <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <Button variant="outline" disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Upload New"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Advisor Comments</h3>
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment, index) => (
                        <div key={index} className="bg-muted p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">
                                {comment.advisor?.fname} {comment.advisor?.lname}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(comment.created_at), "MMMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No comments yet. Your advisor will review your resume and provide feedback soon.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-lg font-medium mb-2">No Resume Uploaded</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your resume to share with potential employers
                </p>
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload Resume"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
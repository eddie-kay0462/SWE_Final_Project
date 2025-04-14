"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "@/lib/date-utils"
import { useResume } from "@/hooks/use-resume"

/**
 * ResumePage Component
 * 
 * Client-side component for managing student resume uploads and displaying advisor comments.
 * Uses the useResume hook for Supabase operations.
 * 
 * @component
 */
export default function ResumePage() {
  const { toast } = useToast()
  const [resume, setResume] = useState(null)
  const [comments, setComments] = useState([])
  const { isLoading, setIsLoading, isUploading, fetchResumeData, uploadResume } = useResume()

  useEffect(() => {
    fetchResumeAndComments()
  }, [])

  const fetchResumeAndComments = async () => {
    setIsLoading(true)
    try {
      const data = await fetchResumeData()
      setResume(data.resume)
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching resume:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load resume data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      await uploadResume(file)
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      })
      await fetchResumeAndComments()
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      })
    } finally {
      event.target.value = ''
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
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-muted p-4 rounded-lg">
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

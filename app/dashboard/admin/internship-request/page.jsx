"use client"

import { useState, useEffect } from "react"
import { Download, Eye, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import dynamic from 'next/dynamic'
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

// Dynamically import the InternshipLetter component to avoid SSR issues with html2pdf
const InternshipLetter = dynamic(() => import('@/components/InternshipLetter'), {
  ssr: false,
  loading: () => <p>Loading letter generator...</p>
})

export default function AdminInternshipRequestsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("pending")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requests, setRequests] = useState([])
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false)
  const router = useRouter()

  // Fetch internship requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/dashboard/admin/internship-request', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch requests')
        }
        
        const data = await response.json()
        setRequests(data)
      } catch (err) {
        console.error('Error fetching requests:', err)
        setError(err.message || 'Failed to load requests. Please try again later.')
        toast({
          title: "Error",
          description: err.message || "Failed to load requests. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [toast])

  // Filter requests based on letter document status
  const pendingRequests = requests.filter(req => !req.letterDocumentId)
  const approvedRequests = requests.filter(req => req.letterDocumentId)

  const handleViewRequest = (request) => {
    setCurrentRequest(request)
    setViewDialogOpen(true)
  }

  const handleGenerateLetter = async (request) => {
    try {
      setIsGeneratingLetter(true)
      const response = await fetch(`/api/dashboard/admin/internship-request`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          status: 'approved',
          letterDocumentId: uuidv4()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate letter')
      }

      toast({
        title: "Success",
        description: "Letter has been generated successfully",
      })
      
      // Navigate to the letter page after generation
      router.push(`/dashboard/internship-letter?requestId=${request.id}`)
    } catch (error) {
      console.error('Error generating letter:', error)
      toast({
        title: "Error",
        description: "Failed to generate letter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLetter(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <X className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-medium">Internship Requests</h1>
        <p className="text-muted-foreground mt-1">Manage student internship requests</p>
      </div>

      <div className="space-y-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "pending" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({pendingRequests.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "approved" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved ({approvedRequests.length})
          </button>
        </div>

        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6 pt-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{request.studentName}</h3>
                        <p className="text-muted-foreground">Student ID: {request.studentId}</p>
                        <p className="text-muted-foreground">Submitted: {request.submissionDate}</p>
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
                  <p className="text-muted-foreground">No pending requests.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "approved" && (
          <div className="space-y-4">
            {approvedRequests.length > 0 ? (
              approvedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6 pt-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{request.studentName}</h3>
                        <p className="text-muted-foreground">Student ID: {request.studentId}</p>
                        <p className="text-muted-foreground">Submitted: {request.submissionDate}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleGenerateLetter(request)} disabled={isGeneratingLetter}>
                          {isGeneratingLetter ? "Generating..." : "Generate Letter"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No approved requests.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>

            {currentRequest && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label>Student Name</Label>
                    <p className="text-sm text-muted-foreground">{currentRequest.studentName}</p>
                  </div>
                  <div>
                    <Label>Student ID</Label>
                    <p className="text-sm text-muted-foreground">{currentRequest.studentId}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{currentRequest.studentEmail}</p>
                  </div>
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm text-muted-foreground">{currentRequest.details.companyName}</p>
                  </div>
                  <div>
                    <Label>Company Address</Label>
                    <p className="text-sm text-muted-foreground">{currentRequest.details.companyAddress}</p>
                  </div>
                  <div>
                    <Label>Employer/Recruiter Name</Label>
                    <p className="text-sm text-muted-foreground">{currentRequest.details.employerName}</p>
                  </div>
                  <div>
                    <Label>Internship Duration</Label>
                    <p className="text-sm text-muted-foreground">{currentRequest.details.internshipDuration}</p>
                  </div>
                  {currentRequest.details.skillsRequired && (
                    <div>
                      <Label>Skills Required</Label>
                      <p className="text-sm text-muted-foreground">{currentRequest.details.skillsRequired}</p>
                    </div>
                  )}
                  {currentRequest.details.preferredStartDate && (
                    <div>
                      <Label>Preferred Start Date</Label>
                      <p className="text-sm text-muted-foreground">{currentRequest.details.preferredStartDate}</p>
                    </div>
                  )}
                </div>

                {!currentRequest.letterDocumentId && (
                  <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-4">
                    <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => handleGenerateLetter(currentRequest)} disabled={isGeneratingLetter}>
                      {isGeneratingLetter ? "Generating..." : "Generate Letter"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

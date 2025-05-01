"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, AlertCircle, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// Dynamically import the InternshipLetter component
const InternshipLetter = dynamic(() => import('@/components/InternshipLetter'), {
  ssr: false,
  loading: () => <p>Loading letter preview...</p>
})

export default function InternshipRequestPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [existingRequest, setExistingRequest] = useState(null)
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    employerName: "",
    internshipDuration: "",
    skillsRequired: "",
    preferredStartDate: "",
  })

  // Fetch requirements data from the API
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dashboard/student/internship-request', {
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch requirements')
        }
        
        const data = await response.json()
        setRequirements(data.requirements || [])
        setExistingRequest(data.request)
        setError(null)
      } catch (err) {
        console.error('Error fetching requirements:', err)
        setError('Failed to load requirements. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load requirements. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequirements()
  }, [toast])

  // If loading data, show loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    )
  }

  const completedRequirements = requirements.filter((req) => req.completed).length
  const totalRequirements = requirements.length
  const progress = (completedRequirements / totalRequirements) * 100
  const allRequirementsMet = completedRequirements === totalRequirements

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async () => {
    if (!allRequirementsMet) {
      toast({
        title: "Requirements Not Met",
        description: "Please complete all requirements before submitting an internship request.",
        variant: "destructive",
      })
      setIsDialogOpen(false)
      return
    }

    // Validate form data
    const requiredFields = ["companyName", "companyAddress", "employerName", "internshipDuration"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/dashboard/student/internship-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          details: formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit internship request")
      }

      setIsDialogOpen(false)
      toast({
        title: "Request Submitted",
        description: "Your internship request has been successfully submitted.",
      })
      
      // Refresh the requirements data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  // Show existing request status if there is one
  if (existingRequest) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-medium">Internship Request</h1>
          <p className="text-muted-foreground mt-1">Your internship request status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant={existingRequest.letter_document_id ? "success" : "info"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {existingRequest.letter_document_id ? "Letter Generated" : "Request Under Review"}
                </AlertTitle>
                <AlertDescription>
                  {existingRequest.letter_document_id 
                    ? "Your internship letter has been generated and is ready for download." 
                    : "Your internship request has been submitted and is currently under review. We will notify you once it has been processed."}
                </AlertDescription>
              </Alert>

              {existingRequest.letter_document_id && (
                <div className="mt-4">
                  <Button
                    onClick={() => router.push(`/dashboard/internship-letter?requestId=${existingRequest.id}`)}
                    className="w-full bg-[#A91827] hover:bg-[#A91827]/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View Letter
                  </Button>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Request Details</h3>
                <div className="grid gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm text-muted-foreground">{existingRequest.details.companyName}</p>
                  </div>
                  <div>
                    <Label>Company Address</Label>
                    <p className="text-sm text-muted-foreground">{existingRequest.details.companyAddress}</p>
                  </div>
                  <div>
                    <Label>Employer/Recruiter Name</Label>
                    <p className="text-sm text-muted-foreground">{existingRequest.details.employerName}</p>
                  </div>
                  <div>
                    <Label>Internship Duration</Label>
                    <p className="text-sm text-muted-foreground">{existingRequest.details.internshipDuration}</p>
                  </div>
                  {existingRequest.details.skillsRequired && (
                    <div>
                      <Label>Skills Required</Label>
                      <p className="text-sm text-muted-foreground">{existingRequest.details.skillsRequired}</p>
                    </div>
                  )}
                  {existingRequest.details.preferredStartDate && (
                    <div>
                      <Label>Preferred Start Date</Label>
                      <p className="text-sm text-muted-foreground">{existingRequest.details.preferredStartDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-medium">Internship Request</h1>
        <p className="text-muted-foreground mt-1">Complete all requirements to submit your internship request</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requirements Progress</CardTitle>
          <p className="text-sm text-muted-foreground">
            You have completed {completedRequirements} out of {totalRequirements} requirements
          </p>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2 mb-6" />

          <div className="space-y-4">
            {requirements.map((requirement) => (
              <div
                key={requirement.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-colors",
                  requirement.completed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50",
                )}
              >
                <div
                  className={`flex-shrink-0 rounded-full p-1 ${requirement.completed ? "bg-green-100" : "bg-red-100"}`}
                >
                  {requirement.completed ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium", requirement.completed ? "text-green-800" : "text-red-800")}>
                    {requirement.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{requirement.details}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className={cn(
                "w-full",
                allRequirementsMet ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500",
              )}
              disabled={!allRequirementsMet}
            >
              {allRequirementsMet ? "Apply for Letter" : "Complete All Requirements"}
            </Button>
            {!allRequirementsMet && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800 font-medium">
                  <AlertCircle className="h-4 w-4 inline-block mr-2" />
                  Action Required
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Please complete all requirements listed above before submitting your internship request.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle>Submit Internship Request</DialogTitle>
            <DialogDescription>
              Please provide the following information to generate your internship introductory letter.
            </DialogDescription>
          </DialogHeader>

          {!allRequirementsMet ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Requirements Not Met</AlertTitle>
              <AlertDescription>
                You must complete all requirements before submitting an internship request.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="companyAddress">Company Postal Address</Label>
                  <textarea
                    id="companyAddress"
                    name="companyAddress"
                    className="w-full p-2 border rounded-md min-h-[80px]"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="employerName">Employer/Recruiter Name</Label>
                  <input
                    id="employerName"
                    name="employerName"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={formData.employerName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="internshipDuration">Internship Duration</Label>
                  <input
                    id="internshipDuration"
                    name="internshipDuration"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., 3 months (June - August 2025)"
                    value={formData.internshipDuration}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="skillsRequired">Skills Required (Optional)</Label>
                  <input
                    id="skillsRequired"
                    name="skillsRequired"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., JavaScript, React, Node.js"
                    value={formData.skillsRequired}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="preferredStartDate">Preferred Start Date (Optional)</Label>
                  <input
                    id="preferredStartDate"
                    name="preferredStartDate"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., June 1, 2025"
                    value={formData.preferredStartDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 bg-white pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

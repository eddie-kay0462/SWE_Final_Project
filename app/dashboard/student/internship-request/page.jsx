"use client"

import { useState } from "react"
import { Check, X, AlertCircle } from "lucide-react"
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

export default function InternshipRequestPage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    employerName: "",
    internshipDuration: "",
    skillsRequired: "",
    preferredStartDate: "",
  })

  // Mock data - in a real app, this would come from your API
  const requirements = [
    {
      id: 1,
      description: "Attended at least 3 career services workshops/events",
      completed: false,
      details: "0/3 workshops",
    },
    {
      id: 2,
      description: "Completed feedback form for all attended workshops",
      completed: false,
      details: "No feedback forms submitted",
    },
    {
      id: 3,
      description: "Attended a 1-on-1 session and completed feedback",
      completed: false,
      details: "0/1 sessions completed",
    },
  ]

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

  return (
    <div className="space-y-6">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
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
              <DialogFooter>
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

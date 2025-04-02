"use client"

import { useState } from "react"
import { Check, X, Upload, AlertCircle } from "lucide-react"
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
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data 
  const requirements = [
    {
      id: 1,
      description: "Attended at least 3 career services workshops/events",
      completed: true,
      details: "Completed 3/3 workshops",
    },
    {
      id: 2,
      description: "Completed feedback form for all attended workshops",
      completed: true,
      details: "All feedback forms submitted",
    },
    {
      id: 3,
      description: "Attended a 1-on-1 session and completed feedback",
      completed: false,
      details: "0/1 sessions completed",
    },
    {
      id: 4,
      description: "Completed Big Interview Mock Interview",
      completed: true,
      details: "Completed on March 15, 2025",
    },
  ]

  const completedRequirements = requirements.filter((req) => req.completed).length
  const totalRequirements = requirements.length
  const progress = (completedRequirements / totalRequirements) * 100
  const allRequirementsMet = completedRequirements === totalRequirements

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    if (!allRequirementsMet) {
      toast({
        title: "Requirements Not Met",
        description: "Please complete all requirements before submitting an internship request.",
        variant: "destructive",
      })
      setIsDialogOpen(false)
      return
    }

    if (!file) {
      toast({
        title: "Missing Document",
        description: "Please upload your 2024 Career Fair validation pass.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsDialogOpen(false)
      setFile(null)

      toast({
        title: "Request Submitted",
        description: "Your internship request has been successfully submitted.",
      })
    }, 1500)
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
              {allRequirementsMet ? "Submit Internship Request" : "Complete All Requirements"}
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
              Please upload your 2024 Career Fair validation pass to complete your request.
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
                  <Label htmlFor="validation-pass" className="font-medium">
                    Career Fair Validation Pass
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="validation-pass"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        file ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
                      )}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {file ? (
                          <>
                            <Check className="w-8 h-8 mb-3 text-green-500" />
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
                        <p className="text-xs text-gray-500">PDF or image file (MAX. 5MB)</p>
                      </div>
                      <input
                        id="validation-pass"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {file && (
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 truncate">{file.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => setFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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


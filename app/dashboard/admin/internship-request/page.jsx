"use client"

import { useState } from "react"
import { Download, Eye, Upload, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

export default function AdminInternshipRequestsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("pending")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState(null)
  const [letterFile, setLetterFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data - in a real app, this would come from your API
  const internshipRequests = [
    {
      id: 1,
      studentId: "20242025",
      studentName: "John Doe",
      submissionDate: "March 25, 2025",
      status: "pending",
      validationPass: "career-fair-pass-john-doe.pdf",
    },
    {
      id: 2,
      studentId: "20242026",
      studentName: "Jane Smith",
      submissionDate: "March 24, 2025",
      status: "approved",
      validationPass: "career-fair-pass-jane-smith.pdf",
      letterFile: "internship-letter-jane-smith.pdf",
    },
    {
      id: 3,
      studentId: "20242027",
      studentName: "Michael Johnson",
      submissionDate: "March 23, 2025",
      status: "rejected",
      validationPass: "career-fair-pass-michael-johnson.pdf",
      rejectionReason: "Missing required workshops attendance",
    },
    {
      id: 4,
      studentId: "20242028",
      studentName: "Emily Williams",
      submissionDate: "March 22, 2025",
      status: "pending",
      validationPass: "career-fair-pass-emily-williams.pdf",
    },
    {
      id: 5,
      studentId: "20242029",
      studentName: "David Brown",
      submissionDate: "March 21, 2025",
      status: "approved",
      validationPass: "career-fair-pass-david-brown.pdf",
      letterFile: "internship-letter-david-brown.pdf",
    },
  ]

  const pendingRequests = internshipRequests.filter((req) => req.status === "pending")
  const approvedRequests = internshipRequests.filter((req) => req.status === "approved")
  const rejectedRequests = internshipRequests.filter((req) => req.status === "rejected")

  const handleViewRequest = (request) => {
    setCurrentRequest(request)
    setViewDialogOpen(true)
  }

  const handleUploadLetter = (request) => {
    setCurrentRequest(request)
    setLetterFile(null)
    setUploadDialogOpen(true)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLetterFile(e.target.files[0])
    }
  }

  const handleApproveRequest = () => {
    if (!letterFile) {
      toast({
        title: "Missing Document",
        description: "Please upload an internship request letter.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setUploadDialogOpen(false)
      setLetterFile(null)

      toast({
        title: "Request Approved",
        description: `Internship request for ${currentRequest.studentName} has been approved and letter uploaded.`,
      })
    }, 1500)
  }

  const handleRejectRequest = () => {
    // Simulate API call
    setTimeout(() => {
      setViewDialogOpen(false)

      toast({
        title: "Request Rejected",
        description: `Internship request for ${currentRequest.studentName} has been rejected.`,
      })
    }, 1000)
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
          <button
            className={`px-4 py-2 font-medium ${activeTab === "rejected" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected ({rejectedRequests.length})
          </button>
        </div>

        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
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
                        <Button size="sm" onClick={() => handleUploadLetter(request)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Approve & Upload Letter
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
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{request.studentName}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        </div>
                        <p className="text-muted-foreground">Student ID: {request.studentId}</p>
                        <p className="text-muted-foreground">Submitted: {request.submissionDate}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Letter
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

        {activeTab === "rejected" && (
          <div className="space-y-4">
            {rejectedRequests.length > 0 ? (
              rejectedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{request.studentName}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejected
                          </span>
                        </div>
                        <p className="text-muted-foreground">Student ID: {request.studentId}</p>
                        <p className="text-muted-foreground">Submitted: {request.submissionDate}</p>
                        {request.rejectionReason && (
                          <p className="text-sm mt-2 p-3 bg-red-50 border border-red-100 rounded-md text-red-700">
                            <span className="font-medium">Reason:</span> {request.rejectionReason}
                          </p>
                        )}
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
                  <p className="text-muted-foreground">No rejected requests.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Internship Request Details</DialogTitle>
          </DialogHeader>

          {currentRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Student Information</h3>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p>
                    <span className="font-medium">Name:</span> {currentRequest.studentName}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span> {currentRequest.studentId}
                  </p>
                  <p>
                    <span className="font-medium">Submission Date:</span> {currentRequest.submissionDate}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={
                        currentRequest.status === "approved"
                          ? "text-green-600"
                          : currentRequest.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }
                    >
                      {currentRequest.status.charAt(0).toUpperCase() + currentRequest.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Career Fair Validation Pass</h3>
                <div className="mt-2 p-3 bg-muted rounded-md flex items-center justify-between">
                  <p className="truncate">{currentRequest.validationPass}</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {currentRequest.letterFile && (
                <div>
                  <h3 className="font-medium">Internship Request Letter</h3>
                  <div className="mt-2 p-3 bg-muted rounded-md flex items-center justify-between">
                    <p className="truncate">{currentRequest.letterFile}</p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {currentRequest.status === "pending" && (
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => handleRejectRequest()}>
                    <X className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false)
                      handleUploadLetter(currentRequest)
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Letter Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Internship Request Letter</DialogTitle>
          </DialogHeader>

          {currentRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Upload an internship request letter for {currentRequest.studentName} (ID: {currentRequest.studentId})
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="letter-file">Internship Request Letter</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="letter-file"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      letterFile ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {letterFile ? (
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
                      <p className="text-xs text-gray-500">PDF file (MAX. 5MB)</p>
                    </div>
                    <input id="letter-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </label>
                </div>
                {letterFile && (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 truncate">{letterFile.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => setLetterFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveRequest} disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Approve & Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


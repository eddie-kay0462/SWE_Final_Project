"use client"

import { useState } from "react"
import { Download, Eye, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function AdminInternshipRequestsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("pending")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data - in a real app, this would come from your API
  const internshipRequests = [
    {
      id: 1,
      studentId: "20242025",
      studentName: "John Doe",
      submissionDate: "March 25, 2025",
      status: "pending",
      formDetails: {
        fullName: "John Doe",
        yearGroup: "2025",
        major: "Computer Science",
        companyAddress: "123 Tech Avenue, Silicon Valley, CA 94043",
        employerName: "Jane Smith, HR Director",
        internshipDuration: "3 months (June - August 2025)",
      },
    },
    {
      id: 2,
      studentId: "20242026",
      studentName: "Jane Smith",
      submissionDate: "March 24, 2025",
      status: "approved",
      formDetails: {
        fullName: "Jane Smith",
        yearGroup: "2026",
        major: "Business Administration",
        companyAddress: "456 Finance Street, New York, NY 10004",
        employerName: "Michael Johnson, Recruiting Manager",
        internshipDuration: "4 months (May - August 2025)",
      },
      letterFile: "internship-letter-jane-smith.pdf",
    },
    {
      id: 3,
      studentId: "20242027",
      studentName: "Michael Johnson",
      submissionDate: "March 23, 2025",
      status: "rejected",
      formDetails: {
        fullName: "Michael Johnson",
        yearGroup: "2027",
        major: "Mechanical Engineering",
        companyAddress: "789 Engineering Blvd, Detroit, MI 48201",
        employerName: "Sarah Williams, Engineering Director",
        internshipDuration: "6 months (January - June 2026)",
      },
      rejectionReason: "Missing required workshops attendance",
    },
    {
      id: 4,
      studentId: "20242028",
      studentName: "Emily Williams",
      submissionDate: "March 22, 2025",
      status: "pending",
      formDetails: {
        fullName: "Emily Williams",
        yearGroup: "2028",
        major: "Psychology",
        companyAddress: "321 Health Center Drive, Boston, MA 02115",
        employerName: "David Brown, Clinical Director",
        internshipDuration: "3 months (May - July 2025)",
      },
    },
    {
      id: 5,
      studentId: "20242029",
      studentName: "David Brown",
      submissionDate: "March 21, 2025",
      status: "approved",
      formDetails: {
        fullName: "David Brown",
        yearGroup: "2025",
        major: "Finance",
        companyAddress: "555 Wall Street, New York, NY 10005",
        employerName: "Robert Taylor, Finance Manager",
        internshipDuration: "10 weeks (June - August 2025)",
      },
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

  const handleApproveRequest = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setViewDialogOpen(false)

      toast({
        title: "Request Approved",
        description: `Internship request for ${currentRequest.studentName} has been approved and letter generated.`,
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
          {/* <button
            className={`px-4 py-2 font-medium ${activeTab === "rejected" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected ({rejectedRequests.length})
          </button> */}
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
                  <CardContent className="p-6 pt-5">
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
                <h3 className="font-medium">Internship Details</h3>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p>
                    <span className="font-medium">Full Name:</span> {currentRequest.formDetails.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Year Group:</span> {currentRequest.formDetails.yearGroup}
                  </p>
                  <p>
                    <span className="font-medium">Major:</span> {currentRequest.formDetails.major}
                  </p>
                  <p>
                    <span className="font-medium">Company Address:</span> {currentRequest.formDetails.companyAddress}
                  </p>
                  <p>
                    <span className="font-medium">Employer/Recruiter:</span> {currentRequest.formDetails.employerName}
                  </p>
                  <p>
                    <span className="font-medium">Internship Duration:</span>{" "}
                    {currentRequest.formDetails.internshipDuration}
                  </p>
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

              {/* {currentRequest.status === "pending" && (
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => handleRejectRequest()}>
                    <X className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                  <Button onClick={() => handleApproveRequest()}>
                    <Check className="h-4 w-4 mr-2" />
                    Approve & Generate Letter
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

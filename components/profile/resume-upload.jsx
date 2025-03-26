"use client"

import { useState } from "react"
import { FileText, Upload, Trash2, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

export default function ResumeUpload() {
  const [resume, setResume] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type === "application/pdf") {
        setResume(file)
        setUploadError("")
      } else {
        setUploadError("Please upload a PDF file")
      }
    }
  }

  const handleRemoveResume = () => {
    setResume(null)
  }

  const handlePreview = () => {
    setPreviewOpen(true)
  }

  return (
    <div className="animate-appear">
      <h2 className="text-2xl font-bold mb-6">Resume</h2>

      {uploadError && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{uploadError}</p>
        </div>
      )}

      {!resume ? (
        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No resume uploaded</h3>
          <p className="text-muted-foreground mb-4">Upload your resume to share with potential employers</p>
          <div className="flex justify-center">
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload Resume</span>
              </div>
              <input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{resume.name}</h3>
                <p className="text-sm text-muted-foreground">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRemoveResume}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setPreviewOpen(false)} />
          <div className="h-full overflow-auto">
            {resume && <iframe src={URL.createObjectURL(resume)} className="w-full h-full" title="Resume Preview" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


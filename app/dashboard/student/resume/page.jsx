"use client"

import { Card, CardContent } from "@/components/ui/card"
import ResumeUpload from "@/components/profile/resume-upload"


export default function ResumePage() {

  return (
    <Card>
      <CardContent className="p-6">
        <ResumeUpload />
      </CardContent>
    </Card>
  )
}
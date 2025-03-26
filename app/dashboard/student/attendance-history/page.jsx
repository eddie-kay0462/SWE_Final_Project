"use client"

import { Card, CardContent } from "@/components/ui/card"
import ProgressTracker from "@/components/profile/progress-tracker"
import { useRouter } from "next/navigation"

export default function ProgressPage() {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="p-6">
        <ProgressTracker />
      </CardContent>
    </Card>
  )
}


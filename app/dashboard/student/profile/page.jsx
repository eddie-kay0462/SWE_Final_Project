// app/dashboard/student/profile/page.jsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import PersonalInfo from "@/components/profile/personal-info"


export default function ProfilePage() {

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
              <PersonalInfo />
        </CardContent>
      </Card>
      
    </div>
  )
}
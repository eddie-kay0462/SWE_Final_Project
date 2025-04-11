// app/dashboard/student/profile/page.jsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import PersonalInfo from "@/components/profile/personal-info"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/dashboard/admin/profile')
        
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your profile.",
            variant: "destructive",
          })
          router.push('/auth/login')
          return
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch profile data`)
        }

        const data = await response.json()
        if (!data.fname || !data.lname || !data.email) {
          throw new Error("Incomplete profile data")
        }
        setProfileData(data)
      } catch (err) {
        console.error("Error fetching profile data:", err)
        toast({
          title: "Error",
          description: "Could not load profile information.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [toast, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profileData?.fname || !profileData?.lname || !profileData?.email) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Unable to load profile data. Please try again later.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Profile</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <PersonalInfo initialData={profileData} />
        </CardContent>
      </Card>
    </div>
  )
}
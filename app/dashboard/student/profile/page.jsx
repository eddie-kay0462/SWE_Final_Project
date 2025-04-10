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
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/dashboard/student/profile')
        
        if (response.status === 401) {
          // Not authenticated
          toast({
            title: "Authentication Required",
            description: "Please log in to view your profile.",
            variant: "destructive",
          })
          router.push('/auth/login')
          return
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) // Try to parse error, default to empty obj
          throw new Error(errorData.error || `Failed to fetch profile data (Status: ${response.status})`)
        }

        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError(err.message || "An unexpected error occurred while fetching your profile.")
        toast({
          title: "Error",
          description: err.message || "Could not load profile information.",
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

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md p-4">
        Error loading profile: {error}
      </div>
    )
  }
  
  if (!profileData) {
      return <div className="text-center text-muted-foreground">No profile data found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
              <PersonalInfo initialData={profileData} />
        </CardContent>
      </Card>
      
      {/* Placeholder for other sections if needed */}
      {/* <Card>
        <CardHeader><CardTitle>Other Section</CardTitle></CardHeader>
        <CardContent>
          <p>Other profile information...</p>
        </CardContent>
      </Card> */}
    </div>
  )
}
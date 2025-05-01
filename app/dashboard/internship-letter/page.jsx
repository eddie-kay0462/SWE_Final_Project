"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useToast } from "@/hooks/use-toast"

// Dynamically import the InternshipLetter component
const InternshipLetter = dynamic(() => import('@/components/InternshipLetter'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
    </div>
  )
})

export default function InternshipLetterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [letterData, setLetterData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLetterData = async () => {
      try {
        const requestId = searchParams.get('requestId')
        if (!requestId) {
          toast({
            title: "Error",
            description: "No request ID provided",
            variant: "destructive",
          })
          router.push('/dashboard')
          return
        }

        const response = await fetch(`/api/dashboard/internship-request/${requestId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch letter data')
        }

        const data = await response.json()
        setLetterData(data)
      } catch (error) {
        console.error('Error fetching letter data:', error)
        toast({
          title: "Error",
          description: "Failed to load letter data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLetterData()
  }, [searchParams, router, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
      </div>
    )
  }

  if (!letterData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 mb-4">Letter data not found</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-serif font-medium">Internship Letter</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <InternshipLetter
            studentName={letterData.studentName}
            studentId={letterData.studentId}
            yearGroup={letterData.yearGroup}
            major={letterData.major}
            internshipDuration={letterData.internshipDuration}
            companyName={letterData.companyName}
            companyAddress={letterData.companyAddress}
            employerName={letterData.employerName}
            requestDate={letterData.requestDate}
          />
        </div>
      </div>
    </div>
  )
} 
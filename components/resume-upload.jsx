"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "@/lib/date-utils"

export default function ResumeUpload() {
    const { toast } = useToast()
    const [resume, setResume] = useState(null)
    const [comments, setComments] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchResumeAndComments()
    }, [])

    const fetchResumeAndComments = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/dashboard/student/resume')
            const data = await response.json()
            
            if (response.ok) {
                setResume(data.resume)
                setComments(data.comments || [])
            } else {
                console.error('Error fetching resume:', data.error)
                toast({
                    title: "Error",
                    description: data.error || "Failed to load resume data",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Error fetching resume:', error)
            toast({
                title: "Error",
                description: "Failed to load resume data",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF file",
                variant: "destructive",
            })
            return
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/dashboard/student/resume', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Resume uploaded successfully",
                })
                fetchResumeAndComments()
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to upload resume",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Error uploading resume:', error)
            toast({
                title: "Error",
                description: "Failed to upload resume",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-serif font-medium mb-4">Loading...</h1>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif font-medium mb-4">Resume Upload</h1>
            <input type="file" onChange={handleFileUpload} disabled={isUploading} />
        </div>
    )
} 
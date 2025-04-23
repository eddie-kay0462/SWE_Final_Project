"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    User,
    Mail,
    Pencil,
    X,
    IdCard
} from "lucide-react"

/**
 * PersonalInfo component displays and allows editing of user's personal information.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.initialData - Initial profile data fetched from the API.
 * @returns {JSX.Element} The rendered component.
 */
export default function PersonalInfo({ initialData }) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentInitialData, setCurrentInitialData] = useState(initialData);
  const [formData, setFormData] = useState({
    fname: currentInitialData?.fname || '',
    lname: currentInitialData?.lname || '',
    email: currentInitialData?.email || '',
    student_id: currentInitialData?.student_id || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        fname: currentInitialData?.fname || '',
        lname: currentInitialData?.lname || '',
        email: currentInitialData?.email || '',
        student_id: currentInitialData?.student_id || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/dashboard/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fname: formData.fname,
          lname: formData.lname
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedData = await response.json()
      setFormData({
        fname: updatedData.fname,
        lname: updatedData.lname,
        email: updatedData.email,
        student_id: updatedData.student_id
      });
      setCurrentInitialData(updatedData);

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Could not update profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderInfoItem = (Icon, label, value, key) => (
    <div key={key} className="flex items-center gap-4 py-3 border-b last:border-b-0">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value || "-"}</p>
      </div>
    </div>
  )

  const renderEditItem = (Icon, label, name, value, type = "text") => (
    <div className="flex items-start gap-4 py-3">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2.5" />
      <div className="flex-1 space-y-1">
        <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
        <Input
          id={name}
          name={name}
          value={value}
          onChange={handleInputChange}
          type={type}
          className="w-full"
          disabled={name === 'email' || name === 'student_id'}
        />
      </div>
    </div>
  )

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Personal Information</h2>
        <Button variant="outline" size="sm" onClick={handleEditToggle}>
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-1">
          {renderEditItem(IdCard, "Student ID", "student_id", formData.student_id)}
          {renderEditItem(User, "First Name", "fname", formData.fname)}
          {renderEditItem(User, "Last Name", "lname", formData.lname)}
          {renderEditItem(Mail, "Email", "email", formData.email)}

          <div className="flex justify-end pt-4">
            <LoadingButton type="submit" loading={isLoading} disabled={isLoading}>
              Save Changes
            </LoadingButton>
          </div>
        </form>
      ) : (
        <div className="space-y-0 divide-y divide-border">
          {renderInfoItem(IdCard, "Student ID", formData.student_id, 'student_id')}
          {renderInfoItem(User, "Name", `${formData.fname} ${formData.lname}`, 'name')}
          {renderInfoItem(Mail, "Email", formData.email, 'email')}
        </div>
      )}
    </div>
  )
}


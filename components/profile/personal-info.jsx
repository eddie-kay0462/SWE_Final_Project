"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Briefcase, School, Edit, Save, X } from "lucide-react"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function PersonalInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Campus Drive, University City, CA 90210",
    major: "Computer Science",
    graduationYear: "2025",
    bio: "I am a passionate computer science student with interests in artificial intelligence and web development. Looking for internship opportunities in software engineering.",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    // save the data to your backend - to be implemented later
    console.log("Saving data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // test data - user profile details
    setFormData({
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Campus Drive, University City, CA 90210",
      major: "Computer Science",
      graduationYear: "2025",
      bio: "I am a passionate computer science student with interests in artificial intelligence and web development. Looking for internship opportunities in software engineering.",
    })
    setIsEditing(false)
  }

  return (
    <div className="animate-appear">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={toggleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Name</span>
          </div>
          {isEditing ? (
            <Input name="name" value={formData.name} onChange={handleChange} className="flex-1" />
          ) : (
            <span className="text-muted-foreground">{formData.name}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Email</span>
          </div>
          {isEditing ? (
            <Input name="email" type="email" value={formData.email} onChange={handleChange} className="flex-1" />
          ) : (
            <span className="text-muted-foreground">{formData.email}</span>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Phone</span>
          </div>
          {isEditing ? (
            <Input name="phone" value={formData.phone} onChange={handleChange} className="flex-1" />
          ) : (
            <span className="text-muted-foreground">{formData.phone}</span>
          )}
        </div>

        {/* Address */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Address</span>
          </div>
          {isEditing ? (
            <Input name="address" value={formData.address} onChange={handleChange} className="flex-1" />
          ) : (
            <span className="text-muted-foreground">{formData.address}</span>
          )}
        </div> */}

        {/* Major */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <School className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Major</span>
          </div>
          {isEditing ? (
            <Input name="major" value={formData.major} onChange={handleChange} className="flex-1" />
          ) : (
            <span className="text-muted-foreground">{formData.major}</span>
          )}
        </div>

        {/* Graduation Year */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Graduation</span>
          </div>
          {isEditing ? (
            <Input name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="flex-1" />
          ) : (
            <span className="text-muted-foreground">{formData.graduationYear}</span>
          )}
        </div>

        {/* Bio */}
        {/* <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Bio</span>
          </div>
          {isEditing ? (
            <Textarea name="bio" value={formData.bio} onChange={handleChange} className="min-h-[100px]" />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{formData.bio}</p>
          )}
        </div> */}
      </div>
    </div>
  )
}


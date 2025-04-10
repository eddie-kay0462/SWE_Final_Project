"use client"
import { useState, useEffect } from "react"
import { LayoutDashboard, FileText, Bell, Settings, UserPen, MessageCircle, FileUser, CalendarClock, Map } from "lucide-react"
import Sidebar from "../sidebar"
import { createClient } from '@/utils/supabase/client'

// Define the navigation items for student
const studentNavItems = [
  { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/student/profile", icon: UserPen },
  { name: "Resume", href: "/dashboard/student/resume", icon: FileUser },
  { name: "Career Roadmap", href: "/dashboard/student/career-roadmap", icon: Map },
  { name: "Internship Requests", href: "/dashboard/student/internship-request", icon: FileText },
  { name: "1-on-1 Sessions", href: "/dashboard/student/one-on-one", icon: CalendarClock },
  { name: "Notifications", href: "/dashboard/student/notifications", icon: Bell },
  // { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  // { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const StudentSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const supabase = createClient()
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error("Authentication error:", userError)
          return
        }

        // Fetch user details using email
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('fname, lname, email')
          .eq('email', user.email)
          .single()

        if (userDataError) {
          console.error("Error fetching user data:", userDataError)
          return
        }

        setUserInfo(userData)
      } catch (error) {
        console.error("Error in fetchUserInfo:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  if (loading) {
    return <div>Loading...</div> // You might want to add a proper loading spinner here
  }

  return (
    <Sidebar 
      navItems={studentNavItems}
      userRole="student"
      userName={userInfo ? `${userInfo.fname} ${userInfo.lname}` : ''}
      userEmail={userInfo?.email || ''}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  )
}

export default StudentSidebar


// Student Profile ------------------

// Dashboard
// Profile
// Resumes -- View, Update and Delete resumes
// Career Roadmap -- Track career development journey and recommended next steps
// Internship Request Letters -- Submit internship request letter [must meet specific requirements]
// 1-on-1 Sessions -- Book 1-on-1 Sessions with career advisor
// Notifications -- Notified of Current Career Session {30 mins notification}
////////////// Chat -- Send and recieve messages from admin { Future Implementation }
////////////// Settings



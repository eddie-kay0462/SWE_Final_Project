"use client"
import { useState, useEffect } from "react"
import { createClient } from '@/utils/supabase/client'
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar"
import { GraduationCap } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"
import {
  IconLayoutDashboard,
  IconUserCircle,
  IconFileText,
  IconMap,
  IconCalendarTime,
  IconBell,
  IconFileCv,
  IconBriefcase2,
  IconCalendarEvent,
} from "@tabler/icons-react"
import Image from "next/image"

// Define the navigation items for student
const studentNavItems = [
  { label: "Dashboard", href: "/dashboard/student", icon: <IconLayoutDashboard className="h-6 w-6 shrink-0" /> },
  { label: "Profile", href: "/dashboard/student/profile", icon: <IconUserCircle className="h-6 w-6 shrink-0" /> },
  { label: "Resume", href: "/dashboard/student/resume", icon: <IconFileCv className="h-6 w-6 shrink-0" /> },
  { label: "Events", href: "/dashboard/student/events", icon: <IconCalendarEvent className="h-6 w-6 shrink-0" /> },
  { label: "Career Roadmap", href: "/dashboard/student/career-roadmap", icon: <IconMap className="h-6 w-6 shrink-0" /> },
  { label: "Internship Requests", href: "/dashboard/student/internship-request", icon: <IconFileText className="h-6 w-6 shrink-0" /> },
  { label: "1-on-1 Sessions", href: "/dashboard/student/one-on-one", icon: <IconCalendarTime className="h-6 w-6 shrink-0" /> },
  { label: "Resources", href: "/dashboard/student/resources", icon: <IconBriefcase2 className="h-6 w-6 shrink-0" /> },
  { label: "Notifications", href: "/dashboard/student/notifications", icon: <IconBell className="h-6 w-6 shrink-0" /> },
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

  const Logo = () => {
    const { open } = useSidebar()
    return (
      <div className="flex items-center gap-2 py-1">
        <GraduationCap className="h-8 w-8 text-[#A91827]" />
        {open && <span className="text-xl font-bold">CSOFT</span>}
      </div>
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
      <SidebarBody>
        <div className="flex flex-1 flex-col gap-6">
          {/* Logo */}
          <Logo />

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            {studentNavItems.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>

          {/* Footer Section */}
          <div className="mt-auto flex flex-col gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile */}
            {userInfo && (
              <SidebarLink
                link={{
                  label: `${userInfo.fname} ${userInfo.lname}`,
                  href: "/dashboard/student/profile",
                  icon: (
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      {userInfo.fname.charAt(0).toUpperCase()}
                    </div>
                  ),
                }}
              />
            )}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
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



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
  IconMessageCircle,
  IconSettings,
  IconFileDescription
} from "@tabler/icons-react"
import Image from "next/image"

// Define the navigation items for student
const studentNavItems = [
  { label: "Dashboard", href: "/dashboard/student", icon: <IconLayoutDashboard className="h-6 w-6 shrink-0" /> },
  { label: "Profile", href: "/dashboard/student/profile", icon: <IconUserCircle className="h-6 w-6 shrink-0" /> },
  { label: "Resume", href: "/dashboard/student/resume", icon: <IconFileDescription className="h-6 w-6 shrink-0" /> },
  { label: "Career Roadmap", href: "/dashboard/student/career-roadmap", icon: <IconMap className="h-6 w-6 shrink-0" /> },
  { label: "Internship Requests", href: "/dashboard/student/internship-request", icon: <IconFileText className="h-6 w-6 shrink-0" /> },
  { label: "1-on-1 Sessions", href: "/dashboard/student/one-on-one", icon: <IconCalendarTime className="h-6 w-6 shrink-0" /> },
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

  if (loading) {
    return <div>Loading...</div>
  }

  const Logo = () => {
    const { open } = useSidebar();
    return (
      <div className="flex items-center gap-2 py-1">
        <GraduationCap className="h-8 w-8 text-[#A91827]" />
        {open && <span className="text-xl font-bold">CSOFT</span>}
      </div>
    );
  };

  return (
    <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          <Logo />

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col gap-2">
            {studentNavItems.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex flex-col gap-2">
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



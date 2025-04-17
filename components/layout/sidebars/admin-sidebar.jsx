"use client"
import { useState, useEffect } from "react"
import { createClient } from '@/utils/supabase/client'
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar"
import { GraduationCap } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import {
  IconLayoutDashboard,
  IconUserCircle,
  IconFileText,
  IconCalendarEvent,
  IconChartBar,
  IconUsers,
  IconBell,
  IconMessageCircle,
  IconSettings,
  IconCalendarCheck,
  IconBriefcase2,
  IconClipboardCheck,
  IconLogout,
} from "@tabler/icons-react"

// Define the navigation items for admin
const adminNavItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: <IconLayoutDashboard className="h-6 w-6 shrink-0" /> },
  // { label: "Profile", href: "/dashboard/admin/profile", icon: <IconUserCircle className="h-6 w-6 shrink-0" /> },
  { label: "Internship Requests", href: "/dashboard/admin/internship-request", icon: <IconFileText className="h-6 w-6 shrink-0" /> },
  { label: "Resume Reviews", href: "/dashboard/admin/resume", icon: <IconClipboardCheck className="h-6 w-6 shrink-0" /> },
  { label: "1-on-1 Sessions", href: "/dashboard/admin/sessions", icon: <IconCalendarCheck className="h-6 w-6 shrink-0" /> },
  { label: "Events", href: "/dashboard/admin/events", icon: <IconCalendarEvent className="h-6 w-6 shrink-0" /> },
  { label: "Resources", href: "/dashboard/admin/resources", icon: <IconBriefcase2 className="h-6 w-6 shrink-0" /> },
  { label: "Student Profiles", href: "/dashboard/admin/students", icon: <IconUsers className="h-6 w-6 shrink-0" /> },
  { label: "Notifications", href: "/dashboard/admin/notifications", icon: <IconBell className="h-6 w-6 shrink-0" /> },
]

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const { signOut } = useAuth()
  const router = useRouter()

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

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const Logo = () => {
    const { open } = useSidebar()
    return (
      <div className="flex items-center gap-2 py-1">
        <GraduationCap className="h-8 w-8 text-[#A91827]" />
        {open && <span className="text-xl font-bold">CSOFT</span>}
      </div>
    )
  }

  const LogoutButton = ({ onClick }) => {
    const { open } = useSidebar()
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        title="Logout"
      >
        <IconLogout className="h-6 w-6 shrink-0" />
        {open && <span className="text-sm font-medium">Logout</span>}
      </button>
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
            {adminNavItems.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>

          {/* Footer Section */}
          <div className="mt-auto flex flex-col gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile */}
            {userInfo && (
              <>
                <SidebarLink
                  link={{
                    label: `${userInfo.fname} ${userInfo.lname}`,
                    href: "/dashboard/admin/profile",
                    icon: (
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {userInfo.fname.charAt(0).toUpperCase()}
                      </div>
                    ),
                  }}
                />
                <LogoutButton onClick={handleLogout} />
              </>
            )}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}

export default AdminSidebar


// Admin Profile ------------------

// Dashboard
// Profile
// Internship Requests -- Reviewing Internship Requests 
// 1-on-1 Sessions -- view students who have requested for 1-on-1 Sessions
// Events -- Creating, Viewing, Updating and Deleting events (CRUD) -- Can share with other year groups as well
//        -- View Each Sessions Insights { Total Attendance, Percentage Turnover, Instructors Present? }
// Student Profiles -- View students profiles { Name, Year Group, Attendance History, Resumes }
// Resources -- Uploading and Removing Career Resources { CV guides, Cover Letter Templates, Career Tips, other advice}
// Notifications -- View Notifications from super-admin and other admins
////////////// Chat -- Send and recieve messages from super-admin, other admins and specific year-group { Future Implementation }
////////////// Settings -- ?
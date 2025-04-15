"use client"
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar"
import { GraduationCap } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"
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
} from "@tabler/icons-react"

// Define the navigation items for admin
const adminNavItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: <IconLayoutDashboard className="h-6 w-6 shrink-0" /> },
  { label: "Profile", href: "/dashboard/admin/profile", icon: <IconUserCircle className="h-6 w-6 shrink-0" /> },
  { label: "Internship Requests", href: "/dashboard/admin/internship-request", icon: <IconFileText className="h-6 w-6 shrink-0" /> },
  { label: "1-on-1 Sessions", href: "/dashboard/admin/sessions", icon: <IconCalendarCheck className="h-6 w-6 shrink-0" /> },
  { label: "Events", href: "/dashboard/admin/events", icon: <IconCalendarEvent className="h-6 w-6 shrink-0" /> },
  { label: "Resources", href: "/dashboard/admin/resources", icon: <IconBriefcase2 className="h-6 w-6 shrink-0" /> },
  { label: "Student Profiles", href: "/dashboard/admin/students", icon: <IconUsers className="h-6 w-6 shrink-0" /> },
  { label: "Notifications", href: "/dashboard/admin/notifications", icon: <IconBell className="h-6 w-6 shrink-0" /> },
]

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const Logo = () => {
    const { open } = useSidebar()
    return (
      <div className="flex items-center gap-2 py-1">
        <GraduationCap className="h-8 w-8 text-[#A91827]" />
        {open && <span className="text-xl font-bold">CSOFT</span>}
      </div>
    )
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
            <SidebarLink
              link={{
                label: "Carol Advisor",
                href: "/dashboard/admin/profile",
                icon: (
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    C
                  </div>
                ),
              }}
            />
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
/**
 * Unified Sidebar Component
 * 
 * <p>This component consolidates all role-specific sidebars into a single component,
 * rendering the appropriate navigation items based on the user's role.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
"use client"

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
  IconChartBar,
  IconUsers,
  IconShield,
  IconSettings,
  IconDatabase,
  IconCalendarCheck,
} from "@tabler/icons-react"

/**
 * Navigation items configuration for student role
 */
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

/**
 * Navigation items configuration for admin role
 */
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

/**
 * Navigation items configuration for superadmin role
 */
const superadminNavItems = [
  { label: "Dashboard", href: "/dashboard/super-admin", icon: <IconLayoutDashboard className="h-6 w-6 shrink-0" /> },
  { label: "Profile", href: "/dashboard/super-admin/profile", icon: <IconUserCircle className="h-6 w-6 shrink-0" /> },
  { label: "User Management", href: "/dashboard/super-admin/users", icon: <IconUsers className="h-6 w-6 shrink-0" /> },
  { label: "1-on-1 Sessions", href: "/dashboard/super-admin/sessions", icon: <IconCalendarCheck className="h-6 w-6 shrink-0" /> },
  { label: "Events", href: "/dashboard/super-admin/events", icon: <IconCalendarEvent className="h-6 w-6 shrink-0" /> },
  { label: "System Analytics", href: "/dashboard/super-admin/analytics", icon: <IconChartBar className="h-6 w-6 shrink-0" /> },
  { label: "Audit Logs", href: "/dashboard/super-admin/audit", icon: <IconFileText className="h-6 w-6 shrink-0" /> },
  { label: "Security & Compliance", href: "/dashboard/super-admin/security", icon: <IconShield className="h-6 w-6 shrink-0" /> },
  { label: "System Settings", href: "/dashboard/super-admin/settings", icon: <IconSettings className="h-6 w-6 shrink-0" /> },
  { label: "Dev Tools", href: "/dashboard/super-admin/dev-tools", icon: <IconDatabase className="h-6 w-6 shrink-0" /> },
]

/**
 * Unified Sidebar component that renders sidebar based on user role
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.sidebarOpen - Whether the sidebar is open
 * @param {Function} props.setSidebarOpen - Function to toggle sidebar open state
 * @param {Object} props.userInfo - User information from Supabase
 * @param {string} props.userRole - User role (student, admin, or superadmin)
 * @return {JSX.Element} The unified sidebar component
 */
const UnifiedSidebar = ({ sidebarOpen, setSidebarOpen, userInfo, userRole }) => {
  // Get navigation items based on user role
  const navItems = 
    userRole === 'admin' ? adminNavItems : 
    userRole === 'superadmin' ? superadminNavItems : 
    studentNavItems;

  /**
   * Logo component for the sidebar
   * 
   * @return {JSX.Element} The logo component
   */
  const Logo = () => {
    const { open } = useSidebar();
    return (
      <div className="flex items-center gap-2 py-1">
        <GraduationCap className="h-8 w-8 text-[#A91827]" />
        {open && <span className="text-xl font-bold">CSOFT</span>}
      </div>
    );
  };

  /**
   * Get user display information for the sidebar
   * 
   * @return {Object} User display information
   */
  const getUserDisplay = () => {
    if (userInfo) {
      // Use actual user info from database
      const firstInitial = userInfo.fname ? userInfo.fname.charAt(0).toUpperCase() : "U";
      return {
        label: userInfo.fname && userInfo.lname ? `${userInfo.fname} ${userInfo.lname}` : "User",
        href: `/dashboard/${userRole}/profile`,
        icon: (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {firstInitial}
          </div>
        ),
      };
    }
    
    // Fallback for each role
    if (userRole === 'admin') {
      return {
        label: "Admin User",
        href: "/dashboard/admin/profile",
        icon: (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            A
          </div>
        ),
      };
    } else if (userRole === 'superadmin') {
      return {
        label: "Super Admin",
        href: "/dashboard/super-admin/profile",
        icon: (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            S
          </div>
        ),
      };
    } else {
      return {
        label: "Student",
        href: "/dashboard/student/profile",
        icon: (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            S
          </div>
        ),
      };
    }
  };

  return (
    <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          <Logo />

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col gap-2">
            {navItems.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex flex-col gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <SidebarLink link={getUserDisplay()} />
        </div>
      </SidebarBody>
    </Sidebar>
  )
}

export default UnifiedSidebar 
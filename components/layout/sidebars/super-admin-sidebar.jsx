"use client"
import { 
  Sidebar, 
  SidebarProvider,
  useSidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import { GraduationCap } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"
import {
  IconLayoutDashboard,
  IconUserCircle,
  IconUsers,
  IconChartBar,
  IconFileText,
  IconShield,
  IconSettings,
  IconDatabase,
  IconCalendarCheck,
  IconCalendarEvent
} from "@tabler/icons-react"

// Define the navigation items for super admin
const superAdminNavItems = [
  { label: "Dashboard", href: "/dashboard/super-admin", icon: <IconLayoutDashboard className="h-6 w-6 shrink-0" /> },
  { label: "Profile", href: "/dashboard/super-admin/profile", icon: <IconUserCircle className="h-6 w-6 shrink-0" /> },
  { label: "User Management", href: "/dashboard/super-admin/users", icon: <IconUsers className="h-6 w-6 shrink-0" /> },
  { label: "1-on-1 Sessions", href: "/dashboard/student/sessions", icon: <IconCalendarCheck className="h-6 w-6 shrink-0" /> },
  { label: "Events", href: "/dashboard/admin/sessions", icon: <IconCalendarEvent className="h-6 w-6 shrink-0" /> },
  { label: "System Analytics", href: "/dashboard/super-admin/analytics", icon: <IconChartBar className="h-6 w-6 shrink-0" /> },
  { label: "Audit Logs", href: "/dashboard/super-admin/audit", icon: <IconFileText className="h-6 w-6 shrink-0" /> },
  { label: "Security & Compliance", href: "/dashboard/super-admin/security", icon: <IconShield className="h-6 w-6 shrink-0" /> },
  { label: "System Settings", href: "/dashboard/super-admin/settings", icon: <IconSettings className="h-6 w-6 shrink-0" /> },
  { label: "Dev Tools", href: "/dashboard/super-admin/dev-tools", icon: <IconDatabase className="h-6 w-6 shrink-0" /> },
]

const SuperAdminSidebarContent = () => {
  const { open } = useSidebar()

  const Logo = () => (
    <div className="flex items-center gap-2 py-1">
      <GraduationCap className="h-8 w-8 text-[#A91827]" />
      {open && <span className="text-xl font-bold">CSOFT</span>}
    </div>
  )

  return (
    <SidebarContent className="justify-between gap-10">
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {/* Logo */}
        <SidebarHeader>
          <Logo />
        </SidebarHeader>

        {/* Navigation Links */}
        <SidebarMenu>
          {superAdminNavItems.map((link, idx) => (
            <SidebarMenuItem key={idx}>
              <SidebarMenuButton
                asChild
                tooltip={link.label}
                href={link.href}
              >
                <a href={link.href} className="flex items-center gap-2">
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>

      {/* Footer Section */}
      <SidebarFooter>
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile */}
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            href="/dashboard/super-admin/profile"
          >
            <a className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                A
              </div>
              <span>Alex Admin</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </SidebarContent>
  )
}

const SuperAdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar>
        <SuperAdminSidebarContent />
      </Sidebar>
    </SidebarProvider>
  )
}

export default SuperAdminSidebar

// Super Admin Profile ------------------

// Dashboard
// Profile
// 1-on-1 Sessions -- view 1-on-1 Sessions with career advisors (total number of individuals they've met )
// User Management
////////////// Chat
// System Analytics
// Audit Logs
// Security & Compliance
// System Settings
// Dev Tools
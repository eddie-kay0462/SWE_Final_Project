"use client"
import { LayoutDashboard, Users, BarChart3, FileText, Shield, Settings, Database, UserPen, MessageCircle } from "lucide-react"
import Sidebar from "../sidebar"

// Define the navigation items for super admin
const superAdminNavItems = [
  { name: "Dashboard", href: "/dashboard/super-admin", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/super-admin/profile", icon: UserPen },
  { name: "User Management", href: "/dashboard/super-admin/users", icon: Users },
  // { name: "Chat", href: "/dashboard/super-admin/chat", icon: MessageCircle },
  { name: "System Analytics", href: "/dashboard/super-admin/analytics", icon: BarChart3 },
  { name: "Audit Logs", href: "/dashboard/super-admin/audit", icon: FileText },
  { name: "Security & Compliance", href: "/dashboard/super-admin/security", icon: Shield },
  { name: "System Settings", href: "/dashboard/super-admin/settings", icon: Settings },
  { name: "Dev Tools", href: "/dashboard/super-admin/dev-tools", icon: Database },
]

const SuperAdminSidebar = (props) => {
  return <Sidebar navItems={superAdminNavItems} {...props} />
}

export default SuperAdminSidebar

// Super Admin Profile ------------------

// Dashboard
// Profile
// User Management
////////////// Chat
// System Analytics
// Audit Logs
// Security & Compliance
// System Settings
// Dev Tools
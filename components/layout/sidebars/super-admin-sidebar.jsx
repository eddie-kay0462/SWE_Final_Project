"use client"
import { LayoutDashboard, Users, BarChart3, FileText, Shield, Settings, Database, UserPen, MessageCircle } from "lucide-react"
import Sidebar from "../sidebar"

// Define the navigation items for super admin
const superAdminNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "../../profile", icon: UserPen },
  { name: "User Management", href: "/dashboard/users", icon: Users },
  // { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  { name: "System Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Audit Logs", href: "/dashboard/audit", icon: FileText },
  { name: "Security & Compliance", href: "/dashboard/security", icon: Shield },
  { name: "System Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Dev Tools", href: "/dashboard/dev-tools", icon: Database },
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
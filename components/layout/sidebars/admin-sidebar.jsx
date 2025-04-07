"use client"
import { LayoutDashboard, FileText, Calendar, BarChart3, Users, Bell, Settings, UserPen, MessageCircle, CalendarCheck } from "lucide-react"
import Sidebar from "../sidebar"

// Define the navigation items for admin
const adminNavItems = [
  { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/admin/profile", icon: UserPen },
  { name: "Internship Requests", href: "/dashboard/admin/internship-request", icon: FileText },
  { name: "1-on-1 Sessions", href: "/dashboard/admin/sessions", icon: CalendarCheck },
  { name: "Events", href: "/dashboard/admin/events", icon: Calendar },
  // { name: "Attendance Reports", href: "/dashboard/admin/attendance", icon: BarChart3 },
  { name: "Student Profiles", href: "/dashboard/admin/students", icon: Users },
  { name: "Notifications", href: "/dashboard/admin/notifications", icon: Bell },
  // { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  // { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const AdminSidebar = (props) => {
  return <Sidebar navItems={adminNavItems} {...props} />
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
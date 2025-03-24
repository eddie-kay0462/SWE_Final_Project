"use client"
import { LayoutDashboard, FileText, Calendar, BarChart3, Bell, Settings, UserPen, MessageCircle, FileUser } from "lucide-react"
import Sidebar from "../sidebar"
import Dashboard from "@/app/dashboard/page"

// Define the navigation items for student
const studentNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "../../profile", icon: UserPen },
  { name: "Resume", href: "../../resume", icon: FileUser },
  { name: "Internship Requests", href: "/dashboard/internships", icon: FileText },
  // { name: "Career Sessions", href: "/dashboard/sessions", icon: Calendar },
  { name: "Attendance History", href: "/dashboard/attendance", icon: BarChart3 },
  // { name: "Career Resources", href: "/dashboard/resources", icon: FileText },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  // { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  // { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const StudentSidebar = (props) => {
  return <Sidebar navItems={studentNavItems} {...props} />
}

export default StudentSidebar


// Student Profile ------------------

// Dashboard
// Profile
// Resumes -- View, Update and Delete resumes
// Internship Request Letters -- Submit internship request letter [must meet specific requirements]
////////////// Career Sessions -- View recents career sessions , view past and upcoming as well -- Don't need { Shows on event page }
// Attendance History -- Track session attendance {Sessions attended and missed}
////////////// Career Resources -- View career resources {CV guides, Cover Letter Templates, Career Tips, other advice}
// Notifications -- Notified of Current Career Session {30 mins notification}
////////////// Chat -- Send and recieve messages from admin { Future Implementation }
////////////// Settings

"use client"
import { LayoutDashboard, FileText, Calendar, BarChart3, Bell, Settings, UserPen, MessageCircle, FileUser, CalendarCheck } from "lucide-react"
import Sidebar from "../sidebar"
import Dashboard from "@/app/dashboard/page"

// Define the navigation items for student
const studentNavItems = [
  { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/student/profile", icon: UserPen },
  { name: "Resume", href: "/dashboard/student/resume", icon: FileUser },
  { name: "Internship Requests", href: "/dashboard/student/internship-request", icon: FileText },
  { name: "1-on-1 Sessions", href: "/dashboard/student/sessions", icon: CalendarCheck },
  // { name: "Career Sessions", href: "/dashboard/sessions", icon: Calendar },
  { name: "Attendance History", href: "/dashboard/student/attendance-history", icon: BarChart3 },
  // { name: "Career Resources", href: "/dashboard/resources", icon: FileText },
  { name: "Notifications", href: "/dashboard/student/notifications", icon: Bell },
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
// 1-on-1 Sessions -- Book 1-on-1 Sessions with career advisor
////////////// Career Sessions -- View recents career sessions , view past and upcoming as well -- Don't need { Shows on event page }
// Attendance History -- Track session attendance {Sessions attended and missed}
////////////// Career Resources -- View career resources {CV guides, Cover Letter Templates, Career Tips, other advice}
// Notifications -- Notified of Current Career Session {30 mins notification}
////////////// Chat -- Send and recieve messages from admin { Future Implementation }
////////////// Settings



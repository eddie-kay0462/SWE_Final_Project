"use client"
import { LayoutDashboard, FileText, Calendar, BarChart3, Bell, Settings, UserPen, MessageCircle, FileUser } from "lucide-react"
import Sidebar from "../sidebar"
import Dashboard from "@/app/dashboard/page"

// Define the navigation items for student
const studentNavItems = [
  { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/student/profile", icon: UserPen },
  { name: "Resume", href: "/dashboard/student/resume", icon: FileUser },
  { name: "Career Roadmap", href: "/dashboard/student/career-roadmap", icon: Map },
  { name: "Internship Requests", href: "/dashboard/student/internship-request", icon: FileText },
  { name: "1-on-1 Sessions", href: "/dashboard/student/one-on-one", icon: CalendarClock },
  { name: "Attendance History", href: "/dashboard/student/attendance-history", icon: BarChart3 },
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
// Attendance History -- Track session attendance {Sessions attended and missed}
// Notifications -- Notified of Current Career Session {30 mins notification}
////////////// Chat -- Send and recieve messages from admin { Future Implementation }
////////////// Settings



"use client"
import { LayoutDashboard, FileText, Bell, Settings, UserPen, MessageCircle, FileUser, CalendarClock, Map } from "lucide-react"
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
// Career Roadmap -- Track career development journey and recommended next steps
// Internship Request Letters -- Submit internship request letter [must meet specific requirements]
// 1-on-1 Sessions -- Book 1-on-1 Sessions with career advisor
// Notifications -- Notified of Current Career Session {30 mins notification}
////////////// Chat -- Send and recieve messages from admin { Future Implementation }
////////////// Settings



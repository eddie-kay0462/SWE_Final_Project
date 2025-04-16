"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  Menu,
  Home,
  Bell,
  Sun,
  Moon,
  Search,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Star,
  Download,
  Share2,
  Bot,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react"
import Navbar from "./navbar"

// Dynamically import sidebars with no SSR
const SuperAdminSidebar = dynamic(() => import("./sidebars/super-admin-sidebar"), { ssr: false })
const AdminSidebar = dynamic(() => import("./sidebars/admin-sidebar"), { ssr: false })
const StudentSidebar = dynamic(() => import("./sidebars/student-sidebar"), { ssr: false })

const DashboardLayout = ({ children, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Get the appropriate sidebar based on user role
  const getSidebar = () => {
    switch (userRole) {
      case "superadmin":
        return <SuperAdminSidebar />
      case "admin":
        return <AdminSidebar />
      case "student":
        return <StudentSidebar />
      default:
        return null
    }
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900 flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 z-50 h-screen transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {getSidebar()}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  )
}

export default DashboardLayout


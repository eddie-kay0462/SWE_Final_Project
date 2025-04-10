"use client"

import { useState } from "react"
import StudentSidebar from "./sidebars/student-sidebar"
import AdminSidebar from "./sidebars/admin-sidebar"
import SuperAdminSidebar from "./sidebars/super-admin-sidebar"
import Navbar from "./navbar"

const DashboardLayout = ({ children, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderSidebar = () => {
    switch (userRole) {
      case "student":
        return <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      case "admin":
        return <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      case "superAdmin":
        return <SuperAdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {renderSidebar()}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout


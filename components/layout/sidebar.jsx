"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { GraduationCap, X, ChevronLeft, ChevronRight, MoveLeft } from "lucide-react"

const Sidebar = ({ navItems, userRole, userName, userEmail, userAvatar, sidebarOpen, setSidebarOpen }) => {
  const [sidebarWidth, setSidebarWidth] = useState(250) // Default width
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const resizeRef = useRef(null)
  const sidebarRef = useRef(null)
  const pathname = usePathname()

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = Math.max(200, Math.min(400, e.clientX))
        setSidebarWidth(newWidth)
        if (sidebarRef.current) {
          sidebarRef.current.style.width = `${newWidth}px`
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Role label and color
  const roleLabels = {
    superAdmin: { label: "Super Admin", color: "bg-red-100 text-[#A91827]" },
    admin: { label: "Admin", color: "bg-blue-100 text-blue-800" },
    student: { label: "Student", color: "bg-green-100 text-green-800" },
  }

  const roleInfo = roleLabels[userRole]

  return (
    <aside
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${sidebarCollapsed ? "lg:w-20" : ""}`}
      style={{ width: sidebarCollapsed ? 80 : sidebarWidth }}
    >
      <div className="flex flex-col h-full relative">
        {/* Resize handle */}
        <div
          ref={resizeRef}
          className={`absolute top-0 right-0 h-full w-1 cursor-ew-resize hover:bg-[#A91827]/50 z-10 ${isResizing ? "bg-[#A91827]" : ""} ${sidebarCollapsed ? "hidden" : ""}`}
          onMouseDown={handleResizeStart}
        />

        {/* Collapse toggle button */}
        <button
          className="absolute -right-4 top-20 flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-md z-20 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-5 border-b dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-[#A91827]" />
            {!sidebarCollapsed && <span className="text-xl font-bold">CSOFT</span>}
          </Link>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        <div className={`px-4 py-4 border-b dark:border-gray-700 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          {sidebarCollapsed ? (
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {userAvatar ? (
                <Image src={userAvatar || "/placeholder.svg"} alt={userName} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {userAvatar ? (
                  <Image src={userAvatar || "/placeholder.svg"} alt={userName} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}
              >
                {roleInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              // const isActive = pathname === item.href
              const isActive = pathname === item.href || item.href !== '/dashboard' && pathname.startsWith(item.href)
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""} gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#A91827]/10 text-[#A91827] dark:bg-[#A91827]/20"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                    title={sidebarCollapsed ? item.name : ""}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-[#A91827]" : "text-gray-500 dark:text-gray-400"}`}
                    />
                    {!sidebarCollapsed && item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <Link href="/main/events">
          <div className="p-4 border-t dark:border-gray-700">
            <button
              className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""} gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors`}
              title={sidebarCollapsed ? "Back" : ""}
            >
              <MoveLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {!sidebarCollapsed && "Back"}
            </button>
          </div>
        </Link>
      
        
      </div>
    </aside>
  )
}

export default Sidebar


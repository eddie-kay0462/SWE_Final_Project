"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  GraduationCap,
  Menu,
  X,
  Home,
  Users,
  BarChart3,
  FileText,
  Calendar,
  Bell,
  Settings,
  Shield,
  Database,
  LogOut,
  Sun,
  Moon,
  Search,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Star,
  Download,
  Share2,
  Bot,
  ChevronUp,
  ChevronDown,
  ArrowUp,
} from "lucide-react"

// Define the navigation items for each role
const navigationItems = {
  superAdmin: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "User Management", href: "/dashboard/users", icon: Users },
    { name: "System Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Audit Logs", href: "/dashboard/audit", icon: FileText },
    { name: "Security & Compliance", href: "/dashboard/security", icon: Shield },
    { name: "System Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Dev Tools", href: "/dashboard/dev-tools", icon: Database },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Internship Requests", href: "/dashboard/internships", icon: FileText },
    { name: "Career Sessions", href: "/dashboard/sessions", icon: Calendar },
    { name: "Attendance Reports", href: "/dashboard/attendance", icon: BarChart3 },
    { name: "Student Profiles", href: "/dashboard/students", icon: Users },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  student: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Internship Requests", href: "/dashboard/internships", icon: FileText },
    { name: "Career Sessions", href: "/dashboard/sessions", icon: Calendar },
    { name: "Attendance History", href: "/dashboard/attendance", icon: BarChart3 },
    { name: "Career Resources", href: "/dashboard/resources", icon: FileText },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
}

// Define the top navbar items
const navbarTabs = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
]

export default function DashboardLayout({ children, userRole, userName, userEmail, userAvatar }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(250) // Default width
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("/dashboard")
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const resizeRef = useRef(null)
  const sidebarRef = useRef(null)
  const pathname = usePathname()

  // Set active tab based on pathname
  useEffect(() => {
    const matchingTab = navbarTabs.find(tab => pathname === tab.href);
    if (matchingTab) {
      setActiveTab(matchingTab.href);
    }
  }, [pathname]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = Math.max(200, Math.min(400, e.clientX));
        setSidebarWidth(newWidth);
        if (sidebarRef.current) {
          sidebarRef.current.style.width = `${newWidth}px`;
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Get navigation items based on user role
  const navItems = navigationItems[userRole] || navigationItems.student

  // Role label and color
  const roleLabels = {
    superAdmin: { label: "Super Admin", color: "bg-red-100 text-[#A91827]" },
    admin: { label: "Admin", color: "bg-blue-100 text-blue-800" },
    student: { label: "Student", color: "bg-green-100 text-green-800" },
  }

  const roleInfo = roleLabels[userRole]

  return (
    <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
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
            className={`absolute top-0 right-0 h-full w-1 cursor-ew-resize hover:bg-[#A91827]/50 z-10 ${isResizing ? 'bg-[#A91827]' : ''} ${sidebarCollapsed ? 'hidden' : ''}`}
            onMouseDown={handleResizeStart}
          />

          {/* Collapse toggle button */}
          <button 
            className="absolute -right-4 top-20 flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-md z-20 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? 
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            }
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
          <div className={`px-4 py-4 border-b dark:border-gray-700 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
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
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="p-4 border-t dark:border-gray-700">
            <button className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''} gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors`} title={sidebarCollapsed ? "Sign Out" : ""}>
              <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {!sidebarCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* AI Assistant */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${aiAssistantOpen ? 'scale-100' : 'scale-90'}`}>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${aiAssistantOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg p-4 mb-1 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">AI Assistant</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                onClick={() => setAiAssistantOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-[#A91827]/10 flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="h-5 w-5 text-[#A91827]" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg max-w-[80%]">
                    <p className="text-sm">Hello, {userName}! How can I assist you today?</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                    <div className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg max-w-[80%]">
                    <p className="text-sm">I need help with setting up a new internship request.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-[#A91827]/10 flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="h-5 w-5 text-[#A91827]" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg max-w-[80%]">
                    <p className="text-sm">I can help with that! Go to the Internship Requests section and click on "Submit New Request". Would you like me to guide you through the process?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A91827]"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#A91827] hover:text-[#A91827]/80">
                <ChevronUp className="h-5 w-5 rotate-45" />
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full bg-[#A91827] text-white shadow-lg hover:bg-[#A91827]/90 transition-all duration-300 ${aiAssistantOpen ? 'rotate-0' : 'rotate-12'}`}
        >
          {aiAssistantOpen ? (
            <ChevronDown className="h-6 w-6" />
          ) : (
            <Bot className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:pl-20" : ""
        }`}
        style={{ marginLeft: sidebarCollapsed ? 80 : sidebarWidth }}
      >
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex flex-col">
            {/* Top row with actions */}
            <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b dark:border-gray-700">
              {/* Mobile menu button */}
              <button
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A91827] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Search..."
                  />
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="hidden md:flex items-center gap-2 mr-4">
                <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                  <Star className="h-5 w-5" />
                </button>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <button
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {/* Notifications */}
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#A91827]"></span>
                </button>

                {/* Profile dropdown (simplified) */}
                <button className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {userAvatar ? (
                    <Image src={userAvatar || "/placeholder.svg"} alt={userName} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            {/* Navigation tabs */}
            <div className="flex items-center h-12 px-6 overflow-x-auto">
              {navbarTabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex items-center gap-2 px-5 py-2 mx-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.href
                      ? "border-[#A91827] text-[#A91827]"
                      : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab.href)}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

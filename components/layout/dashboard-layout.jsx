"use client"

<<<<<<< HEAD
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

// Dynamically import sidebars
const SuperAdminSidebar = dynamic(() => import("./sidebars/super-admin-sidebar"), { ssr: false })
const AdminSidebar = dynamic(() => import("./sidebars/admin-sidebar"), { ssr: false })
const StudentSidebar = dynamic(() => import("./sidebars/student-sidebar"), { ssr: false })
=======
import { useState } from "react"
import StudentSidebar from "./sidebars/student-sidebar"
import AdminSidebar from "./sidebars/admin-sidebar"
import SuperAdminSidebar from "./sidebars/super-admin-sidebar"
import Navbar from "./navbar"
>>>>>>> 8107b690c51f507047b1cdfb57ca607ebefd3f00

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
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f3f1ea] dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Render the appropriate sidebar */}
      <Suspense fallback={
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
          </div>
        </div>
      }>
        {renderSidebar()}
      </Suspense>

      {/* AI Assistant */}
      <Suspense fallback={null}>
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${aiAssistantOpen ? "scale-100" : "scale-90"}`}
        >
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${aiAssistantOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
          >
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
                      <p className="text-sm">
                        I can help with that! Go to the Internship Requests section and click on "Submit New Request".
                        Would you like me to guide you through the process?
                      </p>
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
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-[#A91827] text-white shadow-lg hover:bg-[#A91827]/90 transition-all duration-300 ${aiAssistantOpen ? "rotate-0" : "rotate-12"}`}
          >
            {aiAssistantOpen ? <ChevronDown className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </button>
        </div>
      </Suspense>

      {/* Main content */}
      <div className="lg:pl-64">
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
            {/* <div className="flex items-center h-12 px-6 overflow-x-auto">
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
            </div> */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A91827]"></div>
            </div>
          }>
            {children}
          </Suspense>
=======
    <div className="flex h-screen overflow-hidden">
      {renderSidebar()}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          {children}
>>>>>>> 8107b690c51f507047b1cdfb57ca607ebefd3f00
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout


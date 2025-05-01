"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/contexts/theme-context"
import { GraduationCap, Menu, X, Calendar, FileText, User, LogOut, Moon, Sun, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const { authUser, userProfile, signOut } = useAuth()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Function to determine dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!userProfile) return "/dashboard/student";
    switch (userProfile.role_id) {
      case 1:
        return "/dashboard/superadmin";
      case 2:
        return "/dashboard/admin";
      case 3:
      default:
        return "/dashboard/student";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {authUser ? (
              <>
                <Link
                  href="/main/events"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Events</span>
                  </div>
                </Link>
                <Link
                  href="/main/resources"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Resources</span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-sm font-medium hover:text-[#A91827] transition-colors">
                  Home
                </Link>
                <Link href="#features" className="text-sm font-medium hover:text-[#A91827] transition-colors">
                  Services
                </Link>
                <Link href="#benefits" className="text-sm font-medium hover:text-[#A91827] transition-colors">
                  About Us
                </Link>
              </>
            )}
          </div>

          {/* User Menu & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {authUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <span>{userProfile?.fname} {userProfile?.lname}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-1">
                    <Link
                      href={getDashboardUrl()}
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    <button 
                      onClick={signOut}
                      className="w-full text-left block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-sm font-medium text-black px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="text-sm font-medium px-4 py-2 bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {authUser ? (
              <>
                <Link
                  href="/main/events"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Events</span>
                  </div>
                </Link>
                <Link
                  href="/main/resources"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>Resources</span>
                  </div>
                </Link>
                <Link
                  href={getDashboardUrl()}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </div>
                </Link>
                <button 
                  onClick={signOut}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    <span>Sign out</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  Home
                </Link>
                <Link href="#features" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  Services
                </Link>
                <Link href="#benefits" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  About Us
                </Link>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                  <Link 
                    href="/auth/login" 
                    className="block px-3 py-2 text-center rounded-md text-base font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block px-3 py-2 text-center rounded-md text-base font-medium bg-[#A91827] text-white hover:bg-[#A91827]/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { GraduationCap, Menu, X, Home, Calendar, FileText, MessageSquare, User, LogOut, Moon, Sun } from "lucide-react"

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

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
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link
              href="/events"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Events</span>
              </div>
            </Link>
            <Link
              href="/resources"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Resources</span>
              </div>
            </Link>
            <Link
              href="/feed"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Feed</span>
              </div>
            </Link>
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

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <span>John Doe</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <button className="w-full text-left block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b border-border">
          <Link
            href="/dashboard"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link
            href="/events"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </div>
          </Link>
          <Link
            href="/resources"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Resources</span>
            </div>
          </Link>
          <Link
            href="/feed"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Feed</span>
            </div>
          </Link>
          <Link
            href="/profile"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </div>
          </Link>
          <button className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </div>
          </button>
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
    </nav>
  )
}
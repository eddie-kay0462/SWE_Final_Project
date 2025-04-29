"use client"

/**
 * Custom 404 Not Found Page
 * 
 * A CSOFT-themed page shown when users access an invalid URL
 */

import Link from "next/link"
import { GraduationCap, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1ea]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold text-black">CSOFT</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="text-[120px] md:text-[180px] font-bold text-[#A91827]/10">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="h-16 w-16 md:h-24 md:w-24 text-[#A91827]" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">Page Not Found</h1>
          
          <p className="text-lg text-[#000000]/70 mb-8">
            Looks like you've wandered off the career path! 
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#A91827] text-white px-6 py-3 rounded-lg hover:bg-[#A91827]/90 transition-colors mb-4 w-full"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <p className="text-sm text-[#000000]/70 mt-4">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#f3f1ea]">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#A91827]" />
              <span className="text-lg font-bold text-black">CSOFT</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-[#000000]/70">
                &copy; {new Date().getFullYear()} CSOFT. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
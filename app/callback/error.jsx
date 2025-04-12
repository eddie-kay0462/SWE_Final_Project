"use client"

/**
 * Global Error Page
 * 
 * A CSOFT-themed page shown when runtime errors occur
 * Provides option to retry or return to home page
 */

import { useEffect } from "react"
import Link from "next/link"
import { GraduationCap, RefreshCw, ArrowLeft } from "lucide-react"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1ea]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <GraduationCap className="h-16 w-16 text-[#A91827]" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Something Went Wrong</h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We encountered an unexpected error. Our team has been notified, and we're working to fix the issue.
          </p>

          <div className="flex flex-col space-y-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 bg-[#A91827] text-white px-6 py-3 rounded-lg hover:bg-[#A91827]/90 transition-colors w-full"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>

            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Return to Home</span>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm text-gray-500 font-medium">Error details:</p>
            <p className="text-sm text-gray-700 mt-1 break-words">
              {error?.message || "Unknown error occurred"}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#f3f1ea]">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#A91827]" />
              <span className="text-lg font-bold">CSOFT</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} CSOFT. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
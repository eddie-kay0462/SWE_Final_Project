"use client"

/**
 * Account Confirmed Page
 * 
 * Displays a success message after a user confirms their email address
 * Provides a direct link to the login page
 * 
 * @page.jsx handles post-email confirmation success state
 */

import Link from "next/link"
import { GraduationCap, CheckCircle } from "lucide-react"

export default function AccountConfirmed() {
  return (
    <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold text-black">CSOFT</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-xl overflow-hidden shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-[#A91827]" />
            </div>
            
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-normal mb-4 text-black">
                Account <span className="font-serif italic">Confirmed!</span>
              </h2>
              <p className="text-[#000000]/70 text-lg">
                Your email has been successfully verified. You can now access your account.
              </p>
            </div>

            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-between bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-6 rounded-lg transition-all text-lg w-full"
            >
              <span>Continue to Login</span>
              <svg width="24" height="10" viewBox="0 0 36 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M35.7071 8.20711C36.0976 7.81658 36.0976 7.18342 35.7071 6.79289L29.3431 0.428932C28.9526 0.0384078 28.3195 0.0384078 27.9289 0.428932C27.5384 0.819457 27.5384 1.45262 27.9289 1.84315L33.5858 7.5L27.9289 13.1569C27.5384 13.5474 27.5384 14.1805 27.9289 14.5711C28.3195 14.9616 28.9526 14.9616 29.3431 14.5711L35.7071 8.20711ZM0 8.5H35V6.5H0V8.5Z"
                  fill="white"
                />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#f3f1ea]">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-[#A91827]" />
              <span className="text-xl font-bold text-black">CSOFT</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-[#000000]/70">
                &copy; {new Date().getFullYear()} Career Services Platform. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
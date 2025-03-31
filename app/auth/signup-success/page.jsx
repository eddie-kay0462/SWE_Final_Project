    "use client"

/**
 * Signup Success Page
 * 
 * Displays a successful signup message and instructions for email verification
 * 
 * @page.jsx Renders after successful user registration to indicate next steps
 */

import Link from "next/link"
import { CheckCircle2, GraduationCap, ArrowLeft } from "lucide-react"

export default function SignupSuccess() {
  return (
    <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-[#A91827] transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium hover:text-[#A91827] transition-colors">
              Services
            </Link>
            <Link href="/#benefits" className="text-sm font-medium hover:text-[#A91827] transition-colors">
              About Us
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-xl animate-appear opacity-0">
          <div className="bg-white rounded-xl overflow-hidden shadow-xl p-10 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-serif font-normal mb-3">
              Account <span className="font-serif italic">Created</span>
            </h2>
            
            <p className="text-[#000000]/70 text-lg mb-6">
              Thank you for signing up. We've sent a confirmation email to your Ashesi email address.
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-left mb-8">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Next Steps:</h3>
              <ol className="space-y-2 text-blue-700">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Check your Ashesi email inbox for a verification link</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Click the verification link to activate your account</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Return to the login page to sign in after verification</span>
                </li>
              </ol>
            </div>
            
            <div className="flex flex-col gap-4">
              <Link 
                href="/auth/login"
                className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg inline-flex items-center justify-center gap-2"
              >
                Go to Login Page
              </Link>
              
              <Link 
                href="/"
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all text-lg inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#f3f1ea]">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-[#A91827]" />
              <span className="text-xl font-bold">CSOFT</span>
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
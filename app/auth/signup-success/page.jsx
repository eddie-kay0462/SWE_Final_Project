"use client"

/**
 * Signup Success Page
 * 
 * Displays a successful signup message and instructions for next steps
 * Includes celebratory animations and clear CTAs
 * 
 * @page.jsx Renders after successful user registration and OTP verification
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { GraduationCap, CheckCircle2, ArrowLeft } from "lucide-react"
import Confetti from 'react-confetti'
import { useRouter } from "next/navigation"

export default function SignupSuccess() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  const [showConfetti, setShowConfetti] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
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
        <div className="w-full max-w-xl animate-appear opacity-0">
          <div className="bg-white rounded-xl overflow-hidden shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-100"></div>
                <CheckCircle2 className="h-16 w-16 text-green-500 relative" />
              </div>
            </div>
            
            <h2 className="text-3xl font-serif font-normal mb-4">
              Welcome to the <span className="font-serif italic">Community!</span>
            </h2>
            
            <p className="text-[#000000]/70 text-lg mb-8">
              Your account has been successfully created and verified. You're now ready to access all our career services!
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-left mb-8">
              <h3 className="text-lg font-medium text-blue-800 mb-4">What's Next?</h3>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium">
                    1
                  </span>
                  <span>Log in to your account using your email and password</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium">
                    2
                  </span>
                  <span>Complete your profile with additional information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium">
                    3
                  </span>
                  <span>Start exploring career opportunities and services</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-4">
              <Link 
                href="/auth/login"
                className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg inline-flex items-center justify-center gap-2"
              >
                Continue to Login
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
"use client"

/**
 * OTP Verification Page
 * 
 * Handles verification of email OTP codes after signup
 * Validates the 6-digit code and creates user session
 * 
 * @page.jsx Implementation of OTP verification flow
 */

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { createClient } from '@/utils/supabase/client'

export default function VerifyOTP() {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      setError("No email provided. Please try signing up again.")
    }
  }, [searchParams])

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    
    setIsResending(true)
    setError(null)

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      })

      if (otpError) {
        if (otpError.message.includes('seconds')) {
          // Extract wait time from error message
          const seconds = parseInt(otpError.message.match(/\d+/)[0])
          setResendCooldown(seconds)
          setError(`Please wait ${seconds} seconds before requesting a new code.`)
        } else {
          throw otpError
        }
      } else {
        // Success - start 60s cooldown and show success message
        setResendCooldown(60)
        setError(null)
        // Show success message in green
        const successDiv = document.createElement('div')
        successDiv.className = 'mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg'
        successDiv.textContent = 'New code sent! Please check your email.'
        document.querySelector('form').insertBefore(successDiv, document.querySelector('form').firstChild)
        // Remove success message after 5 seconds
        setTimeout(() => successDiv.remove(), 5000)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Verify the OTP
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (verifyError) throw verifyError

      // Show page loading before redirect
      setIsPageLoading(true)
      
      // Redirect to success page
      setTimeout(() => {
        router.push("/auth/signup-success")
      }, 500)
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
      setIsPageLoading(false)
    }
  }

  // Handle OTP input
  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 6) {
      setOtp(value)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
      {/* Full Page Loading Spinner */}
      {isPageLoading && <LoadingSpinner fullPage size="large" text="Verifying your account" />}
      
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
          <div className="bg-white rounded-xl overflow-hidden shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-normal mb-2">
                Welcome to <span className="font-serif italic">CSOFT</span>
              </h1>
              <h2 className="text-xl text-[#000000]/70 mb-4">Confirm your signup</h2>
              <p className="text-[#000000]/70">
                Enter the 6-digit code sent to your email:
                <br />
                <span className="font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-lg ${
                error.includes('Please wait') 
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                  : 'bg-red-50 border border-red-200 text-[#A91827]'
              }`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  className="w-full text-center px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-4xl tracking-[1em] font-bold transition-all"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOTPChange}
                  maxLength={6}
                  required
                  pattern="\d{6}"
                  title="Please enter a 6-digit code"
                />
                <p className="text-sm text-center text-[#000000]/70 mt-2">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <LoadingButton
                type="submit"
                loading={isLoading}
                loadingText="Verifying Code"
                spinnerSize="small"
                className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg"
                disabled={otp.length !== 6}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Verify Email</span>
                  <svg width="24" height="10" viewBox="0 0 36 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M35.7071 8.20711C36.0976 7.81658 36.0976 7.18342 35.7071 6.79289L29.3431 0.428932C28.9526 0.0384078 28.3195 0.0384078 27.9289 0.428932C27.5384 0.819457 27.5384 1.45262 27.9289 1.84315L33.5858 7.5L27.9289 13.1569C27.5384 13.5474 27.5384 14.1805 27.9289 14.5711C28.3195 14.9616 28.9526 14.9616 29.3431 14.5711L35.7071 8.20711ZM0 8.5H35V6.5H0V8.5Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </LoadingButton>

              <div className="text-center text-[#000000]/70">
                <p>
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || isResending}
                    className={`text-[#A91827] hover:underline ${(resendCooldown > 0 || isResending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isResending ? (
                      "Sending..."
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend code"
                    )}
                  </button>
                </p>
              </div>
            </form>
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
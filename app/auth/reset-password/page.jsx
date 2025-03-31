"use client"

/**
 * Reset Password Page
 * 
 * Allows users to set a new password after using the reset link
 * Validates the token and updates the user's password
 * 
 * @page.jsx Implementation of the password reset completion flow
 */

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Check } from "lucide-react"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Verify that we have a valid reset token
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // Get the token hash from the URL
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token_hash || type !== 'recovery') {
          setError("Invalid or expired password reset link")
          return
        }

        setInitialized(true)
      } catch (err) {
        setError("An error occurred. Please request a new password reset link.")
      }
    }

    checkResetToken()
  }, [searchParams])

  /**
   * Handles form submission for password reset
   * Updates the user's password and redirects to login
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    try {
      // Get the token hash from the URL
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      // Update the user's password
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
        new_password: password,
      })

      if (error) throw error

      setSuccess(true)
      // Wait 3 seconds and redirect to login
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md animate-appear opacity-0">
          <div className="bg-white rounded-xl overflow-hidden shadow-xl p-8">
            {!initialized && !error ? (
              <div className="text-center py-6">
                <p className="text-lg">Verifying your reset link...</p>
              </div>
            ) : error && !success ? (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-3xl font-serif font-normal mb-2">
                    Reset <span className="font-serif italic">Failed</span>
                  </h2>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 text-[#A91827] rounded-lg">
                  {error}
                </div>

                <Link 
                  href="/auth/forgot-password"
                  className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg flex items-center justify-center"
                >
                  Request New Reset Link
                </Link>
              </div>
            ) : success ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-medium">Password Reset Successfully</h2>
                
                <p className="text-gray-600">
                  Your password has been updated. You'll be redirected to the login page shortly.
                </p>
                
                <Link 
                  href="/auth/login"
                  className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg flex items-center justify-center"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-serif font-normal mb-2">
                    Set New <span className="font-serif italic">Password</span>
                  </h2>
                  <p className="text-[#000000]/70 text-lg">
                    Create a strong, secure password for your account
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#A91827] rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="password">
                      New Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg flex items-center justify-between"
                    disabled={loading}
                  >
                    <span>{loading ? "Updating Password..." : "Reset Password"}</span>
                    <svg width="24" height="10" viewBox="0 0 36 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M35.7071 8.20711C36.0976 7.81658 36.0976 7.18342 35.7071 6.79289L29.3431 0.428932C28.9526 0.0384078 28.3195 0.0384078 27.9289 0.428932C27.5384 0.819457 27.5384 1.45262 27.9289 1.84315L33.5858 7.5L27.9289 13.1569C27.5384 13.5474 27.5384 14.1805 27.9289 14.5711C28.3195 14.9616 28.9526 14.9616 29.3431 14.5711L35.7071 8.20711ZM0 8.5H35V6.5H0V8.5Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </form>
              </>
            )}
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
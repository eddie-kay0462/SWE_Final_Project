"use client"

/**
 * Login Page
 * 
 * Handles user authentication and role-based redirections
 * Validates Ashesi email domain and manages the login flow
 * 
 * @page.jsx Implementation of user login with role-based redirection
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { GraduationCap, AlertTriangle } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const router = useRouter()

  /**
   * Handles form submission for user login
   * Makes API call to the backend login endpoint
   * Redirects user based on their role
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate Ashesi email domain
    const parts = email.split('@')
    if (parts.length !== 2 || (parts[1] !== 'ashesi.edu.gh' && parts[1] !== 'aucampus.onmicrosoft.com')) {
      setError('Only Ashesi email addresses are allowed (ashesi.edu.gh or aucampus.onmicrosoft.com)')
      setIsLoading(false)
      return
    }

    try {
      // Call the backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Enhanced error handling
        if (response.status === 404) {
          throw new Error(
            'User profile not found. This could happen if your account was recently created ' +
            'but not fully set up. Please try signing up again or contact support.'
          )
        } else if (response.status === 401) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        } else {
          throw new Error(data.error || 'An error occurred during login. Please try again.')
        }
      }

      // Show page loading before redirect
      setIsPageLoading(true)
      
      // Redirect based on user role from the API response
      setTimeout(() => {
        router.push(data.redirectPath || '/')
      }, 500) // Short delay to show the loading state
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
      setIsPageLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
      {/* Full Page Loading Spinner */}
      {isPageLoading && <LoadingSpinner fullPage size="large" text="Redirecting to dashboard" />}
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold text-black">CSOFT</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-black hover:text-[#A91827] transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium text-black hover:text-[#A91827] transition-colors">
              Services
            </Link>
            <Link href="/#benefits" className="text-sm font-medium text-black hover:text-[#A91827] transition-colors">
              About Us
            </Link>
          </nav>
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl animate-appear opacity-0">
          <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-xl">
            {/* Left Side - Login Form */}
            <div className="w-full md:w-1/2 p-6 md:p-10">
              <div className="mb-6">
                <h2 className="text-3xl font-serif font-normal mb-2 text-black">
                  Welcome <span className="font-serif italic">back</span>
                </h2>
                <p className="text-[#000000]/70 text-lg">Please enter your details to access your account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#A91827] rounded-lg animate-appear opacity-0 delay-100">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#A91827] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#A91827]">{error}</p>
                      {error.includes('User profile not found') && (
                        <div className="mt-2 text-sm text-[#A91827]">
                          <p>If you're trying to log in for the first time:</p>
                          <ul className="list-disc ml-5 mt-1 space-y-1">
                            <li>Make sure you've completed the signup process</li>
                            <li>Check that you're using the exact email you registered with</li>
                            <li>Try signing up again if your account was not created properly</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="animate-appear opacity-0 delay-200">
                  <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="email">
                    Ashesi Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all bg-white text-black"
                    placeholder="yourname@ashesi.edu.gh"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="animate-appear opacity-0 delay-300">
                  <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all bg-white text-black"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <div className="flex justify-end mt-2">
                    <Link href="/auth/forgot-password" className="text-[#A91827] hover:underline text-sm">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="animate-appear opacity-0 delay-400">
                  <LoadingButton
                    type="submit"
                    loading={isLoading}
                    loadingText="Signing in"
                    spinnerSize="small"
                    className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Sign In</span>
                      <svg width="24" height="10" viewBox="0 0 36 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M35.7071 8.20711C36.0976 7.81658 36.0976 7.18342 35.7071 6.79289L29.3431 0.428932C28.9526 0.0384078 28.3195 0.0384078 27.9289 0.428932C27.5384 0.819457 27.5384 1.45262 27.9289 1.84315L33.5858 7.5L27.9289 13.1569C27.5384 13.5474 27.5384 14.1805 27.9289 14.5711C28.3195 14.9616 28.9526 14.9616 29.3431 14.5711L35.7071 8.20711ZM0 8.5H35V6.5H0V8.5Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </LoadingButton>
                </div>
              </form>

              <p className="text-center text-lg text-[#000000]/70 mt-6 animate-appear opacity-0 delay-500">
                Don't have an account yet?{" "}
                <Link href="/auth/signup" className="text-[#A91827] hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Right Side - Image */}
            <div className="hidden md:block w-1/2 relative animate-appear opacity-0 delay-200">
              <Image
                src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop"
                alt="Professional person smiling"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#A91827]/40 to-transparent"></div>
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


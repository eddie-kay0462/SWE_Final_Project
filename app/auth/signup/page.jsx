"use client"

/**
 * Signup Page
 * 
 * Handles user registration with role-based fields
 * Validates Ashesi email domain and student ID format
 * 
 * @page.jsx Implementation of user registration with role-specific validation
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { GraduationCap } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [role, setRole] = useState("student") // Default to student
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const router = useRouter()

  /**
   * Handles form submission for user registration
   * Makes API call to the backend signup endpoint
   * Enforces email and student ID validation
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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    // Validate student ID if role is student
    if (role === 'student') {
      if (!studentId) {
        setError('Student ID is required')
        setIsLoading(false)
        return
      }

      // Validate student ID format (XXXX20XX)
      const studentIdPattern = /^\d{4}20\d{2}$/
      if (!studentIdPattern.test(studentId)) {
        setError('Invalid Student ID format. Expected format: XXXX20XX')
        setIsLoading(false)
        return
      }
    }

    try {
      // Call the backend API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          studentId: role === 'student' ? studentId : null,
          role
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Show page loading before redirect
      setIsPageLoading(true)
      
      // Navigate to success page
      setTimeout(() => {
        router.push("/auth/signup-success")
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
      {isPageLoading && <LoadingSpinner fullPage size="large" text="Creating your account" />}
      
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
        <div className="w-full max-w-4xl animate-appear opacity-0">
          <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-xl">
            {/* Left Side - Signup Form */}
            <div className="w-full md:w-1/2 p-6 md:p-10">
              <div className="mb-6">
                <h2 className="text-3xl font-serif font-normal mb-2">
                  Create <span className="font-serif italic">Account</span>
                </h2>
                <p className="text-[#000000]/70 text-lg">Join our platform to access career services</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#A91827] rounded-lg animate-appear opacity-0 delay-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role selection */}
                <div className="animate-appear opacity-0 delay-100">
                  <label className="block text-[#000000]/70 text-lg font-medium mb-2">
                    I am a:
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${role === 'student' ? 'border-[#A91827] bg-[#A91827]/5' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={role === 'student'}
                        onChange={() => setRole('student')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border ${role === 'student' ? 'border-[#A91827] bg-[#A91827]' : 'border-gray-400'}`}></div>
                        <span className="font-medium">Student</span>
                      </div>
                    </label>
                    <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${role === 'admin' ? 'border-[#A91827] bg-[#A91827]/5' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={role === 'admin'}
                        onChange={() => setRole('admin')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border ${role === 'admin' ? 'border-[#A91827] bg-[#A91827]' : 'border-gray-400'}`}></div>
                        <span className="font-medium">Staff/Admin</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="animate-appear opacity-0 delay-200">
                    <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                      placeholder="Eddie"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="animate-appear opacity-0 delay-300">
                    <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                      placeholder="Kay"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Student ID (only for students) */}
                {role === 'student' && (
                  <div className="animate-appear opacity-0 delay-400">
                    <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="studentId">
                      Student ID
                    </label>
                    <input
                      id="studentId"
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                      placeholder="12342023"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required={role === 'student'}
                    />
                    <p className="text-sm text-gray-500 mt-1">Format: XXXX20XX (e.g., 12342023)</p>
                  </div>
                )}

                {/* Email */}
                <div className="animate-appear opacity-0 delay-500">
                  <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="email">
                    Ashesi Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                    placeholder="yourname@ashesi.edu.gh"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div className="animate-appear opacity-0 delay-600">
                  <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="animate-appear opacity-0 delay-700">
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

                {/* Admin note */}
                {role === 'admin' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm animate-appear opacity-0 delay-800">
                    <p className="font-medium text-yellow-800">Admin Registration Notice</p>
                    <p className="text-yellow-700 mt-1">
                      For admin accounts, you need to be approved. An email invitation is usually required.
                      You can continue signing up, but access will be restricted until approved.
                    </p>
                  </div>
                )}

                {/* Form submission button */}
                <div className="animate-appear opacity-0 delay-700">
                  <LoadingButton
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Creating Account"
                    spinnerSize="small"
                    className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Create Account</span>
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
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#A91827] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Right Side - Image */}
            <div className="hidden md:block w-1/2 relative animate-appear opacity-0 delay-200">
              <Image
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Professional team collaborating"
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


/**
 * Handles user registration for both students and staff/admin
 * 
 * @route POST /api/auth/signup
 * @param {Object} request - The request object containing user signup data
 * @returns {Object} Response with success status or error message
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
export async function POST(req) {
  try {
    const { email, password, firstName, lastName, studentId, role } = await req.json()
    const reqCookies = {}
    const supabase = await createClient(reqCookies)

    // Validate Ashesi email domain by splitting at @ and checking domain
    const [username, domain] = email.split('@')
    if (domain !== 'ashesi.edu.gh' && domain !== 'aucampus.onmicrosoft.com') {
      return NextResponse.json(
        { error: 'Only Ashesi email addresses are allowed (ashesi.edu.gh or aucampus.onmicrosoft.com)' },
        { status: 400 }
      )
    }

    // Determine role_id
    const roleId = role === 'admin' ? 2 : 3 // Default to student (3) if not admin

    // Validate studentId format if role is student
    if (roleId === 3) {
      if (!studentId) {
        return NextResponse.json(
          { error: 'Student ID is required for student accounts' },
          { status: 400 }
        )
      }
      
      // Validate student ID pattern (XXXX20XX)
      const studentIdPattern = /^\d{4}20\d{2}$/
      if (!studentIdPattern.test(studentId)) {
        return NextResponse.json(
          { error: 'Invalid Student ID format. Expected format: XXXX20XX' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists in users table
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('User already exists in users table:', existingUser)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          student_id: studentId || null,
          role_id: roleId
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    console.log('User created in Auth:', authData.user.id)

    // Create service role client for database operations
    const serviceRoleClient = await createClient(reqCookies, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Prepare user data for insertion
    const userData = {
      id: authData.user.id,
      email: email,
      fname: firstName,
      lname: lastName,
      student_id: studentId || null,
      role_id: roleId,
      password: 'hashed_by_supabase' // The actual password is managed by Supabase Auth
    }

    console.log('Inserting user into users table:', userData)

    // Insert the user into our custom users table using service role client
    // This is because Supabase Auth doesn't store custom fields like student_id in its main users table
    const { data: insertData, error: insertError } = await serviceRoleClient
      .from('users')
      .insert(userData)
      .select()

    if (insertError) {
      console.error('Error inserting user into users table:', insertError)
      
      // Try to clean up the auth user since the database insert failed
      try {
        const { error: deleteError } = await serviceRoleClient.auth.admin.deleteUser(authData.user.id)
        if (deleteError) {
          console.error('Error cleaning up auth user after failed insert:', deleteError)
        }
      } catch (cleanupError) {
        console.error('Exception cleaning up auth user:', cleanupError)
      }
      
      // Return error to client
      return NextResponse.json(
        { error: 'Error creating user profile: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('User successfully inserted into users table')
    
    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email for verification.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role_id: roleId
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup process error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

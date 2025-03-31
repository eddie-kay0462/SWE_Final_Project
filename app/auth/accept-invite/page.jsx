"use client"

/**
 * Accept Invitation Page
 * 
 * Handles completion of admin/staff account setup after receiving an invitation
 * Allows setting a password and completing profile information
 * 
 * @page.jsx handles invitation completion flow for admin/staff accounts
 */

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function AcceptInvite() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Get and parse the invite token
  useEffect(() => {
    const getInviteInfo = async () => {
      try {
        // Check for token hash in URL
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        if (!token_hash || type !== 'invite') {
          setError("Invalid invitation link")
          return
        }

        // Verify the token without completing the sign-in
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'invite',
          options: {
            skipSession: true
          }
        })

        if (error) {
          setError(error.message)
          return
        }

        // If verification successful, set the email
        if (data && data.email) {
          setEmail(data.email)
        }
        
        setInitialized(true)
      } catch (err) {
        setError("Failed to process invitation. Please request a new invitation.")
      }
    }

    getInviteInfo()
  }, [searchParams, supabase])

  /**
   * Handles form submission to create the admin account
   * Completes the invitation process and creates a profile in the users table
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

    try {
      // Complete the sign-up process
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      // First update the user with password and metadata
      const { data, error: updateError } = await supabase.auth.updateUser({
        password,
        data: {
          first_name: firstName,
          last_name: lastName,
          role_id: 2 // Admin/Staff role
        }
      })

      if (updateError) throw updateError

      // Now sign in with the invitation
      const { error: signInError } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'invite'
      })

      if (signInError) throw signInError

      // Create an entry in the users table
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        fname: firstName,
        lname: lastName,
        email: email,
        role_id: 2, // Admin/Staff role
        password: 'hashed_by_supabase'
      })

      if (insertError) throw insertError

      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // If not initialized or error loading invitation data
  if (!initialized && !error) {
    return (
      <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-[#A91827]" />
              <span className="text-xl font-bold">CSOFT</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading invitation details...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f1ea] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-xl overflow-hidden shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-serif font-normal mb-2">
                Complete <span className="font-serif italic">Account Setup</span>
              </h2>
              <p className="text-[#000000]/70 text-lg">
                {email ? `Set up your admin account for ${email}` : 'Finish setting up your admin account'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#A91827] rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A91827] text-lg transition-all"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="email">
                  Email (readonly)
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-lg"
                  value={email}
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label className="block text-[#000000]/70 text-lg font-medium mb-2" htmlFor="password">
                  Create Password
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

              <div>
                <button
                  type="submit"
                  className="w-full bg-[#A91827] hover:bg-[#A91827]/90 text-white font-medium py-3 px-4 rounded-lg transition-all text-lg flex items-center justify-between"
                  disabled={loading}
                >
                  <span>{loading ? "Setting up account..." : "Complete Setup"}</span>
                  <svg width="24" height="10" viewBox="0 0 36 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M35.7071 8.20711C36.0976 7.81658 36.0976 7.18342 35.7071 6.79289L29.3431 0.428932C28.9526 0.0384078 28.3195 0.0384078 27.9289 0.428932C27.5384 0.819457 27.5384 1.45262 27.9289 1.84315L33.5858 7.5L27.9289 13.1569C27.5384 13.5474 27.5384 14.1805 27.9289 14.5711C28.3195 14.9616 28.9526 14.9616 29.3431 14.5711L35.7071 8.20711ZM0 8.5H35V6.5H0V8.5Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

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
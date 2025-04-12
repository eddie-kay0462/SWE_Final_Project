/**
 * Custom Authentication Hook
 * 
 * <p>Provides authentication utilities and user session state management
 * for use throughout the application.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// Create context for auth
const AuthContext = createContext(null)

/**
 * Provider component for authentication context
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @return {JSX.Element} Auth provider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch and set user session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true)
        
        // Get current session and user
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Fetch additional user data
          await fetchUserData(session.user.email)
        } else {
          setUser(null)
          setUserData(null)
        }
      } catch (err) {
        console.error('Error fetching session:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserData(session.user.email)
        } else {
          setUser(null)
          setUserData(null)
        }
      }
    )

    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  /**
   * Fetches detailed user data from the database
   *
   * @param {string} email - User's email address
   */
  const fetchUserData = async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        throw error
      }

      setUserData(data)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err.message)
    }
  }

  /**
   * Handles user sign in with email and password
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} redirectTo - URL to redirect to after successful login
   * @return {Promise<Object>} Result of the login attempt
   */
  const signIn = async (email, password, redirectTo = '/dashboard/student') => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Get user role to determine redirect
      if (data.user) {
        await fetchUserData(data.user.email)
        
        // Determine redirect based on role
        if (userData) {
          const roleId = userData.role_id || 3 // Default to student
          
          if (roleId === 1) {
            redirectTo = '/dashboard/super-admin'
          } else if (roleId === 2) {
            redirectTo = '/dashboard/admin'
          } else {
            redirectTo = '/dashboard/student'
          }
        }
        
        router.push(redirectTo)
      }

      return { success: true }
    } catch (err) {
      console.error('Error signing in:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles user sign up with email and password
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {Object} userInfo - Additional user information
   * @return {Promise<Object>} Result of the signup attempt
   */
  const signUp = async (email, password, userInfo) => {
    try {
      setLoading(true)
      setError(null)

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // If successful, create user record in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              fname: userInfo.firstName,
              lname: userInfo.lastName,
              role_id: userInfo.roleId || 3, // Default to student
              created_at: new Date(),
            },
          ])

        if (profileError) {
          throw profileError
        }

        router.push('/auth/login')
      }

      return { success: true }
    } catch (err) {
      console.error('Error signing up:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles user sign out
   *
   * @return {Promise<Object>} Result of the signout attempt
   */
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setUserData(null)
      router.push('/')

      return { success: true }
    } catch (err) {
      console.error('Error signing out:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Updates user information
   *
   * @param {Object} updates - Object containing user data to update
   * @return {Promise<Object>} Result of the update attempt
   */
  const updateUserData = async (updates) => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setUserData(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating user data:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Create value object with all auth functions and state
  const value = {
    user,
    userData,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUserData,
    fetchUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use authentication context
 *
 * @return {Object} Authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth 
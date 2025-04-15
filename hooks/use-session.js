/**
 * Custom hook for managing user sessions using cookies
 * Provides functions to get, set, and clear user session data
 */

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const SESSION_COOKIE_NAME = 'user_session'
const SESSION_DURATION_DAYS = 7

export function useSession() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  /**
   * Initialize session from cookie
   */
  useEffect(() => {
    const sessionData = Cookies.get(SESSION_COOKIE_NAME)
    if (sessionData) {
      try {
        setSession(JSON.parse(sessionData))
      } catch (error) {
        console.error('Failed to parse session cookie:', error)
        Cookies.remove(SESSION_COOKIE_NAME)
      }
    }
    setIsLoading(false)
  }, [])

  /**
   * Create a new session for a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Session data
   */
  const login = async (email, password) => {
    try {
      // Get user data from your users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // Note: In production, use proper password hashing
        .single()

      if (error || !userData) {
        throw new Error('Invalid credentials')
      }

      // Create session data
      const sessionData = {
        id: userData.id,
        email: userData.email,
        student_id: userData.student_id,
        fname: userData.fname,
        lname: userData.lname,
        role_id: userData.role_id,
        profilepic: userData.profilepic
      }

      // Store in cookie
      Cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        expires: SESSION_DURATION_DAYS,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      })

      setSession(sessionData)
      return sessionData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * End the current session
   */
  const logout = () => {
    Cookies.remove(SESSION_COOKIE_NAME)
    setSession(null)
  }

  /**
   * Get current session data
   * @returns {Object|null} Current session data or null if not logged in
   */
  const getCurrentSession = () => {
    return session
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  const isAuthenticated = () => {
    return !!session
  }

  /**
   * Update session data
   * @param {Object} updates - Fields to update in the session
   */
  const updateSession = (updates) => {
    if (!session) return

    const updatedSession = {
      ...session,
      ...updates
    }

    Cookies.set(SESSION_COOKIE_NAME, JSON.stringify(updatedSession), {
      expires: SESSION_DURATION_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    })

    setSession(updatedSession)
  }

  return {
    session,
    isLoading,
    login,
    logout,
    getCurrentSession,
    isAuthenticated,
    updateSession
  }
} 
/**
 * Dashboard Layout Component
 * 
 * <p>This component serves as the main layout wrapper for all dashboard pages, rendering
 * the appropriate sidebar based on user role and providing structure for dashboard content.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import UnifiedSidebar from '@/components/layout/sidebars/unified-sidebar'
import { usePathname } from 'next/navigation'

/**
 * Dashboard layout that wraps all dashboard content and renders the sidebar
 * 
 * @param {Object} children - The child components to render within the layout
 * @return {JSX.Element} The dashboard layout component
 */
export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Determine user role from pathname
  let userRole = 'student'
  if (pathname.includes('/admin')) {
    userRole = 'admin'
  } else if (pathname.includes('/super-admin')) {
    userRole = 'superadmin'
  }

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const supabase = createClient()
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error("Authentication error:", userError)
          return
        }

        // Fetch user details using email
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (userDataError) {
          console.error("Error fetching user data:", userDataError)
          return
        }

        setUserInfo(userData)
      } catch (error) {
        console.error("Error in fetchUserInfo:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen">
      <UnifiedSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userInfo={userInfo}
        userRole={userRole}
      />
      
      <main className="flex-1 p-6 transition-all duration-300 ease-in-out" 
            style={{ marginLeft: sidebarOpen ? '240px' : '80px' }}>
        {children}
      </main>
    </div>
  )
}

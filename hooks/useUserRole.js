/**
 * Custom User Role Hook
 * 
 * <p>Provides utilities for working with user roles throughout the application.
 * Determines current user role and provides helper functions for role-based access control.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
'use client'

import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'

/**
 * Role constants for mapping role IDs to string names
 */
export const USER_ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  STUDENT: 3
}

/**
 * Custom hook for user role management
 * 
 * @return {Object} User role information and utility functions
 */
export function useUserRole() {
  const { userData } = useAuth()
  const pathname = usePathname()

  /**
   * Get the user's role ID from userData
   * 
   * @return {number} The role ID (1: super admin, 2: admin, 3: student, undefined: unknown)
   */
  const getRoleId = () => {
    return userData?.role_id
  }

  /**
   * Get the user's role as a string
   * 
   * @return {string} The role as a string ('superadmin', 'admin', 'student', 'unknown')
   */
  const getRole = () => {
    const roleId = getRoleId()
    
    if (roleId === USER_ROLES.SUPER_ADMIN) return 'superadmin'
    if (roleId === USER_ROLES.ADMIN) return 'admin'
    if (roleId === USER_ROLES.STUDENT) return 'student'
    
    // Fallback to path-based role detection if userData is not available
    if (!userData) {
      if (pathname.includes('/super-admin')) return 'superadmin'
      if (pathname.includes('/admin')) return 'admin'
      if (pathname.includes('/student')) return 'student'
    }
    
    return 'unknown'
  }
  
  /**
   * Check if the user is a super admin
   * 
   * @return {boolean} True if the user is a super admin
   */
  const isSuperAdmin = () => {
    return getRoleId() === USER_ROLES.SUPER_ADMIN
  }
  
  /**
   * Check if the user is an admin
   * 
   * @return {boolean} True if the user is an admin
   */
  const isAdmin = () => {
    return getRoleId() === USER_ROLES.ADMIN
  }
  
  /**
   * Check if the user is a student
   * 
   * @return {boolean} True if the user is a student
   */
  const isStudent = () => {
    return getRoleId() === USER_ROLES.STUDENT
  }
  
  /**
   * Check if the user has permission to access admin features
   * 
   * @return {boolean} True if the user is either an admin or super admin
   */
  const hasAdminAccess = () => {
    const roleId = getRoleId()
    return roleId === USER_ROLES.SUPER_ADMIN || roleId === USER_ROLES.ADMIN
  }
  
  /**
   * Get the correct dashboard path for the user based on their role
   * 
   * @return {string} The dashboard path for the user's role
   */
  const getDashboardPath = () => {
    const role = getRole()
    
    if (role === 'superadmin') return '/dashboard/super-admin'
    if (role === 'admin') return '/dashboard/admin'
    return '/dashboard/student' // default to student
  }
  
  /**
   * Check if the current user can access a particular resource
   * 
   * @param {string|Array} requiredRoles - Role(s) required to access the resource
   * @return {boolean} Whether the user has permission to access
   */
  const canAccess = (requiredRoles) => {
    const role = getRole()
    
    // If requiredRoles is a string, convert to array
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    
    // Super admin can access everything
    if (role === 'superadmin') return true
    
    // Check if user's role is in the required roles
    return roles.includes(role)
  }

  return {
    getRoleId,
    getRole,
    isSuperAdmin,
    isAdmin,
    isStudent,
    hasAdminAccess,
    getDashboardPath,
    canAccess,
    USER_ROLES
  }
}

export default useUserRole 
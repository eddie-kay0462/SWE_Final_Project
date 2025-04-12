/**
 * Custom Notifications Hook
 * 
 * <p>Provides functionality for managing user notifications with real-time updates
 * from Supabase. Handles notification fetching, marking as read, and subscription
 * to new notifications.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/hooks/useAuth'

/**
 * Custom hook for managing user notifications
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch notifications automatically on mount
 * @param {boolean} options.realtime - Whether to subscribe to real-time updates
 * @return {Object} Notification data and utility functions
 */
export function useNotifications(options = {}) {
  const { autoFetch = true, realtime = true } = options
  
  const supabase = createClient()
  const { user } = useAuth()
  
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetches user notifications from Supabase
   * 
   * @param {Object} fetchOptions - Additional fetch options
   * @param {number} fetchOptions.limit - Maximum number of notifications to fetch
   * @param {boolean} fetchOptions.includeRead - Whether to include read notifications
   * @return {Promise<Object>} Fetch result
   */
  const fetchNotifications = useCallback(async (fetchOptions = {}) => {
    try {
      if (!user?.id) return { data: [], count: 0 }
      
      setLoading(true)
      setError(null)
      
      const { limit = 20, includeRead = true } = fetchOptions
      
      // Build query
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      // Filter by read status if required
      if (!includeRead) {
        query = query.eq('is_read', false)
      }
      
      // Execute query
      const { data, error: fetchError } = await query
      
      if (fetchError) {
        throw fetchError
      }
      
      setNotifications(data || [])
      
      // Count unread notifications
      const unread = data ? data.filter(n => !n.is_read).length : 0
      setUnreadCount(unread)
      
      return { data, count: unread }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  /**
   * Marks a notification as read
   * 
   * @param {string|number} notificationId - ID of the notification to mark as read
   * @return {Promise<Object>} Operation result
   */
  const markAsRead = async (notificationId) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
      
      if (updateError) {
        throw updateError
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true } 
            : n
        )
      )
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      return { success: true }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Marks all notifications as read
   * 
   * @return {Promise<Object>} Operation result
   */
  const markAllAsRead = async () => {
    try {
      if (!user?.id) return { success: false, error: 'User not authenticated' }
      
      setLoading(true)
      setError(null)
      
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      
      if (updateError) {
        throw updateError
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )
      
      // Update unread count
      setUnreadCount(0)
      
      return { success: true }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Deletes a notification
   * 
   * @param {string|number} notificationId - ID of the notification to delete
   * @return {Promise<Object>} Operation result
   */
  const deleteNotification = async (notificationId) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      if (deleteError) {
        throw deleteError
      }
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      // Update unread count if needed
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!realtime || !user?.id) return
    
    // Subscribe to notifications table for real-time updates
    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Handle different events
          if (payload.eventType === 'INSERT') {
            // Add new notification to state
            setNotifications(prev => [payload.new, ...prev])
            if (!payload.new.is_read) {
              setUnreadCount(prev => prev + 1)
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update existing notification
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            )
            // Recalculate unread count
            fetchNotifications({ limit: 100 })
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted notification
            const deletedNotification = notifications.find(n => n.id === payload.old.id)
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
            // Update unread count if needed
            if (deletedNotification && !deletedNotification.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe()
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user, realtime, notifications, fetchNotifications])

  // Fetch notifications initially
  useEffect(() => {
    if (autoFetch && user?.id) {
      fetchNotifications({ limit: 20 })
    }
  }, [fetchNotifications, autoFetch, user])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

export default useNotifications 
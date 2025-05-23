"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, FileText, BookOpen, X, Trash2, Info, MessageSquare, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function NotificationsPage() {
  const { toast } = useToast()
  const { authUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authUser) return

    const fetchNotifications = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', authUser.email)
          .single()

        if (userError) throw userError

        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            documents:document_id (
              name,
              file_url,
              feedback
            )
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setNotifications(data)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        toast.error('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${authUser?.id}`
        },
        (payload) => {
          // Show toast notification
          toast.success(payload.new.title, {
            description: payload.new.message,
          })
          // Update notifications list
          setNotifications(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authUser])

  const handleMarkAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(
        notifications.map((notification) => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const handleDeleteConfirm = async () => {
    if (notificationToDelete) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationToDelete)

        if (error) throw error

        setNotifications(notifications.filter((n) => n.id !== notificationToDelete))
        toast.success('Notification deleted')
        setNotificationToDelete(null)
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error('Error deleting notification:', error)
        toast.error('Failed to delete notification')
      }
    }
  }

  const handleClearAllConfirm = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', authUser.email)
        .single()

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userData.id)

      if (error) throw error

      setNotifications([])
      toast.success('All notifications cleared')
      setClearAllDialogOpen(false)
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('Failed to clear notifications')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', authUser.email)
        .single()

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userData.id)

      if (error) throw error

      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "feedback":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "event":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "session":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "request":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "info":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return MessageSquare
      case "event":
        return Calendar
      case "session":
        return User
      case "request":
        return FileText
      case "resource":
        return BookOpen
      case "info":
        return Info
      default:
        return Bell
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with important information and events</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                Mark All as Read
              </Button>
            )}
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setClearAllDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A91827] mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading notifications...</p>
          </CardContent>
        </Card>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(notification.type)
            const typeColor = getNotificationTypeColor(notification.type)

            return (
              <Card key={notification.id} className={notification.read ? "" : "border-l-4 border-l-[#A91827]"}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 rounded-full p-2 ${typeColor.split(" ")[0]}`}>
                      <NotificationIcon className={`h-5 w-5 ${typeColor.split(" ")[1]}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

                      {/* Special handling for feedback notifications */}
                      {notification.type === 'feedback' && notification.documents && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-[#161616] rounded-lg">
                          <p className="text-sm font-medium mb-1">Resume: {notification.documents.name}</p>
                          {notification.metadata?.fullFeedback && (
                            <p className="text-sm text-gray-600 dark:text-neutral-400">
                              {notification.metadata.fullFeedback}
                            </p>
                          )}
                          {notification.documents.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open(notification.documents.file_url, '_blank')}
                            >
                              View Resume
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setNotificationToDelete(notification.id)
                          setDeleteDialogOpen(true)
                        }}
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Notifications</h3>
            <p className="text-muted-foreground mt-1">You're all caught up! Check back later for updates.</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Single Notification Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Notifications Dialog */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all notifications? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllConfirm} className="bg-red-600 hover:bg-red-700">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

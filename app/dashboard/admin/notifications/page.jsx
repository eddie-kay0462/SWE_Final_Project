"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, FileText, BookOpen, X, Trash2, Info, MessageSquare, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function AdminNotificationsPage() {
  const { authUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const [createNotificationDialogOpen, setCreateNotificationDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState(null)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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

        // For admin, fetch all document-related notifications
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            documents:document_id (
              name,
              file_url,
              feedback,
              user_id
            ),
            users:documents(
              users (
                fname,
                lname,
                email
              )
            )
          `)
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

    // Subscribe to all document-related notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Show toast notification for new submissions
          if (payload.new.type === 'resume_submission') {
            toast('New Resume Submission', {
              description: payload.new.message
            })
          }
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
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('admin_notification', true)

      if (error) throw error

      setNotifications([])
      toast('All notifications cleared')
      setClearAllDialogOpen(false)
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('Failed to clear notifications')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('admin_notification', true)

      if (error) throw error

      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      toast('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast('Missing Information', {
        description: "Please provide both a title and message for the notification."
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const iconMap = {
        event: Calendar,
        session: Calendar,
        request: FileText,
        resource: BookOpen,
        student: User,
        info: Info,
      }

      const newNotificationObj = {
        id: Date.now(),
        type: newNotification.type,
        title: newNotification.title,
        message: newNotification.message,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        read: false,
        icon: iconMap[newNotification.type] || Info,
      }

      setNotifications([newNotificationObj, ...notifications])
      setIsSubmitting(false)
      setCreateNotificationDialogOpen(false)
      setNewNotification({ title: "", message: "", type: "info" })

      toast('Notification Created', {
        description: "The notification has been sent to all students."
      })
    }, 1000)
  }

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "resume_submission":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "feedback_request":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "status_update":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case "event":
        return "Event"
      case "session":
        return "Session"
      case "request":
        return "Request"
      case "resource":
        return "Resource"
      case "student":
        return "Student"
      case "info":
        return "Info"
      default:
        return "Notification"
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "resume_submission":
        return FileText
      case "feedback_request":
        return MessageSquare
      case "status_update":
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
          <h1 className="text-2xl font-semibold">Admin Notifications</h1>
          <p className="text-muted-foreground mt-1">Track student resume submissions and feedback requests</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setCreateNotificationDialogOpen(true)}>Create Notification</Button>

          {notifications.length > 0 && (
            <>
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
            </>
          )}
        </div>
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
            const typeLabel = getNotificationTypeLabel(notification.type)

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
                          {typeLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

                      {/* Show student information for document-related notifications */}
                      {notification.documents && notification.users?.users && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-[#161616] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium">
                              {notification.users.users.fname} {notification.users.users.lname}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-neutral-400">
                            {notification.users.users.email}
                          </p>
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

      {/* Create Notification Dialog */}
      <Dialog open={createNotificationDialogOpen} onOpenChange={setCreateNotificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <select
                id="notification-type"
                className="w-full p-2 border rounded-md"
                value={newNotification.type}
                onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
              >
                <option value="info">General Information</option>
                <option value="event">Event</option>
                <option value="session">Session</option>
                <option value="resource">Resource</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-title">Title</Label>
              <input
                id="notification-title"
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter notification title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-message">Message</Label>
              <textarea
                id="notification-message"
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder="Enter notification message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateNotificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

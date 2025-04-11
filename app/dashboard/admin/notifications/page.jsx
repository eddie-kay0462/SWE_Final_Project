"use client"

import { useState } from "react"
import { Bell, Calendar, FileText, BookOpen, X, Trash2, Info, Trash, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
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
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "event",
      title: "New Event Created",
      message: "Resume Building Workshop has been created and scheduled for April 10, 2025",
      date: "March 30, 2025",
      read: false,
      icon: Calendar,
    },
    {
      id: 2,
      type: "session",
      title: "Session Cancellation",
      message: "John Doe has cancelled their 1-on-1 session scheduled for April 5, 2025",
      date: "March 28, 2025",
      read: true,
      icon: Calendar,
    },
    {
      id: 3,
      type: "request",
      title: "New Internship Request",
      message: "Jane Smith has submitted an internship request",
      date: "March 25, 2025",
      read: true,
      icon: FileText,
    },
    {
      id: 4,
      type: "resource",
      title: "Resource Request",
      message: "Michael Johnson has requested a new resource: 'Finance Industry Guide'",
      date: "March 20, 2025",
      read: true,
      icon: BookOpen,
    },
    {
      id: 5,
      type: "student",
      title: "New Student Registration",
      message: "5 new students have registered on the platform",
      date: "March 15, 2025",
      read: true,
      icon: User,
    },
  ])

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

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const handleDeleteConfirm = () => {
    if (notificationToDelete) {
      setNotifications(notifications.filter((notification) => notification.id !== notificationToDelete))
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed.",
      })
      setNotificationToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleClearAllConfirm = () => {
    setNotifications([])
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been removed.",
    })
    setClearAllDialogOpen(false)
  }

  const handleDeleteClick = (id) => {
    setNotificationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    toast({
      title: "All Notifications Marked as Read",
      description: "All notifications have been marked as read.",
    })
  }

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and message for the notification.",
        variant: "destructive",
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

      toast({
        title: "Notification Created",
        description: "The notification has been sent to all students.",
      })
    }, 1000)
  }

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "event":
        return "bg-blue-100 text-blue-800"
      case "session":
        return "bg-green-100 text-green-800"
      case "request":
        return "bg-purple-100 text-purple-800"
      case "resource":
        return "bg-amber-100 text-amber-800"
      case "student":
        return "bg-pink-100 text-pink-800"
      case "info":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-medium">Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage system notifications</p>
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
                <Trash className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const NotificationIcon = notification.icon
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}
                        >
                          {typeLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">{notification.date}</span>
                      </div>

                      <h3 className="text-base font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
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
                        onClick={() => handleDeleteClick(notification.id)}
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
          <CardContent className="p-6 text-center pt-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Notifications</h3>
            <p className="text-muted-foreground mt-1">There are no notifications at this time.</p>
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

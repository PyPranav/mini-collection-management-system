"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Bell, X, CheckCheck, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { clearError, fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/store/slices/notificationsSlice"
import { useAppSelector } from "@/store/hooks"





const getNotificationIcon = (type:any) => {
  switch (type) {
    case "customerAdded":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "customerDeleted":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "paymentReceived":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

export default function NotificationsModal() {
  const dispatch = useDispatch()
  const { notifications, unreadCount, loading, error } = useAppSelector((state) => state.notifications)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        dispatch(fetchNotifications(new Date().toISOString() as any) as any)
      }, 1000)
    }
  }, [dispatch, open])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await dispatch(markNotificationAsRead(notificationId) as any)
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Notification marked as read")
      } else {
        toast.error("Failed to mark notification as read")
      }
    } catch (error) {
      toast.error("An error occurred while marking the notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const result = await dispatch(markAllNotificationsAsRead() as any)
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("All notifications marked as read")
      } else {
        toast.error("Failed to mark all notifications as read")
      }
    } catch (error) {
      toast.error("An error occurred while marking notifications as read")
    }
  }

  const NotificationSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-start space-x-3 p-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                {notifications.length > 0
                  ? `You have ${notifications.length} unread notification${notifications.length === 1 ? "" : "s"}`
                  : "No unread notifications"}
              </DialogDescription>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="flex items-center gap-2 mt-3"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All as Read
              </Button>
            )}
          </div>
        </DialogHeader>

        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-2" onClick={() => dispatch(clearError())}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="max-h-[500px] pr-4">
          {loading ? (
            <NotificationSkeleton />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No unread notifications</h3>
              <p className="text-sm text-muted-foreground">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors bg-muted/30">
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium leading-tight">{notification.title}</h4>

                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            title="Mark as read"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

import { client } from "@/lib/client"
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  created_at: string
  read: boolean
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [
    // Mock data for demonstration - only unread notifications are shown
    
  ],
  unreadCount: 0,
  loading: false,
  error: null,
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_timestamp, { rejectWithValue }) => {
    try {
      const response = await client.get("/notifications")
      console.log("response", response.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications")
    }
  },
)

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await client.patch(`/notifications/${notificationId}`)
      return notificationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark notification as read")
    }
  },
)

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await client.patch("/notifications")
      return true
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all notifications as read")
    }
  },
)

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        console.log("fetchNotifications.pending")
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log("action.payload", action.payload)
        state.loading = false
        // Only show unread notifications
        state.notifications = (action.payload || [])
        state.unreadCount = state.notifications.length
        state.error = null
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Mark single notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationIndex = state.notifications.findIndex((n) => n.id === action.payload)
        if (notificationIndex !== -1) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
          // Remove the notification from the list
          state.notifications.splice(notificationIndex, 1)
        }
      })
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = []
        state.unreadCount = 0
      })
  },
})

export const { clearError } = notificationsSlice.actions
export default notificationsSlice

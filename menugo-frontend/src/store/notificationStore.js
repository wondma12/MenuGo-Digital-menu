import { create } from 'zustand'
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} from '../services/notificationService'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (_userId, params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getNotifications(params)
      set({
        notifications: response?.data?.notifications || [],
        total: response?.data?.total || 0,
        isLoading: false,
      })
      return response
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      throw error
    }
  },

  fetchUnreadCount: async (_userId) => {
    try {
      const count = await getUnreadCount()
      set({ unreadCount: count })
      return count
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }
  },

  markAsRead: async (id) => {
    try {
      await markAsRead(id)
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsRead()
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  },

  deleteNotification: async (id) => {
    try {
      await deleteNotification(id)
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: state.notifications.find(n => n.id === id)?.isRead 
          ? state.unreadCount 
          : Math.max(0, state.unreadCount - 1)
      }))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },

  clearError: () => set({ error: null }),
}))

export { useNotificationStore }

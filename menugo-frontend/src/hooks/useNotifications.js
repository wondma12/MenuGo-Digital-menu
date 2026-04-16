import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getWaiterNotifications,
  markWaiterNotificationAsRead,
} from '../services/notificationService'
import toast from 'react-hot-toast'

export const useNotifications = (userId) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    ['notifications', userId],
    () => getNotifications(),
    { enabled: !!userId, refetchInterval: 30000 }
  )

  const { data: unreadCount } = useQuery(
    ['unread-count', userId],
    () => getUnreadCount(),
    { enabled: !!userId, refetchInterval: 10000 }
  )

  const markReadMutation = useMutation(markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', userId])
      queryClient.invalidateQueries(['unread-count', userId])
    },
  })

  const markAllMutation = useMutation(() => markAllAsRead(), {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', userId])
      queryClient.invalidateQueries(['unread-count', userId])
      toast.success('All notifications marked as read')
    },
  })

  const deleteMutation = useMutation(deleteNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', userId])
      queryClient.invalidateQueries(['unread-count', userId])
      toast.success('Notification deleted')
    },
  })

  return {
    notifications: data?.data?.notifications || [],
    unreadCount: unreadCount || 0,
    isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    refetch,
  }
}

export const useWaiterNotifications = (waiterId) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['waiter-notifications', waiterId],
    () => getWaiterNotifications(waiterId),
    { enabled: !!waiterId, refetchInterval: 10000 }
  )

  const markReadMutation = useMutation(markWaiterNotificationAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['waiter-notifications', waiterId])
    },
  })

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    markAsRead: markReadMutation.mutate,
  }
}

export default useNotifications

import api from './api'

export const getNotifications = async (params) => {
  const response = await api.get('/notifications', { params })
  return response.data
}

export const getUnreadCount = async () => {
  const response = await api.get('/notifications', {
    params: { page: 1, limit: 1, is_read: false },
  })
  return response.data?.data?.unread_count ?? 0
}

export const getUnreadNotificationCount = async () => getUnreadCount()

export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`)
  return response.data
}

export const markNotificationAsRead = async (id) => markAsRead(id)

export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all')
  return response.data
}

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`)
  return response.data
}

export const getWaiterNotifications = async (params = {}) => {
  // Backend exposes waiter notifications at GET /waiters/notifications
  // Authentication determines the current waiter; no waiterId param in URL is required.
  // If caller passed a waiterId (string) accidentally, coerce to empty params object.
  const queryParams = typeof params === 'object' && params !== null ? params : {}
  const response = await api.get('/waiters/notifications', { params: queryParams })
  return response.data
}

export const markWaiterNotificationAsRead = async (id) => {
  const response = await api.patch(`/waiters/notifications/${id}/read`)
  return response.data
}

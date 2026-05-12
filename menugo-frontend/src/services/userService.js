import api from './api'

export const getUsers = async (params) => {
  const response = await api.get('/users', { params })
  // Backend wraps payload in { success, message, data } (ApiResponse)
  // Return the inner data object when present for compatibility with UI
  return response.data?.data ?? response.data
}

export const getUserDetails = async (id) => {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export const createUser = async (data) => {
  const response = await api.post('/users', data)
  return response.data
}

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id, options = {}) => {
  // options: { force: boolean }
  let url = `/users/${id}`
  const params = []
  if (options.force) params.push('force=true')
  if (params.length) url = `${url}?${params.join('&')}`

  const response = await api.delete(url)
  return response.data
}

export const updateUserStatus = async (id, data) => {
  // Normalize payload and use PUT to update user fields (backend expects PUT /users/:id)
  const payload = { ...data }

  // Support camelCase `isActive` -> snake_case `is_active`
  if (typeof data?.isActive !== 'undefined') {
    payload.is_active = data.isActive
    delete payload.isActive
  }

  const response = await api.put(`/users/${id}`, payload)
  return response.data
}

export const getUserActivityLogs = async (id, params) => {
  const response = await api.get(`/users/${id}/activity`, { params })
  return response.data
}

export const getRoles = async () => {
  const response = await api.get('/users/roles')
  return response.data
}

export const updateRolePermissions = async (roleId, permissions) => {
  const response = await api.put(`/users/roles/${roleId}`, { permissions })
  return response.data
}

export const getRestaurantUsers = async (restaurantId) => {
  const response = await api.get(`/users/restaurant/${restaurantId}`)
  return response.data
}

export const inviteUser = async (data) => {
  const response = await api.post('/users/invite', data)
  return response.data
}

export const updateUserRole = async ({ userId, role }) => {
  const response = await api.patch(`/users/${userId}/role`, { role })
  return response.data
}

export const removeUser = async (id) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

import api from './api'

export const getUsers = async (params) => {
  const response = await api.get('/users', { params })
  // Backend wraps payload in { success, message, data } (ApiResponse)
  // Return the inner data object when present for compatibility with UI
  const payload = response.data?.data ?? response.data

  // If payload is a list of users (array), normalize common snake_case fields to camelCase
  if (Array.isArray(payload)) {
    return payload.map(normalizeUser)
  }

  // If payload is a paginated object containing a `users` array, normalize each user in place
  if (payload && typeof payload === 'object' && Array.isArray(payload.users)) {
    return { ...payload, users: payload.users.map(normalizeUser) }
  }

  return payload
}

const normalizeUser = (u) => {
  const user = { ...u }
  user.fullName = user.fullName || user.full_name || user.fullName
  user.avatar = user.avatar || user.avatar_url || user.avatar
  user.isActive = typeof user.isActive !== 'undefined' ? user.isActive : user.is_active
  user.emailVerified = typeof user.emailVerified !== 'undefined' ? user.emailVerified : user.email_verified
  user.twoFactorEnabled = typeof user.twoFactorEnabled !== 'undefined' ? user.twoFactorEnabled : user.two_factor_enabled
  user.createdAt = user.createdAt || user.created_at
  user.updatedAt = user.updatedAt || user.updated_at
  user.lastLogin = user.lastLogin || user.last_login
  user.loginAttempts = typeof user.loginAttempts !== 'undefined' ? user.loginAttempts : user.login_attempts
  return user
}

export const getUserDetails = async (id) => {
  const response = await api.get(`/users/${id}`)
  const payload = response.data?.data ?? response.data

  // Normalize common snake_case fields returned by backend to camelCase expected by UI
  if (payload && typeof payload === 'object') {
    const u = payload
    u.id = u.id || u.id
    u.email = u.email || u.email
    u.fullName = u.fullName || u.full_name || u.fullName
    u.avatar = u.avatar || u.avatar_url || u.avatar
    u.isActive = typeof u.isActive !== 'undefined' ? u.isActive : u.is_active
    u.emailVerified = typeof u.emailVerified !== 'undefined' ? u.emailVerified : u.email_verified
    u.twoFactorEnabled = typeof u.twoFactorEnabled !== 'undefined' ? u.twoFactorEnabled : u.two_factor_enabled
    u.createdAt = u.createdAt || u.created_at
    u.updatedAt = u.updatedAt || u.updated_at
    u.lastLogin = u.lastLogin || u.last_login
    u.loginAttempts = typeof u.loginAttempts !== 'undefined' ? u.loginAttempts : u.login_attempts
  }

  return payload
}

export const createUser = async (data) => {
  const response = await api.post('/users', data)
  return response.data
}

export const updateUser = async (idOrPayload, maybeData) => {
  // Support two call styles:
  // 1) updateUser(id, data)
  // 2) updateUser({ id, data }) — some components pass an object to mutate
  let id = idOrPayload
  let data = maybeData
  if (idOrPayload && typeof idOrPayload === 'object' && !Array.isArray(idOrPayload) && idOrPayload.id) {
    id = idOrPayload.id
    data = idOrPayload.data
  }

  const response = await api.put(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id, options = {}) => {
  // options: { force: boolean }
  if (!id) throw new Error('Invalid user id')
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
  return response.data?.data ?? response.data
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
  if (!id) throw new Error('Invalid user id')
  const response = await api.delete(`/users/${id}`)
  return response.data
}

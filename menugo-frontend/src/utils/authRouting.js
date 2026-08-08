const decodeJwtPayload = (token) => {
  if (typeof token !== 'string' || !token.trim()) return null

  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const decoded = typeof globalThis.atob === 'function' ? globalThis.atob(padded) : ''
    if (!decoded) return null

    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )

    return JSON.parse(json)
  } catch (error) {
    return null
  }
}

const getRoleFromToken = (token) => {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  const tokenRole = payload?.staff?.role || payload?.role || null
  return tokenRole || null
}

export const normalizeRole = (role) => {
  if (role === 'admin') return 'restaurant_admin'
  return role || null
}

export const getEffectiveRole = (userOrRole, token = null) => {
  const explicitToken = token || (typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null)
  const userRole = typeof userOrRole === 'string'
    ? userOrRole
    : userOrRole?.staff?.role || userOrRole?.role || null

  const tokenRole = getRoleFromToken(explicitToken)
  const resolvedRole = tokenRole && tokenRole !== 'customer' ? tokenRole : userRole

  return normalizeRole(resolvedRole || tokenRole || userRole)
}

export const getRoleHomePath = (roleOrUser) => {
  const role = normalizeRole(typeof roleOrUser === 'string' ? roleOrUser : getEffectiveRole(roleOrUser))

  switch (role) {
    case 'platform_admin':
      return '/platform/dashboard'
    case 'restaurant_admin':
    case 'admin':
      return '/admin/dashboard'
    case 'chef':
    case 'manager':
      return '/chef/kitchen'
    case 'waiter':
      return '/waiter/dashboard'
    case 'customer':
      return '/scan'
    default:
      return '/scan'
  }
}

export const getPostLoginRedirectPath = (roleOrUser, fallbackPath = null, token = null) => {
  const role = normalizeRole(typeof roleOrUser === 'string' ? roleOrUser : getEffectiveRole(roleOrUser, token))
  const staffRoles = ['platform_admin', 'restaurant_admin', 'chef', 'manager', 'waiter']

  if (staffRoles.includes(role)) {
    return getRoleHomePath(role)
  }

  return fallbackPath || getRoleHomePath(role)
}
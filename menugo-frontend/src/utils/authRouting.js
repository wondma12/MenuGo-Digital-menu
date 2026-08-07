export const normalizeRole = (role) => {
  if (role === 'admin') return 'restaurant_admin'
  return role || null
}

export const getEffectiveRole = (user) => normalizeRole(user?.staff?.role || user?.role || null)

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
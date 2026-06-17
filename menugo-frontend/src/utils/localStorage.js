export const setItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

export const getItem = (key, defaultValue = null) => {
  try {
    const serializedValue = localStorage.getItem(key)
    if (serializedValue === null) return defaultValue
    return JSON.parse(serializedValue)
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}

export const clearAll = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

export const hasItem = (key) => {
  return localStorage.getItem(key) !== null
}

export const getAuthToken = () => {
  return getItem('auth_token')
}

export const setAuthToken = (token) => {
  return setItem('auth_token', token)
}

export const removeAuthToken = () => {
  return removeItem('auth_token')
}

export const getUser = () => {
  return getItem('user')
}

export const setUser = (user) => {
  try {
    if (!user) return removeUser()
    const minimal = {
      id: user.id ?? user._id ?? null,
      email: user.email ?? null,
      role: user.role ?? null,
      restaurant_id: user.restaurant_id ?? (user.restaurant && (user.restaurant.id || user.restaurant._id)) ?? null,
    }
    return setItem('user', minimal)
  } catch (e) {
    console.error('Error setting user in localStorage:', e)
    return false
  }
}

export const removeUser = () => {
  return removeItem('user')
}

export const getCart = () => {
  return getItem('cart', [])
}

export const setCart = (cart) => {
  return setItem('cart', cart)
}

export const clearCart = () => {
  return removeItem('cart')
}

export const getTheme = () => {
  return getItem('theme', 'light')
}

export const setTheme = (theme) => {
  return setItem('theme', theme)
}

export const getLanguage = () => {
  return getItem('language', 'en')
}

export const setLanguage = (language) => {
  return setItem('language', language)
}

export const getNotificationSettings = () => {
  return getItem('notification_settings', {
    soundEnabled: true,
    pushEnabled: true,
    emailEnabled: true,
  })
}

export const setNotificationSettings = (settings) => {
  return setItem('notification_settings', settings)
}
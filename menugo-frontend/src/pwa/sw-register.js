const unregisterExistingServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) return

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  } catch (error) {
    console.warn('Failed to unregister old service workers:', error)
  }
}

export const registerSW = async () => {
  if (!('serviceWorker' in navigator)) return

  try {
    await unregisterExistingServiceWorkers()
    window.addEventListener('load', async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (error) {
        console.warn('Service worker registration failed:', error)
      }
    })
  } catch (error) {
    console.warn('Service worker setup failed:', error)
  }
}

const volumeCache = new Map()
const toneMap = {
  'new-order': 880,
  'order-confirmed': 660,
  'order-ready': 740,
  notification: 520,
}

const playTone = (soundName, volume = 1, duration = 0.18) => {
  if (typeof window === 'undefined') return Promise.resolve()

  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return Promise.resolve()

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  const now = context.currentTime
  const effectiveVolume = Math.max(0, Math.min(1, volumeCache.get(soundName) ?? volume))

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(toneMap[soundName] || 600, now)

  gainNode.gain.setValueAtTime(0.0001, now)
  gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, effectiveVolume * 0.15), now + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gainNode)
  gainNode.connect(context.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)

  return new Promise((resolve) => {
    oscillator.onended = async () => {
      await context.close().catch(() => {})
      resolve()
    }
  })
}

export const preloadAudio = (soundName) => {
  if (!volumeCache.has(soundName)) {
    volumeCache.set(soundName, 1)
  }
}

export const playSound = async (soundName, volume = 1) => {
  try {
    await playTone(soundName, volume)
  } catch (error) {
    console.log('Audio play failed:', error)
  }
}

export const stopSound = () => {
  // Tone playback is short-lived and does not keep a persistent audio handle.
}

export const setVolume = (soundName, volume) => {
  volumeCache.set(soundName, Math.max(0, Math.min(1, volume)))
}

export const preloadAllSounds = () => {
  const sounds = ['new-order', 'order-confirmed', 'order-ready', 'notification']
  sounds.forEach(sound => preloadAudio(sound))
}

export const playNewOrderSound = () => {
  playSound('new-order')
}

export const playOrderConfirmedSound = () => {
  playSound('order-confirmed')
}

export const playOrderReadySound = () => {
  playSound('order-ready')
}

export const playNotificationSound = () => {
  playSound('notification')
}

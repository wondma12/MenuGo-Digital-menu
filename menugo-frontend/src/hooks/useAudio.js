import { useCallback, useEffect } from 'react'
import { playSound as playTone, preloadAudio, setVolume as setStoredVolume } from '../utils/audioUtils'

export const useAudio = () => {
  useEffect(() => {
    const sounds = ['new-order', 'order-confirmed', 'order-ready', 'notification']
    sounds.forEach(sound => {
      preloadAudio(sound)
    })
  }, [])

  const playSound = useCallback(async (soundName, volume = 1) => {
    await playTone(soundName, volume)
  }, [])

  const preloadSound = useCallback((soundName) => {
    preloadAudio(soundName)
  }, [])

  const setVolume = useCallback((soundName, volume) => {
    setStoredVolume(soundName, volume)
  }, [])

  const stopSound = useCallback(() => {
    // Tone playback is short-lived and does not need manual stopping.
  }, [])

  return {
    playSound,
    preloadSound,
    setVolume,
    stopSound,
  }
}

export default useAudio

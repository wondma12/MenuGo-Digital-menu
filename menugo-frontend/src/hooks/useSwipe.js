import { useRef, useEffect } from 'react'

export const useSwipe = (onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50) => {
  const touchStart = useRef({ x: 0, y: 0 })
  const touchEnd = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStart.current.x = e.touches[0].clientX
      touchStart.current.y = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      touchEnd.current.x = e.changedTouches[0].clientX
      touchEnd.current.y = e.changedTouches[0].clientY

      const dx = touchEnd.current.x - touchStart.current.x
      const dy = touchEnd.current.y - touchStart.current.y

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (dx < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else if (Math.abs(dy) > threshold) {
        if (dy > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (dy < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  return null
}

export default useSwipe
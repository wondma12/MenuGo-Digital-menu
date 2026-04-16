import React, { useEffect } from 'react'
import { useWebSocket } from '../../../hooks/useWebSocket'
import { playSound } from '../../../utils/audioUtils'

const SoundNotification = ({ enabled = true }) => {
  const { lastMessage } = useWebSocket()

  useEffect(() => {
    if (!enabled) return

    if (lastMessage?.type === 'new_order') {
      playSound('new-order')
    } else if (lastMessage?.type === 'order_ready') {
      playSound('order-ready')
    } else if (lastMessage?.type === 'notification') {
      playSound('notification')
    }
  }, [lastMessage, enabled])

  return null
}

export default SoundNotification

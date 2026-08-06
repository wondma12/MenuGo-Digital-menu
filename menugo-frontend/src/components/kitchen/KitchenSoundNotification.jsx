// src/components/kitchen/KitchenSoundNotification.jsx
import {useEffect, useRef} from 'react'
import { useAudio } from '../../hooks/useAudio';

const KitchenSoundNotification = ({ onNewOrder, enabled = true }) => {
  const { playSound } = useAudio();
  const lastOrderRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleNewOrder = (event) => {
      const orderId = event.detail?.orderId;
      if (orderId !== lastOrderRef.current) {
        lastOrderRef.current = orderId;
        playSound('new-order.mp3');
        
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Kitchen Order!', {
            body: `New order received - Check kitchen display`,
            icon: '/icon-192.png',
            tag: 'kitchen-order'
          });
        }
        
        onNewOrder?.();
      }
    };

    window.addEventListener('kitchen-new-order', handleNewOrder);
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      window.removeEventListener('kitchen-new-order', handleNewOrder);
    };
  }, [enabled, playSound, onNewOrder]);

  return null;
};

export default KitchenSoundNotification;
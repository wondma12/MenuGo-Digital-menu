// src/pages/KitchenPage.jsx
import {useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom';
import KitchenDashboard from '../components/kitchen/KitchenDashboard';
import { useKitchen } from '../hooks/useKitchen';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudio } from '../hooks/useAudio';
import Loading from '../components/common/Loading';
import { useAuthStore } from '../store/authStore';

const KitchenPage = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [restaurantId, setRestaurantId] = useState(null);
  const { orders, stats, loading, error, updateOrderStatus, refresh } = useKitchen(restaurantId);
  const { onEvent, socket } = useWebSocket();
  const { playSound } = useAudio();

  useEffect(() => {
    const id = user?.restaurantId || user?.restaurant_id || (user?.restaurant && user.restaurant.id) || (user?.staff && user.staff.restaurant_id) || null;
    setRestaurantId(id);
  }, [user]);

  useEffect(() => {
    if (!socket || !restaurantId) return;

    const handleNew = (data) => {
      playSound('new-order');
      refresh();
    };
    const handleUpdate = () => refresh();

    const unsubNew1 = onEvent('order_received', handleNew);
    const unsubNew2 = onEvent('new_order', handleNew);
    const unsubUpdate1 = onEvent('order_updated', handleUpdate);
    const unsubUpdate2 = onEvent('order_status_changed', handleUpdate);
    const unsubKitchen = onEvent('kitchen_updated', handleUpdate);
    const unsubKitchen2 = onEvent('kitchen_order_updated', handleUpdate);

    return () => {
      unsubNew1(); unsubNew2(); unsubUpdate1(); unsubUpdate2(); unsubKitchen(); unsubKitchen2();
    };
  }, [socket, restaurantId, playSound, refresh, onEvent]);

  // Ensure we join the kitchen room explicitly so we receive kitchen-specific events
  useEffect(() => {
    if (!socket || !restaurantId) return;

    try {
      // Prefer namespace-safe event
      if (socket.emit) socket.emit('join-kitchen', restaurantId);
    } catch (e) {
      console.warn('Failed to join kitchen room', e);
    }

    return () => {
      try {
        if (socket.emit) socket.emit('leave-kitchen', restaurantId);
      } catch (e) { if (import.meta.env.DEV) console.warn('leave-kitchen emit failed:', e && e.message) }
    };
  }, [socket, restaurantId]);

  if (loading) return <Loading />;
  if (!restaurantId) {
    return <div className="p-4 text-red-500">Restaurant ID not found for this account. Please sign in again or contact support.</div>;
  }
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  // Determine initial tab from the URL path or query param (e.g. ?tab=completed)
  const params = new URLSearchParams(location.search);
  const urlTab = params.get('tab');
  const path = location.pathname || '';
  let initialTab = 'pending';
  if (urlTab) initialTab = urlTab;
  else if (path.endsWith('/completed') || path.includes('/completed')) initialTab = 'completed';
  else if (path.endsWith('/preparing') || path.includes('/preparing')) initialTab = 'preparing';
  else if (path.endsWith('/ready') || path.includes('/ready')) initialTab = 'ready';

  return (
    <KitchenDashboard
      orders={orders}
      stats={stats}
      restaurantId={restaurantId}
      onUpdateStatus={updateOrderStatus}
      initialTab={initialTab}
    />
  );
};

export default KitchenPage;
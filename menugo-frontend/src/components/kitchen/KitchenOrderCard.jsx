// src/components/kitchen/KitchenOrderCard.jsx
import React, { useState, useEffect } from 'react';
import KitchenTimer from './KitchenTimer';
import { Clock } from 'lucide-react'
import KitchenStatusBadge from './KitchenStatusBadge';
import KitchenOrderDetails from './KitchenOrderDetails';

const KitchenOrderCard = ({ order, displayNumber, type, onUpdateStatus }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (order.status === 'preparing' && order.startedAt) {
      const interval = setInterval(() => {
        const start = new Date(order.startedAt).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [order.status, order.startedAt]);

  const getPriorityClass = () => {
    const waitTime = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
    if (waitTime > 20) return 'border-red-500 bg-red-50';
    if (waitTime > 10) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const totalPrepMinutes = order.items.reduce((sum, it) => {
    const t = Number(it.preparationTime || 0);
    return sum + (t * (it.quantity || 1));
  }, 0);

  return (
    <>
      <div className={`relative rounded-lg border-2 p-4 mb-4 shadow-sm hover:shadow-lg transition ${getPriorityClass()}`}>
        <div className="absolute -left-1 top-4 w-1 h-12 rounded-r" style={{ background: order.status === 'preparing' ? '#3B82F6' : order.status === 'ready' ? '#10B981' : '#F97316' }} />

        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600">Order</span>
                  <h3 className="text-xl font-bold tracking-tight text-black">#{displayNumber ?? order.orderNumber}</h3>
                </div>
                <KitchenStatusBadge status={order.status} />
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{new Date(order.createdAt).toLocaleTimeString()}</div>
                {type === 'preparing' && <KitchenTimer elapsedTime={elapsedTime} />}
                {type === 'pending' && (
                  <div className="text-xs text-orange-600 mt-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Waiting: {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}m</div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-2">Table {order.tableNumber} • {order.customerName || 'Guest'}</div>
          </div>

          <div className="flex flex-col items-end ml-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 font-medium">
              <Clock className="w-4 h-4 mr-1" /> {totalPrepMinutes}m
            </div>
            <div className="mt-3 text-xs text-gray-500">Items: {order.items.length}</div>
          </div>
        </div>

        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">No Img</div>
                )}

                <div>
                  <div className="font-medium text-gray-800">{item.quantity}x {item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.modifiers?.length > 0 ? `+ ${item.modifiers.map(m => m.name).join(', ')}` : ''}
                  </div>
                </div>
              </div>

              {type === 'preparing' && item.preparationTime && (
                <div className="text-xs text-gray-500">~{item.preparationTime}m</div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowDetails(true)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              View Details
            </button>
          </div>

          <div className="flex-1 flex justify-end w-full sm:w-auto gap-3">
            {type === 'pending' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-md hover:from-orange-600 hover:to-orange-500 text-sm font-semibold"
              >
                Start & Send to Kitchen
              </button>
            )}

            {type === 'preparing' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'ready')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-semibold"
              >
                Mark Ready
              </button>
            )}
            {type === 'ready' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <KitchenOrderDetails
          order={order}
          displayNumber={displayNumber}
          onClose={() => setShowDetails(false)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  );
};

export default KitchenOrderCard;
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
      <div className={`relative mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl ${getPriorityClass()}`}>
        <div className="absolute left-0 top-4 h-12 w-1 rounded-r bg-gradient-to-b from-orange-500 to-blue-500" />

        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order</span>
                  <h3 className="text-xl font-extrabold tracking-tight text-gray-900">#{displayNumber ?? order.orderNumber}</h3>
                </div>
                <KitchenStatusBadge status={order.status} />
              </div>
              <div className="text-sm text-gray-500 text-left sm:text-right">
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
            <div className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
              <Clock className="w-4 h-4 mr-1" /> {totalPrepMinutes}m
            </div>
            <div className="mt-3 text-xs font-medium text-gray-500">Items: {order.items.length}</div>
          </div>
        </div>

          <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-100" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">No Img</div>
                )}

                <div>
                  <div className="font-semibold text-gray-800">{item.quantity}x {item.name}</div>
                  <div className="mt-1 text-xs text-gray-500">
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
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              View Details
            </button>
          </div>

          <div className="flex-1 flex justify-end w-full sm:w-auto gap-3">
            {type === 'pending' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Start & Send to Kitchen
              </button>
            )}

            {type === 'preparing' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'ready')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
              >
                Mark Ready
              </button>
            )}
            {type === 'ready' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
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
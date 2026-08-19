// src/components/kitchen/KitchenOrderCard.jsx
import {useState, useEffect} from 'react'
import KitchenTimer from './KitchenTimer';
import { Clock } from 'lucide-react'
import KitchenStatusBadge from './KitchenStatusBadge';
import KitchenOrderDetails from './KitchenOrderDetails';

const KitchenOrderCard = ({ order, displayNumber, type, onUpdateStatus }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const tableSection = order.tableSection ?? order.table_section ?? order.table?.section ?? order.raw?.order_table?.section ?? 'General';

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
    if (waitTime > 20) return 'border-l-red-500';
    if (waitTime > 10) return 'border-l-amber-500';
    if (order.status === 'preparing') return 'border-l-blue-500';
    if (order.status === 'ready') return 'border-l-emerald-500';
    return 'border-l-orange-500';
  };

  const totalPrepMinutes = order.items.reduce((sum, it) => {
    const t = Number(it.preparationTime || 0);
    return sum + (t * (it.quantity || 1));
  }, 0);

  return (
    <>
      <div className={`relative mb-4 overflow-hidden rounded-2xl border border-orange-100 border-l-4 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,0.10)] ${getPriorityClass()}`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.08),transparent_40%)]" />

        <div className="relative flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 pr-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order</span>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">#{displayNumber ?? order.orderNumber}</h3>
                </div>
                <KitchenStatusBadge status={order.status} />
              </div>
              <div className="text-sm text-slate-500 text-left sm:text-right">
                <div>{new Date(order.createdAt).toLocaleTimeString()}</div>
                {type === 'preparing' && <KitchenTimer elapsedTime={elapsedTime} />}
                {type === 'pending' && (
                  <div className="text-xs text-orange-600 mt-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Waiting: {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}m</div>
                )}
              </div>
            </div>

            <div className="mt-2 text-sm text-slate-600">
              Table {order.tableNumber} • {tableSection} • {order.customerName || 'Guest'}
            </div>
          </div>

          <div className="flex flex-col items-end ml-3">
            <div className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-100">
              <Clock className="w-4 h-4 mr-1" /> {totalPrepMinutes}m
            </div>
            <div className="mt-3 text-xs font-medium text-slate-500">Items: {order.items.length}</div>
          </div>
        </div>

          <div className="mb-4 max-h-40 space-y-3 overflow-y-auto pr-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-100" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">No Img</div>
                )}

                <div>
                  <div className="font-semibold text-slate-800">{item.quantity}x {item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.modifiers?.length > 0 ? `+ ${item.modifiers.map(m => m.name).join(', ')}` : ''}
                  </div>
                </div>
              </div>

              {type === 'preparing' && item.preparationTime && (
                <div className="text-xs text-slate-500">~{item.preparationTime}m</div>
              )}
            </div>
          ))}
        </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowDetails(true)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
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
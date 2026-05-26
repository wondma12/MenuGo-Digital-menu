// src/components/kitchen/KitchenOrderDetails.jsx
import React from 'react';
import Modal from '../common/Modal';
import KitchenStatusBadge from './KitchenStatusBadge';

const KitchenOrderDetails = ({ order, displayNumber, onClose, onUpdateStatus }) => {
  const totalPrepTime = order.items.reduce((total, item) => {
    return total + (item.preparationTime || 5) * item.quantity;
  }, 0);

  const titleNumber = displayNumber ?? order.orderNumber;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Order #${titleNumber}`} size="sm">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-3.5 sm:space-y-4">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-sm sm:grid-cols-2">
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Table</div>
            <div className="mt-1 text-base font-bold text-slate-900">{order.tableNumber}</div>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</div>
            <div className="mt-1">
              <KitchenStatusBadge status={order.status} />
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Order Time</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Est. Prep Time</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{totalPrepTime} minutes</div>
          </div>
          {order.waiterName && (
            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:col-span-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Waiter</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{order.waiterName}</div>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Order Items</h3>
          <div className="max-h-80 space-y-2.5 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 font-medium text-slate-900">
                    {item.quantity}x {item.name}
                  </div>
                  <div className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                    Est: {item.preparationTime || 5} min
                  </div>
                </div>
                {item.specialInstructions && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs leading-5 text-amber-700">
                    <span className="font-semibold">Special:</span> {item.specialInstructions}
                  </div>
                )}
                {item.modifiers?.length > 0 && (
                  <div className="mt-2 text-xs leading-5 text-slate-600">
                    <span className="font-semibold text-slate-700">Modifiers:</span> {item.modifiers.map(m => m.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
            Close
          </button>
          {order.status === 'pending' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'preparing');
                onClose();
              }}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Start Preparation
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'ready');
                onClose();
              }}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Mark as Ready
            </button>
          )}
          {order.status === 'ready' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'completed');
                onClose();
              }}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default KitchenOrderDetails;
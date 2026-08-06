// src/components/kitchen/KitchenOrderList.jsx

import KitchenOrderCard from './KitchenOrderCard';

const KitchenOrderList = ({ title, orders, type, onUpdateStatus }) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-orange-100 bg-gradient-to-br from-white to-orange-50/40 py-12 text-center shadow-sm">
        <svg className="mx-auto h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">No {title.toLowerCase()}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {type === 'pending' && "New orders will appear here"}
          {type === 'preparing' && "Orders being prepared appear here"}
          {type === 'ready' && "Ready orders appear here"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          {title} <span className="ml-2 text-sm text-gray-500">({orders.length})</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order, idx) => (
          <KitchenOrderCard
            key={order.id}
            order={order}
            displayNumber={idx + 1}
            type={type}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default KitchenOrderList;
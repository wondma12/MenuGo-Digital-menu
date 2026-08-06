// src/components/kitchen/KitchenStatusBadge.jsx


const KitchenStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100' },
    preparing: { label: 'Preparing', color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
    ready: { label: 'Ready', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' },
    completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
    cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 ring-1 ring-red-100' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

export default KitchenStatusBadge;
// src/components/kitchen/KitchenStatusBadge.jsx
import React from 'react';

const KitchenStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
    ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default KitchenStatusBadge;
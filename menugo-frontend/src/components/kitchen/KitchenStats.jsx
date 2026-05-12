// src/components/kitchen/KitchenStats.jsx
import React from 'react';
import { Clock, Activity, Check, BarChart2 } from 'lucide-react'

const KitchenStats = ({ stats }) => {
  const statItems = [
    { label: 'Pending', value: stats.pending || 0, color: 'bg-yellow-500', icon: <Clock className="w-6 h-6 mx-auto" /> },
    { label: 'Preparing', value: stats.preparing || 0, color: 'bg-blue-500', icon: <Activity className="w-6 h-6 mx-auto" /> },
    { label: 'Ready', value: stats.ready || 0, color: 'bg-green-500', icon: <Check className="w-6 h-6 mx-auto" /> },
    { label: 'Completed Today', value: stats.completedToday || 0, color: 'bg-gray-500', icon: <BarChart2 className="w-6 h-6 mx-auto" /> },
    { label: 'Avg Prep Time', value: stats.avgPrepTime || '0', unit: 'min', color: 'bg-purple-500', icon: <Clock className="w-6 h-6 mx-auto" /> },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statItems.map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className={`text-2xl font-bold ${item.color.replace('bg', 'text')}`}>
                {item.value}{item.unit && <span className="text-sm">{item.unit}</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenStats;
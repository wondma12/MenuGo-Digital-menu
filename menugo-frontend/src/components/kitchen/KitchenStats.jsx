// src/components/kitchen/KitchenStats.jsx
import React from 'react';
import { Clock, Activity, Check, BarChart2 } from 'lucide-react'

const KitchenStats = ({ stats }) => {
  const statItems = [
    { label: 'Pending', value: stats.pending || 0, accent: 'from-orange-500 to-orange-400', icon: <Clock className="w-5 h-5" /> },
    { label: 'Preparing', value: stats.preparing || 0, accent: 'from-blue-500 to-blue-400', icon: <Activity className="w-5 h-5" /> },
    { label: 'Ready', value: stats.ready || 0, accent: 'from-emerald-500 to-emerald-400', icon: <Check className="w-5 h-5" /> },
    { label: 'Completed Today', value: stats.completedToday || 0, accent: 'from-slate-700 to-slate-500', icon: <BarChart2 className="w-5 h-5" /> },
    { label: 'Avg Prep Time', value: stats.avgPrepTime || '0', unit: 'min', accent: 'from-amber-500 to-yellow-400', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white/90 border-b border-orange-100 shadow-sm backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statItems.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${item.accent} text-white shadow-md`}>
                {item.icon}
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-gray-900">
                {item.value}{item.unit && <span className="text-sm">{item.unit}</span>}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenStats;
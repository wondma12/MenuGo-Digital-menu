// src/components/kitchen/KitchenStats.jsx
import React from 'react';

const KitchenStats = ({ stats }) => {
  const statItems = [
    { label: 'Pending', value: stats.pending || 0, accent: 'from-orange-500 to-orange-400', border: 'border-l-orange-500' },
    { label: 'Preparing', value: stats.preparing || 0, accent: 'from-blue-500 to-cyan-400', border: 'border-l-blue-500' },
    { label: 'Ready', value: stats.ready || 0, accent: 'from-emerald-500 to-teal-400', border: 'border-l-emerald-500' },
    { label: 'Completed Today', value: stats.completedToday || 0, accent: 'from-slate-700 to-slate-500', border: 'border-l-slate-700' },
    { label: 'Avg Prep Time', value: stats.avgPrepTime || '0', unit: 'min', accent: 'from-amber-500 to-orange-400', border: 'border-l-amber-500' },
  ];

  return (
    <div className="bg-white/90 border-b border-orange-100 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl border border-orange-100 border-l-4 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${item.border}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.08),transparent_40%)]" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {item.value}{item.unit && <span className="ml-1 text-sm font-semibold text-slate-500">{item.unit}</span>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenStats;
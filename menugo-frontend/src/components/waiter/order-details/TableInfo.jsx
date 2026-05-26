import React from 'react'
import { MapPin, Users } from 'lucide-react'

const TableInfo = ({ table }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm sm:p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Table</h4>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Info</span>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
          <div className="rounded-full bg-amber-50 p-1.5 text-amber-600">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Table Number</p>
            <p className="text-sm font-semibold text-slate-900">{table?.number || 'N/A'}</p>
          </div>
        </div>
        {table?.section && (
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
            <div className="rounded-full bg-slate-100 p-1.5 text-slate-500">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Section</p>
              <p className="text-sm font-semibold text-slate-900">{table.section}</p>
            </div>
          </div>
        )}
        {table?.capacity && (
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
            <div className="rounded-full bg-slate-100 p-1.5 text-slate-500">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Capacity</p>
              <p className="text-sm font-semibold text-slate-900">{table.capacity} persons</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TableInfo
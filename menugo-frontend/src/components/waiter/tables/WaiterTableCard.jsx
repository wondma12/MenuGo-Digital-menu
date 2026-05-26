import React from 'react'
import { Users } from 'lucide-react'

const WaiterTableCard = ({ table }) => {
  const tableNumber = table?.tableNumber ?? table?.table_number ?? table?.number ?? table?.tableNo ?? table?.table_no ?? '-'
  const status = table?.status || 'available'

  const statusConfig = {
    available: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    occupied: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    reserved: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    cleaning: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    maintenance: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  }

  return (
    <div className="group rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">Table {tableNumber}</h3>
          {table.tableName && <p className="text-xs font-medium text-slate-500">{table.tableName}</p>}
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${statusConfig[status] || statusConfig.available}`}>
          {status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Capacity:</span>
          <span className="flex items-center gap-1 font-semibold text-slate-900">
            <Users className="w-3 h-3" />
            {table.capacity} persons
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(251,146,60,0.08),rgba(59,130,246,0.06))] px-3 py-2 text-xs font-medium text-slate-600">
        Tap for table actions and assignment details.
      </div>
    </div>
  )
}

export default WaiterTableCard
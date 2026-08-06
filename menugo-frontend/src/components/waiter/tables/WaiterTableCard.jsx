
import { MapPin, Users } from 'lucide-react'
import TableStatusBadge from './TableStatusBadge'

const WaiterTableCard = ({ table }) => {
  const tableNumber = table?.tableNumber ?? table?.table_number ?? table?.number ?? table?.tableNo ?? table?.table_no ?? '-'
  const status = table?.status || 'available'
  const section = table?.section || 'General'
  const capacity = table?.capacity || table?.seats || table?.maxCapacity || '-'

  return (
    <div className="group rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">Table {tableNumber}</h3>
          {table?.tableName && <p className="text-xs font-medium text-slate-500">{table.tableName}</p>}
        </div>
        <TableStatusBadge status={status} size="sm" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Section</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <MapPin className="h-3.5 w-3.5 text-orange-500" />
            {section}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Capacity</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Users className="h-3.5 w-3.5 text-blue-500" />
            {capacity} seats
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(251,146,60,0.08),rgba(59,130,246,0.06))] px-3 py-2 text-xs font-medium text-slate-600">
        Tap to review service readiness and assignment details.
      </div>
    </div>
  )
}

export default WaiterTableCard
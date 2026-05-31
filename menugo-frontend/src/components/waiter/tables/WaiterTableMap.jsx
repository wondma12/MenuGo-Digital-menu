import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { LayoutGrid, SearchX, MapPin, Users2 } from 'lucide-react'
import TableStatusBadge from './TableStatusBadge'
import Loading from '../../common/Loading'
import { getWaiterTables } from '../../../services/waiterService'

const WaiterTableMap = () => {
  const { data: tables, isLoading } = useQuery('waiterTables', getWaiterTables, {
    refetchInterval: 10000
  })

  if (isLoading) return <Loading />

  const allTables = Array.isArray(tables) ? tables : []
  const uniqueTablesMap = new Map()
  allTables.forEach((table) => {
    if (table && table.id) uniqueTablesMap.set(table.id, table)
  })
  const uniqueTables = Array.from(uniqueTablesMap.values())

  const sections = [...new Set(uniqueTables.map((table) => table.section || 'General'))]

  const sectionStats = sections.map((section) => ({
    name: section,
    count: uniqueTables.filter((table) => (table.section || 'General') === section).length,
  }))

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 overflow-visible">
        <div className="relative z-20 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-600">Waiter workspace</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Tables</h1>
            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">Track table status, section load, and service readiness from a clean operations view.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <LayoutGrid className="h-4 w-4 text-orange-500" />
            {uniqueTables.length} tables live
          </div>
        </div>

        <div className="space-y-8">
          {sectionStats.map(({ name, count }, sectionIndex) => {
            const sectionTables = uniqueTables.filter((table) => (table.section || 'General') === name)

            return (
              <div key={name} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 capitalize">{name}</h2>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">{count}</span>
                </div>

                <div className="space-y-2">
                  {sectionTables.map((table, index) => {
                    const tableNumber = table?.tableNumber ?? table?.table_number ?? table?.number ?? table?.tableNo ?? table?.table_no ?? '-'
                    const status = table?.status || 'available'
                    const sectionName = table?.section || 'General'
                    const capacity = table?.capacity || table?.seats || table?.maxCapacity || '-'

                    return (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIndex * 0.02 + index * 0.02 }}
                      >
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">Table {tableNumber}</h3>
                              {table?.tableName && <p className="text-xs text-slate-500">{table.tableName}</p>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="h-4 w-4 text-orange-500" />
                              <span className="capitalize">{sectionName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Users2 className="h-4 w-4 text-blue-500" />
                              <span>{capacity} seats</span>
                            </div>
                          </div>
                          <div>
                            <TableStatusBadge status={status} size="sm" />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {uniqueTables.length === 0 && (
          <div className="rounded-3xl border border-dashed border-orange-100 bg-gradient-to-br from-white to-orange-50/40 p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <SearchX className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-slate-900">No tables found</p>
            <p className="mt-1 text-sm text-slate-500">Tables will appear here once the restaurant data is available.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WaiterTableMap
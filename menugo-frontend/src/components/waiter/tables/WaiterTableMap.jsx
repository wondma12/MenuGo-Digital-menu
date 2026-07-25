import React, { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { LayoutGrid, MapPin, Search, SearchX, Users2 } from 'lucide-react'
import TableStatusBadge from './TableStatusBadge'
import Loading from '../../common/Loading'
import { getWaiterTables } from '../../../services/waiterService'

const WaiterTableMap = () => {
  const [sectionFilter, setSectionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { data: tables, isLoading } = useQuery('waiterTables', getWaiterTables, {
    refetchInterval: 10000
  })

  const allTables = Array.isArray(tables) ? tables : []
  const uniqueTablesMap = new Map()
  allTables.forEach((table) => {
    if (table && table.id) uniqueTablesMap.set(table.id, table)
  })
  const uniqueTables = Array.from(uniqueTablesMap.values())

  const sections = [...new Set(uniqueTables.map((table) => table?.section || 'General'))].sort()

  const visibleTables = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return uniqueTables.filter((table) => {
      const tableNumber = table?.tableNumber ?? table?.table_number ?? table?.number ?? table?.tableNo ?? table?.table_no ?? ''
      const matchesSection = sectionFilter === 'all' || (table?.section || 'General') === sectionFilter
      const matchesSearch = !query || [tableNumber, table?.tableName, table?.section].some((value) => String(value || '').toLowerCase().includes(query))
      return matchesSection && matchesSearch
    })
  }, [searchTerm, sectionFilter, uniqueTables])

  if (isLoading) return <Loading />

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 overflow-visible">
        <div className="relative z-20 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600">Service floor</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Your tables</h1>
            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">A live view of every table, so you always know where attention is needed.</p>
          </div>
          <div className="relative z-50 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
            <LayoutGrid className="h-4 w-4 text-orange-500" />
            {uniqueTables.length} tables live
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search table, section, or name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold capitalize text-slate-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All sections</option>
              {sections.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-black text-slate-950">Table list</h2>
              <p className="mt-1 text-xs text-slate-500">{visibleTables.length} of {uniqueTables.length} tables shown</p>
            </div>
            <MapPin className="h-5 w-5 text-orange-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Table</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Service detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleTables.map((table, index) => {
                  const tableNumber = table?.tableNumber ?? table?.table_number ?? table?.number ?? table?.tableNo ?? table?.table_no ?? '-'
                  const status = table?.status || 'available'
                  const sectionName = table?.section || 'General'
                  const capacity = table?.capacity || table?.seats || table?.maxCapacity || '-'
                  const guestName = table?.currentCustomerName || table?.current_customer_name
                  const occupiedSince = table?.occupiedSince || table?.occupied_since

                  return (
                    <motion.tr
                      key={table.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      className="group transition-colors hover:bg-orange-50/40"
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red text-sm font-black text-white">{tableNumber}</span>
                          <div>
                            <p className="font-bold text-slate-950">Table {tableNumber}</p>
                            {table?.tableName && <p className="mt-0.5 text-xs text-slate-500">{table.tableName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold capitalize text-slate-700">{sectionName}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Users2 className="h-4 w-4 text-blue-500" />
                          {capacity} seats
                        </span>
                      </td>
                      <td className="px-4 py-4"><TableStatusBadge status={status} size="sm" /></td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {guestName ? <span className="font-semibold text-slate-800">{guestName}</span> : null}
                        {occupiedSince ? <span className="block text-xs text-slate-500">Since {new Date(occupiedSince).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> : null}
                        {!guestName && !occupiedSince && <span className="text-slate-400">Ready for service</span>}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {uniqueTables.length > 0 && visibleTables.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <SearchX className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-base font-semibold text-slate-900">No matching tables</p>
            <p className="mt-1 text-sm text-slate-500">Try another search or clear the status filter.</p>
          </div>
        )}

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
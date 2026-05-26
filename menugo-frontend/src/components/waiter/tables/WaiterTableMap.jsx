import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import WaiterTableCard from './WaiterTableCard'
import Loading from '../../common/Loading'
import { getWaiterTables } from '../../../services/waiterService'

const WaiterTableMap = () => {
  const { data: tables, isLoading } = useQuery('waiterTables', getWaiterTables, {
    refetchInterval: 10000
  })

  if (isLoading) return <Loading />

  // Ensure tables is defined and deduplicate by id to avoid duplicate React keys
  const allTables = Array.isArray(tables) ? tables : []
  const uniqueTablesMap = new Map()
  allTables.forEach((t) => { if (t && t.id) uniqueTablesMap.set(t.id, t) })
  const uniqueTables = Array.from(uniqueTablesMap.values())

  const sections = [...new Set(uniqueTables.map(t => t.section || 'General'))]

  return (
    <div className="space-y-6 rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/30 p-4 shadow-sm sm:p-5">
      {sections.map((section) => (
        <div key={section}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black tracking-tight text-slate-900 capitalize">{section}</h3>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
              {uniqueTables.filter(t => (t.section || 'General') === section).length} tables
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {uniqueTables
              .filter(t => (t.section || 'General') === section)
              .map((table, index) => (
                <motion.div
                  key={`${table.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WaiterTableCard table={table} />
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default WaiterTableMap
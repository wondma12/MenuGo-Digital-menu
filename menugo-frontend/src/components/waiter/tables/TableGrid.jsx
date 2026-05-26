import React from 'react'
import { motion } from 'framer-motion'
import WaiterTableCard from './WaiterTableCard'
import TableStatusBadge from './TableStatusBadge'

const TableGrid = ({ tables, onTableClick }) => {
  // Group tables by section
  const sections = [...new Set(tables?.map(t => t.section || 'General'))]

  // Group by status for summary
  const statusCounts = {
    available: tables?.filter(t => t.status === 'available').length || 0,
    occupied: tables?.filter(t => t.status === 'occupied').length || 0,
    reserved: tables?.filter(t => t.status === 'reserved').length || 0,
    cleaning: tables?.filter(t => t.status === 'cleaning').length || 0
  }

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
          <div className="text-2xl font-black text-emerald-600">{statusCounts.available}</div>
          <div className="text-xs font-semibold text-emerald-700">Available</div>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-3 text-center shadow-sm">
          <div className="text-2xl font-black text-rose-600">{statusCounts.occupied}</div>
          <div className="text-xs font-semibold text-rose-700">Occupied</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-3 text-center shadow-sm">
          <div className="text-2xl font-black text-amber-600">{statusCounts.reserved}</div>
          <div className="text-xs font-semibold text-amber-700">Reserved</div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-3 text-center shadow-sm">
          <div className="text-2xl font-black text-blue-600">{statusCounts.cleaning}</div>
          <div className="text-xs font-semibold text-blue-700">Cleaning</div>
        </div>
      </div>

      {/* Tables by Section */}
      {sections.map((section) => (
        <div key={section}>
          <h3 className="mb-3 flex items-center gap-2 text-md font-semibold text-slate-800 capitalize">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-500"></span>
            {section}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {tables
              ?.filter(t => (t.section || 'General') === section)
              .map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onTableClick?.(table)}
                  className="cursor-pointer"
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

export default TableGrid
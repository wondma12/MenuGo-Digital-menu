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
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.available}</div>
          <div className="text-xs text-green-700">Available</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{statusCounts.occupied}</div>
          <div className="text-xs text-red-700">Occupied</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.reserved}</div>
          <div className="text-xs text-yellow-700">Reserved</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.cleaning}</div>
          <div className="text-xs text-blue-700">Cleaning</div>
        </div>
      </div>

      {/* Tables by Section */}
      {sections.map((section) => (
        <div key={section}>
          <h3 className="text-md font-semibold text-gray-700 mb-3 capitalize flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
            {section}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
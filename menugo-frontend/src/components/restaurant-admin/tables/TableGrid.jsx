import React from 'react'
import { motion } from 'framer-motion'
import TableCard from './TableCard'

const TableGrid = ({ tables, onEdit, onRefresh }) => {
  // Ensure we only process a safe array of table objects
  const safeTables = Array.isArray(tables) ? tables.filter(Boolean) : []
  const sections = [...new Set(safeTables.map(t => t.section || 'General'))]

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section} className="rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black capitalize tracking-tight text-slate-900">{section}</h3>
              <p className="text-sm text-slate-500">{safeTables.filter(t => (t.section || 'General') === section).length} tables</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {safeTables
              .filter(t => (t.section || 'General') === section)
              .map((table, index) => (
                <motion.div
                  key={table?.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04, type: 'spring', stiffness: 120, damping: 14 }}
                >
                  <TableCard table={table} onEdit={onEdit} onRefresh={onRefresh} />
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TableGrid
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
        <div key={section}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{section}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {safeTables
              .filter(t => (t.section || 'General') === section)
              .map((table, index) => (
                <motion.div
                  key={table?.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
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
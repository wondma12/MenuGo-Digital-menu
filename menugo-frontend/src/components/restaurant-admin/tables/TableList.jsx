import React from 'react'
import TableCard from './TableCard'

const TableList = ({ tables = [], onEdit, onRefresh }) => {
  const safeTables = Array.isArray(tables) ? tables.filter(Boolean) : []

  return (
    <div className="space-y-4">
      {safeTables.map((table) => (
        <TableCard key={table.id} table={table} onEdit={onEdit} onRefresh={onRefresh} />
      ))}
    </div>
  )
}

export default TableList

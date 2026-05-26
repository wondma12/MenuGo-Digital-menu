import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { deleteTable } from '../../../services/tableService'
import toast from 'react-hot-toast'

const TableList = ({ tables = [], onEdit, onRefresh }) => {
  const safeTables = Array.isArray(tables) ? tables.filter(Boolean) : []
  const [deleteTarget, setDeleteTarget] = useState(null)

  const getStatusConfig = () => ({ label: 'Available', color: 'success' })

  const handleDelete = async () => {
    try {
      if (!deleteTarget?.id) return
      await deleteTable(deleteTarget.id)
      toast.success('Table deleted successfully')
      setDeleteTarget(null)
      onRefresh()
    } catch (error) {
      toast.error('Failed to delete table')
    }
  }

  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-900">Table Directory</h3>
            <p className="text-sm text-slate-500">Detailed overview of each table and its live status</p>
          </div>
          <div className="text-sm font-medium text-slate-500">{safeTables.length} tables</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-white">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Table</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Section</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Capacity</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {safeTables.map((table, index) => {
              const tableNumber = table.tableNumber ?? table.table_number ?? table.number ?? table.tableNo ?? table.table_no ?? '—'
              const statusConfig = getStatusConfig(table.status)
              return (
                <motion.tr
                  key={table.id || index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="transition-colors hover:bg-orange-50/40"
                >
                  <td className="px-5 py-4">
                    <div>
                        <p className="font-semibold text-slate-900">Table {tableNumber}</p>
                        {table.tableName ? <p className="text-sm text-slate-500">{table.tableName}</p> : null}
                    </div>
                  </td>
                    <td className="px-5 py-4 text-sm capitalize text-slate-700">{table.section || 'General'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1 rounded-none bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <UsersIcon className="w-3.5 h-3.5" />
                      {table.capacity} persons
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusConfig.color} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(table)}
                        className="inline-flex items-center gap-1 rounded-none px-3 py-2 text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-slate-900"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(table)}
                        className="inline-flex items-center gap-1 rounded-none px-3 py-2 text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                        title="Delete table"
                        aria-label="Delete table"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Table"
        message={`Are you sure you want to delete Table ${deleteTarget?.tableNumber ?? deleteTarget?.table_number ?? deleteTarget?.number ?? deleteTarget?.tableNo ?? deleteTarget?.table_no ?? '—'}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default TableList

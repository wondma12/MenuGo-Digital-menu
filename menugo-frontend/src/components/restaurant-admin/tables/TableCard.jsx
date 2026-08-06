import {useState} from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, QrCodeIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import QRCodeGenerator from './QRCodeGenerator'
import { updateTableStatus } from '../../../services/tableService'
import toast from 'react-hot-toast'

const TableCard = ({ table, onEdit, onRefresh }) => {
  const [showQR, setShowQR] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)
  if (!table) return null
  const tableNumber = table.tableNumber ?? table.table_number ?? table.number ?? table.tableNo ?? table.table_no ?? '—'

  const getStatusConfig = (status) => {
    return { label: 'Available', color: 'success', icon: '🟢' }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTableStatus(table.id, newStatus)
      toast.success(`Table ${table.tableNumber} is now ${newStatus}`)
      onRefresh()
      setShowStatusDialog(false)
    } catch (error) {
      toast.error('Failed to update table status')
    }
  }

  const statusConfig = getStatusConfig(table.status)

  return (
    <>
      <div className="group overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500" />
        <div className="p-5">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">Table {tableNumber}</h3>
              {table.tableName && (
                <p className="text-sm text-slate-500">{table.tableName}</p>
              )}
            </div>
            <div className="text-right">
              <Badge variant={statusConfig.color} size="sm">
                {statusConfig.icon} {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="mb-5 space-y-3 rounded-none bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Capacity:</span>
              <span className="flex items-center gap-1 font-medium text-slate-900">
                <UsersIcon className="w-3 h-3" />
                {table.capacity} persons
              </span>
            </div>
            {table.section && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Section:</span>
                <span className="capitalize text-slate-900">{table.section}</span>
              </div>
            )}
            {table.currentCustomerName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current Guest:</span>
                <span className="text-slate-900">{table.currentCustomerName}</span>
              </div>
            )}
            {table.occupiedSince && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Occupied Since:</span>
                <span className="text-slate-900">{new Date(table.occupiedSince).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setShowQR(true)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-none border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-orange-50"
            >
              <QrCodeIcon className="w-3 h-3" />
              QR Code
            </button>
            <button
              onClick={() => onEdit(table)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-none border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-orange-50"
            >
              <PencilIcon className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={() => {
                setPendingStatus('occupied')
                setShowStatusDialog(true)
              }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-none bg-gradient-to-r from-orange-500 to-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:from-orange-600 hover:to-blue-600"
            >
              <SparklesIcon className="w-3 h-3" />
              Seat Guest
            </button>
            {table.status === 'occupied' && (
              <button
                onClick={() => {
                  setPendingStatus('cleaning')
                  setShowStatusDialog(true)
                }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-none bg-slate-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                <SparklesIcon className="w-3 h-3" />
                Clear Table
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeGenerator
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          table={table}
        />
      )}

      {/* Status Change Confirmation */}
      <ConfirmationDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={() => handleStatusChange(pendingStatus)}
        title="Change Table Status"
        message={`Are you sure you want to mark Table ${tableNumber} as ${pendingStatus}?`}
        confirmText="Confirm"
      />
    </>
  )
}

export default TableCard
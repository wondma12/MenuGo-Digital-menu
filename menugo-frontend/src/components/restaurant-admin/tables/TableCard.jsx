import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, QrCodeIcon, UsersIcon, WifiIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import QRCodeGenerator from './QRCodeGenerator'
import { updateTableStatus } from '../../../services/tableService'
import toast from 'react-hot-toast'

const TableCard = ({ table, onEdit, onRefresh }) => {
  if (!table) return null
  const [showQR, setShowQR] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  const getStatusConfig = (status) => {
    const configs = {
      available: { label: 'Available', color: 'success', icon: '🟢' },
      occupied: { label: 'Occupied', color: 'danger', icon: '🔴' },
      reserved: { label: 'Reserved', color: 'warning', icon: '🟡' },
      cleaning: { label: 'Cleaning', color: 'info', icon: '🔵' },
      maintenance: { label: 'Maintenance', color: 'default', icon: '⚙️' },
    }
    return configs[status] || configs.available
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
      <div className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
        table.status === 'occupied' ? 'border-red-200' :
        table.status === 'reserved' ? 'border-yellow-200' :
        'border-gray-200'
      }`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Table {table.tableNumber}</h3>
              {table.tableName && (
                <p className="text-sm text-gray-500">{table.tableName}</p>
              )}
            </div>
            <div className="text-right">
              <Badge variant={statusConfig.color} size="sm">
                {statusConfig.icon} {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Capacity:</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                {table.capacity} persons
              </span>
            </div>
            {table.section && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Section:</span>
                <span className="text-gray-900 capitalize">{table.section}</span>
              </div>
            )}
            {table.currentCustomerName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Current Guest:</span>
                <span className="text-gray-900">{table.currentCustomerName}</span>
              </div>
            )}
            {table.occupiedSince && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Occupied Since:</span>
                <span className="text-gray-900">{new Date(table.occupiedSince).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowQR(true)}
              className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1"
            >
              <QrCodeIcon className="w-3 h-3" />
              QR Code
            </button>
            <button
              onClick={() => onEdit(table)}
              className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1"
            >
              <PencilIcon className="w-3 h-3" />
              Edit
            </button>
            {table.status === 'available' && (
              <button
                onClick={() => {
                  setPendingStatus('occupied')
                  setShowStatusDialog(true)
                }}
                className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Seat Guest
              </button>
            )}
            {table.status === 'occupied' && (
              <button
                onClick={() => {
                  setPendingStatus('cleaning')
                  setShowStatusDialog(true)
                }}
                className="flex-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
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
        message={`Are you sure you want to mark Table ${table.tableNumber} as ${pendingStatus}?`}
        confirmText="Confirm"
      />
    </>
  )
}

export default TableCard
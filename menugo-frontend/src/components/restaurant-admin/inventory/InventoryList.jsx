import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { deleteInventoryItem } from '../../../services/inventoryService'
import toast from 'react-hot-toast'

const InventoryList = ({ items, onEdit, onAdjust, onRefresh }) => {
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = async () => {
    try {
      await deleteInventoryItem(deleteTarget.id)
      toast.success('Item deleted successfully')
      onRefresh()
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { label: 'Out of Stock', color: 'danger' }
    if (item.quantity <= item.reorderLevel) return { label: 'Low Stock', color: 'warning' }
    return { label: 'In Stock', color: 'success' }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => {
                const stockStatus = getStockStatus(item)
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info" size="sm">{item.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">${item.costPerUnit}</td>
                    <td className="px-6 py-4">
                      <Badge variant={stockStatus.color} size="sm">{stockStatus.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => onAdjust(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <PlusIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-primary-600 rounded">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1 text-gray-500 hover:text-red-600 rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default InventoryList
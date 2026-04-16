import React, { useState } from 'react'
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { updateMenuItemAvailability, deleteMenuItem } from '../../../services/menuService'
import toast from 'react-hot-toast'

const MenuItemCard = ({ item, isSelected, onSelect, onEdit, onRefresh }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleAvailabilityToggle = async () => {
    try {
      await updateMenuItemAvailability(item.id, !item.isAvailable)
      toast.success(`Item ${!item.isAvailable ? 'available' : 'unavailable'}`)
      onRefresh()
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMenuItem(item.id)
      toast.success('Item deleted successfully')
      onRefresh()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border-2 transition-all ${isSelected ? 'border-primary-500' : 'border-gray-200'} hover:shadow-md`}>
        <div className="relative">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="absolute top-2 left-2 z-10 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-t-xl" />
          ) : (
            <div className="w-full h-40 bg-gray-100 rounded-t-xl flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50"
            >
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 text-red-600" />
            </button>
          </div>
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-xl flex items-center justify-center">
              <Badge variant="danger" size="md">Unavailable</Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <span className="font-bold text-primary-600">${item.price}</span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {item.isVegetarian && <Badge variant="success" size="sm">Veg</Badge>}
            {item.isVegan && <Badge variant="success" size="sm">Vegan</Badge>}
            {item.isGlutenFree && <Badge variant="info" size="sm">GF</Badge>}
            {item.spiceLevel > 0 && (
              <Badge variant="warning" size="sm">{'🔥'.repeat(item.spiceLevel)}</Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Badge variant="default" size="sm">{item.category && typeof item.category === 'object' ? (item.category.name || item.category.title || item.categoryId) : (item.category || item.categoryId || 'Uncategorized')}</Badge>
            <button
              onClick={handleAvailabilityToggle}
              className={`text-sm flex items-center gap-1 ${item.isAvailable ? 'text-green-600' : 'text-gray-400'}`}
            >
              {item.isAvailable ? (
                <CheckCircleIcon className="w-4 h-4" />
              ) : (
                <XCircleIcon className="w-4 h-4" />
              )}
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default MenuItemCard
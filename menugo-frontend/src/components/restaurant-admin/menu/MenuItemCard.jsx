import {useState} from 'react'
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
      <div className={`overflow-hidden rounded-none bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-1 ${isSelected ? 'ring-2 ring-orange-300' : ''}`}>
        <div className="relative w-full">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="absolute left-2 top-2 z-10 h-4 w-4 rounded-none border-slate-300 text-orange-600 focus:ring-orange-100"
          />
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-56 md:h-64 object-cover" />
          ) : (
            <div className="flex h-56 w-full flex-col items-center justify-center bg-gradient-to-r from-orange-50 to-blue-50 text-slate-400 md:h-64">
              <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-14 w-14 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14l2-2 2 2 4-4 4 4" />
              </svg>
              <div className="text-sm">No image</div>
            </div>
          )}
            <div className="absolute right-2 top-2 flex gap-1">
            <button
              onClick={handleAvailabilityToggle}
                className="rounded-none bg-white p-1.5 shadow-sm hover:bg-orange-50"
              title={item.isAvailable ? 'Set inactive' : 'Set active'}
            >
              {item.isAvailable ? (
                  <XCircleIcon className="h-4 w-4 text-emerald-600" />
              ) : (
                  <CheckCircleIcon className="h-4 w-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={onEdit}
                className="rounded-none bg-white p-1.5 shadow-sm hover:bg-orange-50"
            >
              <PencilIcon className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
                className="rounded-none bg-white p-1.5 shadow-sm hover:bg-rose-50"
            >
              <TrashIcon className="h-4 w-4 text-rose-600" />
            </button>
          </div>
          {!item.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Badge variant="danger" size="md">Unavailable</Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-slate-900 md:text-xl">{item.name}</h3>
            <span className="text-lg font-extrabold text-orange-600">{item.price}</span>
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-slate-500">{item.description}</p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {item.isVegetarian && <Badge variant="success" size="sm">Veg</Badge>}
            {item.isVegan && <Badge variant="success" size="sm">Vegan</Badge>}
            {item.isGlutenFree && <Badge variant="info" size="sm">GF</Badge>}
            {item.spiceLevel > 0 && (
              <Badge variant="warning" size="sm">{'🔥'.repeat(item.spiceLevel)}</Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-3">
            <Badge variant="default" size="sm">{item.category && typeof item.category === 'object' ? (item.category.name || item.category.title || item.categoryId) : (item.category || item.categoryId || 'Uncategorized')}</Badge>
            <div className={`flex items-center gap-1 text-sm ${item.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
              {item.isAvailable ? (
                <CheckCircleIcon className="w-4 h-4" />
              ) : (
                <XCircleIcon className="w-4 h-4" />
              )}
              <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
            </div>
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
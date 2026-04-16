import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, FolderIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { deleteCategory, updateCategoryStatus } from '../../../services/categoryService'
import toast from 'react-hot-toast'

const CategoryCard = ({ category, onEdit, onRefresh }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleToggleStatus = async () => {
    try {
      await updateCategoryStatus(category.id, !category.isActive)
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`)
      onRefresh()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id)
      toast.success('Category deleted successfully')
      onRefresh()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
          category.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
        } hover:shadow-md`}
      >
        <div className="p-5">
          {/* Icon and Status */}
          <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              {category.icon ? (
                <img src={category.icon} alt={category.name} className="w-8 h-8 object-cover" />
              ) : (
                <FolderIcon className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <button
              onClick={handleToggleStatus}
              className={`p-1.5 rounded-lg ${
                category.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {category.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
            </button>
          </div>

          {/* Name and Description */}
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{category.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {category.description || 'No description'}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="info" size="sm">{category.itemCount || 0} items</Badge>
            <span className="text-xs text-gray-400">Order: {category.displayOrder}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1"
            >
              <PencilIcon className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={category.itemCount > 0}
              className={`flex-1 px-3 py-1.5 text-sm rounded-lg flex items-center justify-center gap-1 ${
                category.itemCount > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-600 hover:bg-red-50'
              }`}
              title={category.itemCount > 0 ? "Cannot delete category with items" : ""}
            >
              <TrashIcon className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default CategoryCard
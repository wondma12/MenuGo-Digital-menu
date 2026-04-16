import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { deleteCategory, updateCategoryStatus } from '../../../services/categoryService'
import toast from 'react-hot-toast'

const CategoryList = ({ categories, onEdit, onRefresh }) => {
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteTarget.id)
      toast.success('Category deleted successfully')
      onRefresh()
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  const handleToggleStatus = async (category) => {
    try {
      await updateCategoryStatus(category.id, !category.isActive)
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`)
      onRefresh()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {category.icon ? (
                        <img src={category.icon} alt={category.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-primary-600 text-sm">{category.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info" size="sm">{category.itemCount || 0} items</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(category)}
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        category.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {category.isActive ? (
                        <EyeIcon className="w-3 h-3" />
                      ) : (
                        <EyeSlashIcon className="w-3 h-3" />
                      )}
                      {category.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.displayOrder}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="p-1 text-gray-500 hover:text-primary-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(category)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        disabled={category.itemCount > 0}
                        title={category.itemCount > 0 ? "Cannot delete category with items" : ""}
                      >
                        <TrashIcon className={`w-4 h-4 ${category.itemCount > 0 ? 'opacity-50' : ''}`} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove the category from all menu items.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default CategoryList
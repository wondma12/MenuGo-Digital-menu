import {useState} from 'react'
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
        className={`bg-white rounded-none shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all ${
          category.isActive ? '' : 'opacity-60'
        } hover:shadow-md`}
      >
        <div className="p-5">
          {/* Icon and Status */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-none bg-orange-50">
              {category.icon ? (
                <img src={category.icon} alt={category.name} className="h-8 w-8 object-cover" />
              ) : (
                <FolderIcon className="h-6 w-6 text-orange-600" />
              )}
            </div>
            <button
              onClick={handleToggleStatus}
              className={`p-1.5 rounded-none ${
                category.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              {category.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
            </button>
          </div>

          {/* Name and Description */}
          <h3 className="mb-1 text-lg font-semibold text-slate-900">{category.name}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-slate-500">
            {category.description || 'No description'}
          </p>

          {/* Stats */}
          <div className="mb-4 flex items-center justify-between">
            <Badge variant="info" size="sm">{category.itemCount || 0} items</Badge>
            <span className="text-xs text-slate-400">Order: {category.displayOrder}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-1 rounded-none px-3 py-1.5 text-sm text-slate-600 hover:bg-orange-50"
            >
              <PencilIcon className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={category.itemCount > 0}
              className={`flex flex-1 items-center justify-center gap-1 rounded-none px-3 py-1.5 text-sm ${
                category.itemCount > 0
                  ? 'cursor-not-allowed text-slate-400'
                  : 'text-rose-600 hover:bg-rose-50'
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
import {useState} from 'react'
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

  // Status is display-only in this view; toggling removed per admin request

  return (
    <>
      <div className="overflow-hidden rounded-none bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-orange-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {category.icon ? (
                        <img src={category.icon} alt={category.name} className="h-8 w-8 rounded-none object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-orange-50">
                          <span className="text-sm text-orange-600">{category.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-medium text-slate-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info" size="sm">{category.itemCount || 0} items</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex w-fit items-center gap-1 px-2 py-1 text-xs font-medium ${
                      category.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                    >
                      {category.isActive ? (
                        <EyeIcon className="w-3 h-3" />
                      ) : (
                        <EyeSlashIcon className="w-3 h-3" />
                      )}
                      {category.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="p-1 text-slate-500 hover:text-orange-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(category)}
                        className="p-1 text-slate-500 hover:text-rose-600"
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
        <div className="space-y-3 p-3 md:hidden">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-none border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {category.icon ? (
                    <img src={category.icon} alt={category.name} className="h-10 w-10 rounded-none object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-none bg-orange-50">
                      <span className="text-sm text-orange-600">{category.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{category.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{category.description || 'No description'}</p>
                  </div>
                </div>
                <div className={`flex w-fit items-center gap-1 px-2 py-1 text-xs font-medium ${
                  category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {category.isActive ? <EyeIcon className="w-3 h-3" /> : <EyeSlashIcon className="w-3 h-3" />}
                  {category.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm">{category.itemCount || 0} items</Badge>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEdit(category)}
                  className="p-1 text-slate-500 hover:text-orange-600"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(category)}
                  className="p-1 text-slate-500 hover:text-rose-600"
                  disabled={category.itemCount > 0}
                  title={category.itemCount > 0 ? 'Cannot delete category with items' : ''}
                >
                  <TrashIcon className={`w-4 h-4 ${category.itemCount > 0 ? 'opacity-50' : ''}`} />
                </button>
              </div>
            </motion.div>
          ))}
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
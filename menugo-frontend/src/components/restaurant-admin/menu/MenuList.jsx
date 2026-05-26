import React from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { updateMenuItemAvailability, deleteMenuItem } from '../../../services/menuService'
import toast from 'react-hot-toast'

const MenuList = ({ items, selectedItems, onSelectItem, onEdit, onRefresh }) => {
  const [deleteTarget, setDeleteTarget] = React.useState(null)

  const handleAvailabilityToggle = async (item) => {
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
      await deleteMenuItem(deleteTarget.id)
      toast.success('Item deleted successfully')
      onRefresh()
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  const getCategoryColor = (category) => {
    const map = {
      appetizer: 'primary',
      starter: 'primary',
      main: 'success',
      entree: 'success',
      dessert: 'purple',
      beverage: 'warning',
      drink: 'warning',
    }
    return map[category?.toLowerCase()] || 'default'
  }

  return (
    <>
      <div className="overflow-hidden rounded-none bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectItem(items.map(i => i.id))
                      } else {
                        onSelectItem([])
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Dietary</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-orange-50"
                  >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => onSelectItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-none object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-none bg-slate-100">
                          <span className="text-xs text-slate-400">No image</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="line-clamp-1 text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getCategoryColor(item.category)} size="sm">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">{item.price}</span>
                    {item.discountPrice && (
                      <span className="ml-1 text-xs text-slate-400 line-through">{item.discountPrice}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1 rounded-none px-2 py-1 text-xs font-medium ${
                      item.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.isAvailable ? (
                        <CheckCircleIcon className="w-3 h-3" />
                      ) : (
                        <XCircleIcon className="w-3 h-3" />
                      )}
                      <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {item.isVegetarian && <Badge variant="success" size="sm">Veg</Badge>}
                      {item.isVegan && <Badge variant="success" size="sm">Vegan</Badge>}
                      {item.isGlutenFree && <Badge variant="info" size="sm">GF</Badge>}
                      {item.spiceLevel > 0 && (
                        <Badge variant="warning" size="sm">{'🔥'.repeat(item.spiceLevel)}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.salesCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAvailabilityToggle(item)}
                        className={`p-1 ${item.isAvailable ? 'text-slate-500 hover:text-rose-600' : 'text-slate-500 hover:text-emerald-600'}`}
                        title={item.isAvailable ? 'Set inactive' : 'Set active'}
                      >
                        {item.isAvailable ? (
                          <XCircleIcon className="w-4 h-4" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-slate-500 hover:text-orange-600"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
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
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default MenuList
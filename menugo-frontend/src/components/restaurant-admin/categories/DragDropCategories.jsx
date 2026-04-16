import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bars3Icon, FolderIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { updateCategoryOrder } from '../../../services/categoryService'
import toast from 'react-hot-toast'

const DragDropCategories = ({ categories, onReorder }) => {
  const [items, setItems] = useState(categories)

  useEffect(() => {
    setItems(categories)
  }, [categories])

  const persistOrder = async (nextItems) => {
    setItems(nextItems)

    try {
      await updateCategoryOrder(
        nextItems.map((item, index) => ({
          id: item.id,
          displayOrder: index,
        }))
      )
      toast.success('Category order updated')
      onReorder()
    } catch (error) {
      toast.error('Failed to update order')
      setItems(categories)
    }
  }

  const moveItem = (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return

    const nextItems = [...items]
    const [movedItem] = nextItems.splice(index, 1)
    nextItems.splice(nextIndex, 0, movedItem)
    persistOrder(nextItems)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Use the arrows to reorder categories</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Bars3Icon className="h-5 w-5 text-gray-400" />
              {category.icon ? (
                <img src={category.icon} alt={category.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                  <FolderIcon className="h-4 w-4 text-primary-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-xs text-gray-500">{category.itemCount || 0} items</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 disabled:opacity-40"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 disabled:opacity-40"
              >
                <ArrowDownIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default DragDropCategories

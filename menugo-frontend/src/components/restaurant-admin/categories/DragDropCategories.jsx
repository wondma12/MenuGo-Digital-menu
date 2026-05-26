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
    <div className="overflow-hidden rounded-none bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-5 w-5 text-slate-500" />
          <span className="text-sm text-slate-600">Use the arrows to reorder categories</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Bars3Icon className="h-5 w-5 text-slate-400" />
              {category.icon ? (
                <img src={category.icon} alt={category.name} className="h-8 w-8 rounded-none object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-none bg-orange-50">
                  <FolderIcon className="h-4 w-4 text-orange-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-slate-900">{category.name}</p>
                <p className="text-xs text-slate-500">{category.itemCount || 0} items</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="rounded-none border border-slate-200 p-2 text-slate-500 disabled:opacity-40"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="rounded-none border border-slate-200 p-2 text-slate-500 disabled:opacity-40"
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

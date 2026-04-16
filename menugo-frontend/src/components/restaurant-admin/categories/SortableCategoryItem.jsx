import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Bars3Icon, FolderIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'

const SortableCategoryItem = ({ category, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 hover:bg-gray-50 transition-colors ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <Bars3Icon className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          {category.icon ? (
            <img src={category.icon} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-primary-600" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{category.name}</p>
              {!category.isActive && (
                <Badge variant="danger" size="sm">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">
              {category.description || 'No description'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="info" size="sm">{category.itemCount || 0} items</Badge>
          <span className="text-sm text-gray-400 w-12 text-right">
            Order: {index + 1}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SortableCategoryItem
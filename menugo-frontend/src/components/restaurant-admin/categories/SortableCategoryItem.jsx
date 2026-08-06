
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
      className={`p-4 transition-colors hover:bg-orange-50 ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-none p-1 active:cursor-grabbing hover:bg-orange-100"
        >
          <Bars3Icon className="h-5 w-5 text-slate-400" />
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          {category.icon ? (
            <img src={category.icon} alt={category.name} className="h-10 w-10 rounded-none object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-orange-50">
              <FolderIcon className="h-5 w-5 text-orange-600" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-slate-900">{category.name}</p>
              {!category.isActive && (
                <Badge variant="danger" size="sm">Inactive</Badge>
              )}
            </div>
            <p className="line-clamp-1 text-sm text-slate-500">
              {category.description || 'No description'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="info" size="sm">{category.itemCount || 0} items</Badge>
          <span className="w-12 text-right text-sm text-slate-400">
            Order: {index + 1}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SortableCategoryItem
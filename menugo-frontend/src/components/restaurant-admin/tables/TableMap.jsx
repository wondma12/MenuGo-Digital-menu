import {useState} from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import TableModal from './TableModal'

const TableMap = ({ tables, onEdit, onRefresh }) => {
  const [selectedTable, setSelectedTable] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState(null)

  // Default canvas size
  const canvasWidth = 800
  const canvasHeight = 500

  const getTableShapeStyles = (shape, width, height) => {
    const shapes = {
      rectangle: `w-${width || 20} h-${height || 16}`,
      circle: 'rounded-full',
      square: 'rounded-md',
    }
    return shapes[shape] || shapes.rectangle
  }

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 border-green-500 text-green-700',
      occupied: 'bg-red-100 border-red-500 text-red-700',
      reserved: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      cleaning: 'bg-blue-100 border-blue-500 text-blue-700',
      maintenance: 'bg-gray-100 border-gray-500 text-gray-700',
    }
    return colors[status] || colors.available
  }

  return (
    <div className="space-y-4">
      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black tracking-tight text-slate-900">Floor Layout</h3>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-none bg-orange-500"></div><span className="text-slate-600">Available</span></div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-none bg-blue-500"></div><span className="text-slate-600">Occupied</span></div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-none bg-amber-400"></div><span className="text-slate-600">Reserved</span></div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-none bg-slate-500"></div><span className="text-slate-600">Cleaning</span></div>
          </div>
        </div>
        
        <div 
          className="relative rounded-none border-2 border-slate-200 bg-slate-50"
          style={{ width: canvasWidth, height: canvasHeight, margin: '0 auto' }}
        >
          {/* Background grid */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Tables */}
          {tables.map((table) => (
            <motion.div
              key={table.id}
              drag
              dragMomentum={false}
              dragConstraints={{ left: 0, right: canvasWidth - 100, top: 0, bottom: canvasHeight - 100 }}
              initial={{ x: table.xPosition || 100, y: table.yPosition || 100 }}
              animate={{ x: table.xPosition || 100, y: table.yPosition || 100 }}
              whileHover={{ scale: 1.05 }}
              className={`absolute cursor-move rounded-none border-2 p-2 shadow-sm transition-all ${getStatusColor(table.status)}`}
              style={{ width: table.width || 80, height: table.height || 80 }}
              onDoubleClick={() => onEdit(table)}
            >
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-lg font-black text-slate-900">{table.tableNumber}</span>
                <span className="text-xs text-slate-600">{table.capacity} seats</span>
                {table.currentCustomerName && (
                  <span className="max-w-full truncate text-xs text-slate-700">{table.currentCustomerName}</span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Add table button */}
          <button
            onClick={() => setSelectedTable({ x: 200, y: 200 })}
            className="absolute bottom-4 right-4 rounded-none bg-gradient-to-r from-orange-500 to-blue-500 p-2 text-white shadow-lg hover:from-orange-600 hover:to-blue-600"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedTable && (
        <TableModal
          isOpen={!!selectedTable}
          onClose={() => setSelectedTable(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  )
}

export default TableMap
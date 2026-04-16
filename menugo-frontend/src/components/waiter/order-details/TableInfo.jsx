import React from 'react'
import { MapPin, Users } from 'lucide-react'

const TableInfo = ({ table }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Table Information</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">Table {table?.number}</span>
        </div>
        {table?.section && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Section:</span>
            <span className="text-gray-700">{table.section}</span>
          </div>
        )}
        {table?.capacity && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">Capacity: {table.capacity} persons</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TableInfo
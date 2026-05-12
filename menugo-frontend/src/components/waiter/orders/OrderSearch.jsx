import React from 'react'
import { Search, X } from 'lucide-react'

const OrderSearch = ({ value, onChange }) => {
  const handleClear = () => onChange('')

  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by order number or customer..."
        className={`w-full pl-11 pr-3 px-0 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none text-black`}
      />
      {value && (
        <button onClick={handleClear} className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-500 hover:text-gray-700 text-sm">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default OrderSearch
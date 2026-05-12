import React from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

const MenuSearch = ({ value, onChange, placeholder = "Search menu items..." }) => {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none text-black bg-white`}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-3 border border-gray-300 rounded-lg bg-white text-gray-500 hover:text-gray-700 text-sm"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default MenuSearch
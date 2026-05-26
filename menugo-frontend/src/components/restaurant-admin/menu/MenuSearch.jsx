import React from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

const MenuSearch = ({ value, onChange, placeholder = "Search menu items..." }) => {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full appearance-none rounded-none border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-slate-900 transition-all duration-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-10 -translate-y-1/2 rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-500 hover:text-slate-700"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default MenuSearch
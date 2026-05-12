import React from 'react'
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const SearchBar = ({ value, onChange, onFilterClick, viewMode, onViewModeChange }) => {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="flex flex-col sm:flex-row gap-2 items-center">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search menu..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <button
          onClick={onFilterClick}
          className="flex-0 w-full sm:w-auto p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
        >
          <FunnelIcon className="w-5 h-5 text-gray-600 mx-auto" />
        </button>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
          >
            <ListBulletIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default SearchBar
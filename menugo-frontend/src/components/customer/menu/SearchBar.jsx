import React from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const SearchBar = ({ value, onChange, onFilterClick }) => {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search menu..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
        />
      </div>
      <button
        type="button"
        onClick={onFilterClick}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
        aria-label="Open filters"
      >
        <FunnelIcon className="h-4 w-4" />
        <span className="sm:hidden">Filter</span>
      </button>
    </motion.div>
  )
}

export default SearchBar
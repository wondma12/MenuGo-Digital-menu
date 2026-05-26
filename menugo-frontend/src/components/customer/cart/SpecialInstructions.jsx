import React from 'react'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'

const SpecialInstructions = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Special Instructions (Optional)</label>
      <div className="relative">
        <ClipboardDocumentIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Any special requests? (allergies, preferences, etc.)"
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 text-slate-900"
          rows={3}
        />
      </div>
    </div>
  )
}

export default SpecialInstructions
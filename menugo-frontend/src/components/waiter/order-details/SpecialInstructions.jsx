import React from 'react'
import { Clipboard } from 'lucide-react'

const SpecialInstructions = ({ instructions }) => {
  return (
    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
      <div className="flex items-center gap-2 mb-2">
        <Clipboard className="w-4 h-4 text-yellow-600" />
        <span className="text-sm font-medium text-yellow-800">Special Instructions</span>
      </div>
      <p className="text-sm text-yellow-700">{instructions}</p>
    </div>
  )
}

export default SpecialInstructions
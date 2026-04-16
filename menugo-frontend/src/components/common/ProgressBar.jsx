import React from 'react'
import { motion } from 'framer-motion'

const ProgressBar = ({ value = 0, max = 100, showLabel = true, labelPosition = 'right', size = 'md', color = 'primary', className = '' }) => {
  const percentage = (value / max) * 100

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  }

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && labelPosition === 'left' && (
          <span className="text-sm text-gray-600">{value}/{max}</span>
        )}
        {showLabel && labelPosition === 'right' && (
          <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`${colors[color]} rounded-full ${sizes[size]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
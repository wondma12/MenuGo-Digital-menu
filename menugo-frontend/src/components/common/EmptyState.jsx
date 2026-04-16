import React from 'react'
import Button from './Button'

const EmptyState = ({ title, description, icon: Icon, actionText, onAction, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
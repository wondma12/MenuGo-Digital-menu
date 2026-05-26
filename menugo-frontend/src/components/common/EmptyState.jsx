import React from 'react'
import Button from './Button'

const EmptyState = ({ title, description, icon: Icon, actionText, onAction, className = '' }) => {
  return (
    <div className={`py-12 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-blue-50 ring-1 ring-orange-100">
          <Icon className="h-10 w-10 text-orange-400" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-black text-slate-900">{title}</h3>
      <p className="mx-auto mb-6 max-w-sm text-slate-500">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" className="rounded-none bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600">
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
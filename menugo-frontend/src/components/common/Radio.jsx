import React, { forwardRef } from 'react'

const Radio = forwardRef(({
  label,
  name,
  value,
  checked,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-4 h-4 text-primary-600 border-gray-300
            focus:ring-2 focus:ring-primary-500
            transition-colors duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
          {...props}
        />
        {label && (
          <span className={`text-sm text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
            {label}
          </span>
        )}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})

Radio.displayName = 'Radio'

export default Radio
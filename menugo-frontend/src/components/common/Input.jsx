import React, { forwardRef, useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const Input = forwardRef(({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`
            w-full border border-slate-200 bg-white px-4 py-2.5 text-slate-900 rounded-none
            focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300
            transition-all duration-200
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100' : ''}
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${(type === 'password' || (Icon && iconPosition === 'right')) ? 'pr-10' : ''}
            ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : ''}
            ${className}
          `}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            )}
          </button>
        )}
        {Icon && iconPosition === 'right' && type !== 'password' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
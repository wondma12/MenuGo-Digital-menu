import {forwardRef} from 'react'

const Checkbox = forwardRef(({
  label,
  name,
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
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-4 h-4 text-primary-600 border-gray-300 rounded
            focus:ring-2 focus:ring-primary-500 focus:ring-offset-0
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

Checkbox.displayName = 'Checkbox'

export default Checkbox
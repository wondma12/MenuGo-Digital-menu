import {forwardRef} from 'react'

const Select = forwardRef(({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full appearance-none rounded-none border border-slate-200 bg-white px-4 py-2.5 text-slate-900
          transition-all duration-200
          focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100
          ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100' : ''}
          ${disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="" className="text-slate-900">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-slate-900">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
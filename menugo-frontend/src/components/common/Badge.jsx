

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-gray-50 text-gray-800',
    primary: 'bg-sky-100 text-sky-800',
    success: 'bg-green-50 text-green-800',
    danger: 'bg-red-50 text-red-800',
    warning: 'bg-yellow-50 text-yellow-800',
    info: 'bg-indigo-50 text-indigo-800',
    purple: 'bg-purple-50 text-purple-800',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span className={`
      inline-flex items-center justify-center font-medium rounded-full shadow-sm
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  )
}

export default Badge
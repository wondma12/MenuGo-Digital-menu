
import { motion } from 'framer-motion'

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white shadow-md focus:ring-orange-300',
    secondary: 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 focus:ring-gray-300',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-600 hover:text-white focus:ring-orange-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-300',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
  }

  return (
    <motion.button
      type={type}
      whileHover={!disabled && !isLoading ? { scale: 1.03 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.985 } : {}}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </motion.button>
  )
}

export default Button
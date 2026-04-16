import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footer,
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`
        bg-white rounded-xl shadow-lg overflow-hidden
        ${hoverable ? 'cursor-pointer transition-all duration-200 hover:shadow-xl' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || Icon || actions) && (
        <div className={`px-6 py-4 border-b border-gray-100 ${headerClassName}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
              )}
              <div>
                {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 ${footer.props.className || ''}`}>{footer}</div>}
    </motion.div>
  )
}

export default Card
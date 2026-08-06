
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    error: <XCircleIcon className="w-5 h-5 text-red-500" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
    info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
  }

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          flex items-start gap-3 p-4 rounded-lg border
          ${colors[type]}
          ${className}
        `}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          {title && <h4 className={`text-sm font-semibold ${textColors[type]}`}>{title}</h4>}
          {message && <p className={`text-sm ${textColors[type]} mt-1`}>{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="flex-shrink-0">
            <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default Alert
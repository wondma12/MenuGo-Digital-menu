import {useEffect} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`
          fixed top-4 right-4 z-50 flex items-center gap-3
          px-4 py-3 rounded-lg border shadow-lg
          ${colors[type]}
        `}
      >
        {icons[type]}
        <span className="text-sm text-gray-800">{message}</span>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast
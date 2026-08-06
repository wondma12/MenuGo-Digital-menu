
import { motion } from 'framer-motion'

const Switch = ({ checked, onChange, label, disabled = false, className = '' }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
        />
        <motion.div
          className={`
            w-11 h-6 rounded-full transition-colors duration-200
            ${checked ? 'bg-primary-600' : 'bg-gray-300'}
          `}
          animate={{ backgroundColor: checked ? '#2563eb' : '#d1d5db' }}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
}

export default Switch
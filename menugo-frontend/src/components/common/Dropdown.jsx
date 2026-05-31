import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Dropdown = ({
  trigger,
  items,
  align = 'left',
  className = '',
  menuLayout = 'vertical',
  menuDir = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const resolvedDir = menuDir === 'auto'
    ? (typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr')
    : menuDir

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  }

  const isHorizontal = menuLayout === 'horizontal'
  const panelClasses = isHorizontal
    ? 'w-auto max-w-[min(92vw,40rem)] overflow-x-auto overflow-y-hidden'
    : 'w-48 overflow-hidden'

  const listClasses = isHorizontal
    ? `flex flex-nowrap gap-1 p-1 ${resolvedDir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`
    : 'flex flex-col'

  const itemClasses = isHorizontal
    ? `shrink-0 min-w-[11rem] whitespace-nowrap px-3 py-2 text-sm flex items-center gap-2 ${resolvedDir === 'rtl' ? 'text-right' : 'text-left'}`
    : 'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2'

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            dir={resolvedDir}
            style={isHorizontal ? { WebkitOverflowScrolling: 'touch' } : undefined}
            className={`
              absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200
              z-[60] ${panelClasses} ${alignClasses[align]} ${className}
            `}
          >
            <div className={listClasses}>
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.()
                    setIsOpen(false)
                  }}
                  className={`
                    ${itemClasses}
                    ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dropdown
import React, { useState } from 'react'
import { motion } from 'framer-motion'

const Tabs = ({ tabs, defaultTab = 0, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabClick = (index) => {
    setActiveTab(index)
    if (onChange) {
      onChange(index, tabs[index])
    }
    // Ensure the main scrolling container resets to top when switching tabs
    try {
      const main = document.querySelector('main')
      if (main && typeof main.scrollTo === 'function') {
        // small timeout to wait for content change animation
        setTimeout(() => main.scrollTo({ top: 0, behavior: 'smooth' }), 80)
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className={className}>
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto pb-2 sm:gap-4 lg:gap-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`
                flex shrink-0 items-center whitespace-nowrap px-2 pb-4 text-sm font-medium transition-all duration-200 sm:px-3
                ${activeTab === index
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }
              `}
            >
              {tab.icon && <tab.icon className="mr-2 inline h-4 w-4" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  ml-2 rounded-none px-2 py-0.5 text-xs
                  ${activeTab === index ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tabs[activeTab].content}
        </motion.div>
      </div>
    </div>
  )
}

export default Tabs
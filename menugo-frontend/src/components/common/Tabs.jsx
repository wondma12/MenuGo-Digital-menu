import React, { useState } from 'react'
import { motion } from 'framer-motion'

const Tabs = ({ tabs, defaultTab = 0, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabClick = (index) => {
    setActiveTab(index)
    if (onChange) {
      onChange(index, tabs[index])
    }
  }

  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`
                pb-4 px-1 text-sm font-medium transition-all duration-200
                ${activeTab === index
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon && <tab.icon className="w-4 h-4 inline mr-2" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  ml-2 px-2 py-0.5 text-xs rounded-full
                  ${activeTab === index ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
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
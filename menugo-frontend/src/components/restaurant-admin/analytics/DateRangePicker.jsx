import React, { useState, useRef, useEffect } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { safeParseDate } from '../../../utils/dateUtils'

const DateRangePicker = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)

  const presets = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Month', type: 'month' },
    { label: 'Last Month', type: 'lastMonth' },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applyPreset = (preset) => {
    let end = new Date()
    let start = new Date()

    if (preset.days !== undefined) {
      start.setDate(end.getDate() - preset.days)
    } else if (preset.type === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1)
    } else if (preset.type === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1)
      end.setDate(0)
    }

    onChange({ start, end })
    setIsOpen(false)
  }

  const displayValue = (() => {
    const start = safeParseDate(value?.start)
    const end = safeParseDate(value?.end)
    return start && end
      ? `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
      : 'Select date range'
  })()

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-none border border-gray-300 px-4 py-2 text-left hover:bg-gray-50 sm:w-auto"
      >
        <CalendarIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
        <span className="truncate text-sm text-gray-700">{displayValue}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
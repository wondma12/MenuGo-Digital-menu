import React, { useState, useRef, useEffect } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isValid } from 'date-fns'
import { safeParseDate } from '../../utils/dateUtils'

const DatePicker = ({ selected, onChange, label, error, className = '', placeholder = 'Select date' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const parseDate = safeParseDate
  const initMonth = (() => {
    const cand = parseDate(selected) || new Date()
    return isValid(cand) ? cand : new Date()
  })()

  const [currentMonth, setCurrentMonth] = useState(initMonth)
  const pickerRef = useRef(null)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const safeCurrent = isValid(currentMonth) ? currentMonth : new Date()
  const monthStart = startOfMonth(safeCurrent)
  const monthEnd = endOfMonth(safeCurrent)
  let daysInMonth = []
  if (isValid(monthStart) && isValid(monthEnd) && monthStart <= monthEnd) {
    try {
      daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    } catch (e) {
      daysInMonth = []
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateSelect = (date) => {
    onChange(date)
    setIsOpen(false)
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          value={selected && isValid(parseDate(selected)) ? format(parseDate(selected), 'MMM dd, yyyy') : ''}
          placeholder={placeholder}
          readOnly
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
              ←
            </button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date, index) => {
              const isSelected = selected && isSameDay(date, selected)
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isCurrentDay = isToday(date)
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    text-center py-2 rounded-lg text-sm transition-colors
                    ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                    ${isSelected ? 'bg-primary-600 text-white' : ''}
                    ${isCurrentDay && !isSelected ? 'border border-primary-600' : ''}
                    ${isCurrentMonth && !isSelected ? 'hover:bg-gray-100' : ''}
                  `}
                >
                  {format(date, 'd')}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
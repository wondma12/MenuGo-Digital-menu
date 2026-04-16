import React, { useState, useRef, useEffect } from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'

const TimePicker = ({ selected, onChange, label, error, className = '', placeholder = 'Select time', interval = 30 }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const hour12 = hour % 12 || 12
        const ampm = hour < 12 ? 'AM' : 'PM'
        const minuteStr = minute.toString().padStart(2, '0')
        const timeString = `${hour12}:${minuteStr} ${ampm}`
        const value = `${hour.toString().padStart(2, '0')}:${minuteStr}`
        slots.push({ label: timeString, value })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTimeSelect = (time) => {
    onChange(time)
    setIsOpen(false)
  }

  const getDisplayValue = () => {
    if (!selected) return ''
    const [hours, minutes] = selected.split(':')
    const hour12 = parseInt(hours) % 12 || 12
    const ampm = parseInt(hours) < 12 ? 'AM' : 'PM'
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          value={getDisplayValue()}
          placeholder={placeholder}
          readOnly
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto w-48">
          {timeSlots.map((slot, index) => (
            <button
              key={index}
              onClick={() => handleTimeSelect(slot.value)}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                ${selected === slot.value ? 'bg-primary-50 text-primary-600' : 'text-gray-700'}
              `}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimePicker
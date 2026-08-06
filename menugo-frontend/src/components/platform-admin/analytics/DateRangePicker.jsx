import {useState, useRef, useEffect} from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { format, endOfMonth } from 'date-fns'
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
      end = safeParseDate(end) ? endOfMonth(end) : end
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
        className="inline-flex shrink-0 items-center gap-2 rounded-none border border-orange-200 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-slate-700 shadow-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-50/70 hover:text-slate-900"
      >
        <CalendarIcon className="h-3.5 w-3.5 text-orange-500" />
        <span>{displayValue}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-none border border-orange-100 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="p-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="w-full rounded-none px-3 py-2 text-left text-xs text-slate-700 transition-colors duration-150 hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-slate-900"
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
import React, { useEffect, useRef, useState } from 'react'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils'
import toast from 'react-hot-toast'

const ExportReport = ({ data, type, dateRange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (format) => {
    try {
      const exportData = {
        type,
        data,
        dateRange,
        exportedAt: new Date().toISOString(),
      }

      switch (format) {
        case 'csv':
          exportToCSV(exportData, `${type}_report`)
          break
        case 'excel':
          await exportToExcel(exportData, `${type}_report`)
          break
        case 'pdf':
          await exportToPDF(exportData, `${type}_report`)
          break
        default:
          break
      }
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const exportOptions = [
    { label: 'Export as CSV', onClick: () => handleExport('csv') },
    { label: 'Export as Excel', onClick: () => handleExport('excel') },
    { label: 'Export as PDF', onClick: () => handleExport('pdf') },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex shrink-0 items-center gap-2 rounded-none bg-gradient-to-r from-orange-500 to-blue-500 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-[0_16px_36px_rgba(59,130,246,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
      >
        <DocumentArrowDownIcon className="h-3.5 w-3.5" />
        Export Report
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-none border border-orange-100 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="p-2">
            {exportOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  option.onClick()
                }}
                className="flex w-full items-center rounded-none px-3 py-2 text-left text-xs text-slate-700 transition-colors duration-150 hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-slate-900"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportReport
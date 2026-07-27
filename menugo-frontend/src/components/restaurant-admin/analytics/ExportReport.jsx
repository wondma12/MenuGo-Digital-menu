import React from 'react'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import Dropdown from '../../../common/Dropdown'
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils'
import toast from 'react-hot-toast'

const ExportReport = ({ data, type, dateRange, className = '' }) => {
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

  const triggerClass = `inline-flex shrink-0 items-center gap-2 rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-lg shadow-orange-600/30 transition-transform duration-200 hover:-translate-y-0.5 hover:from-orange-700 hover:to-orange-600 ${className}`.trim()

  const trigger = (
    <button className={triggerClass}>
      <DocumentArrowDownIcon className="w-4 h-4" />
      Export Report
    </button>
  )

  return <Dropdown trigger={trigger} items={exportOptions} align="right" />
}

export default ExportReport
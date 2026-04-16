import React, { useState } from 'react'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import Dropdown from '../../../common/Dropdown'
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils'
import toast from 'react-hot-toast'

const ExportReport = ({ data, type, dateRange }) => {
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

  const trigger = (
    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
      <DocumentArrowDownIcon className="w-4 h-4" />
      Export Report
    </button>
  )

  return <Dropdown trigger={trigger} items={exportOptions} align="right" />
}

export default ExportReport
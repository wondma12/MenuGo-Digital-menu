import React, { useState, useRef } from 'react'
import { DocumentArrowUpIcon, DocumentArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Modal from '../../../common/Modal'
import Alert from '../../../common/Alert'
import { importMenuItems, exportMenuItems, downloadTemplate } from '../../../services/menuService'
import toast from 'react-hot-toast'

const MenuImportExport = ({ isOpen, onClose, onSuccess }) => {
  const [importFile, setImportFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [importPreview, setImportPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.csv')) {
        toast.error('Please upload JSON or CSV file')
        return
      }
      setImportFile(file)
      // Preview logic would go here
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      const result = await importMenuItems(formData)
      toast.success(`Successfully imported ${result.imported} items`)
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Failed to import menu items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format) => {
    setIsLoading(true)
    try {
      const blob = await exportMenuItems(format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `menu_export_${new Date().toISOString()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export completed successfully')
    } catch (error) {
      toast.error('Failed to export menu items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'menu_import_template.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Template downloaded')
    } catch (error) {
      toast.error('Failed to download template')
    }
  }

  const clearFile = () => {
    setImportFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import / Export Menu" size="lg">
      <div className="space-y-6">
        <Alert
          type="info"
          message="Import your menu items from CSV or JSON files. Make sure to follow the template format."
        />

        {/* Import Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Menu Items</h3>
          
          <div className="mb-4">
            <button
              onClick={handleDownloadTemplate}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Download Template CSV
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <DocumentArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
              <span className="text-xs text-gray-400 mt-1">JSON or CSV files only</span>
            </label>
          </div>

          {importFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-3">
              <div className="flex items-center gap-2">
                <DocumentArrowUpIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{importFile.name}</span>
              </div>
              <button onClick={clearFile} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {importFile && (
            <div className="mt-4">
              <Button
                onClick={handleImport}
                isLoading={isLoading}
                fullWidth
              >
                Import {importFile.name}
              </Button>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Menu Items</h3>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport('json')}
              isLoading={isLoading}
              icon={DocumentArrowDownIcon}
            >
              Export as JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              isLoading={isLoading}
              icon={DocumentArrowDownIcon}
            >
              Export as CSV
            </Button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for Import</h4>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Use the template CSV to ensure correct format</li>
            <li>Category names must match existing categories</li>
            <li>Price must be a valid number</li>
            <li>Image URLs should be publicly accessible</li>
            <li>Maximum 500 items per import</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default MenuImportExport
import React, { useCallback, useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

const FileUpload = ({ onFileSelect, accept = 'image/*', maxSize = 5 * 1024 * 1024, label, error, multiple = false, className = '' }) => {
  const [files, setFiles] = useState([])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        if (file.errors[0].code === 'file-too-large') {
          return `${file.file.name} is too large. Max size: ${maxSize / 1024 / 1024}MB`
        }
        if (file.errors[0].code === 'file-invalid-type') {
          return `${file.file.name} has invalid file type`
        }
        return file.errors[0].message
      })
      console.error(errors)
      return
    }

    // Update files using functional state update to avoid stale closures
    setFiles(prev => {
      const newFiles = multiple ? [...prev, ...acceptedFiles] : acceptedFiles
      onFileSelect?.(multiple ? newFiles : newFiles[0])
      return newFiles
    })
  }, [multiple, onFileSelect, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  })

  const acceptLabel = useMemo(() => {
    try {
      if (!accept) return 'any'
      if (typeof accept === 'string') return accept
      if (Array.isArray(accept)) return accept.join(', ')
      return Object.values(accept).flat().join(', ')
    } catch (e) {
      return 'any'
    }
  }, [accept])

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFileSelect?.(multiple ? newFiles : newFiles[0])
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Supported files: {acceptLabel} up to {maxSize / 1024 / 1024}MB</p>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => {
                const isImage = file.type && file.type.startsWith('image')
                const previewUrl = isImage ? URL.createObjectURL(file) : null
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {isImage ? (
                        <img src={previewUrl} alt={file.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <DocumentIcon className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}
    </div>
  )
}

export default FileUpload
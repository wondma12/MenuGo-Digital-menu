import {useCallback, useState, useMemo, useEffect} from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

const FileUpload = ({ onFileSelect, accept = 'image/*', maxSize = 5 * 1024 * 1024, label, error, multiple = false, className = '', clearFilesKey }) => {
  const [files, setFiles] = useState([])

  useEffect(() => {
    if (clearFilesKey !== undefined) {
      setFiles([])
    }
  }, [clearFilesKey])

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
  }

  // Notify parent when `files` changes, avoid updating parent state during render
  useEffect(() => {
    try {
      onFileSelect?.(multiple ? files : files[0] || null)
    } catch (e) {
      // swallow errors from parent handlers to avoid breaking upload UI
      // parent should handle its own errors
      console.error('FileUpload onFileSelect error', e)
    }
  }, [files, multiple, onFileSelect])

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed border-slate-200 rounded-none p-6 text-center cursor-pointer bg-white
          transition-colors duration-200
          ${isDragActive ? 'border-orange-400 bg-orange-50' : 'hover:border-orange-300'}
          ${error ? 'border-rose-500' : ''}
        `}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto mb-3 h-12 w-12 text-orange-400" />
        <p className="text-sm text-slate-600">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="mt-1 text-xs text-slate-400">Supported files: {acceptLabel} up to {maxSize / 1024 / 1024}MB</p>
      </div>
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
      
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
                    className="flex items-center justify-between bg-slate-50 p-2 rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      {isImage ? (
                        <img src={previewUrl} alt={file.name} className="h-10 w-10 rounded-none object-cover" />
                      ) : (
                        <DocumentIcon className="h-5 w-5 text-slate-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="rounded-none p-1 hover:bg-slate-200"
                    >
                      <XMarkIcon className="h-4 w-4 text-slate-500" />
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
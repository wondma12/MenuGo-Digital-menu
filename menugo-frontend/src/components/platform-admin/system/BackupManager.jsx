import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CloudArrowDownIcon, TrashIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import { getBackups, createBackup, deleteBackup, downloadBackup } from '../../../services/systemService'
import toast from 'react-hot-toast'

const BackupManager = () => {
  const navigate = useNavigate()
  const { data: backups, isLoading, isError, error, refetch } = useQuery('backups', getBackups)

  const createMutation = useMutation(createBackup, {
    onSuccess: () => {
      refetch()
      toast.success('Backup created successfully')
    },
  })

  const deleteMutation = useMutation(deleteBackup, {
    onSuccess: () => {
      refetch()
      toast.success('Backup deleted')
    },
  })

  const handleDownload = async (backup) => {
    try {
      await downloadBackup(backup.id)
      toast.success('Download started')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const getSizeLabel = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  if (isLoading) return <Loading />

  if (isError) {
    const status = error?.response?.status
    if (status === 401) {
      navigate('/login')
      return null
    }
    if (status === 403) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Backup Manager</h1>
          <p className="text-red-500 mt-4">You do not have permission to manage backups.</p>
        </div>
      )
    }
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Backup Manager</h1>
        <p className="text-gray-600 mt-2">Failed to load backups: {error?.message || 'Unknown error'}</p>
        <div className="mt-4">
          <button onClick={() => refetch()} className="px-4 py-2 bg-orange-600 text-white rounded">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup Manager</h1>
          <p className="text-gray-500 mt-1">Manage database backups</p>
        </div>
        <Button onClick={() => createMutation.mutate()} icon={PlusIcon} isLoading={createMutation.isLoading}>
          Create Backup
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {backups?.map((backup, index) => (
              <motion.tr
                key={backup.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{backup.name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{getSizeLabel(backup.size)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(backup.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${backup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {backup.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleDownload(backup)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <CloudArrowDownIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(backup.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {backups?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ArrowPathIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No backups found</h3>
          <p className="text-gray-500 mt-1">Create your first backup to secure your data</p>
        </div>
      )}
    </div>
  )
}

export default BackupManager
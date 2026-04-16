// src/services/systemService.js
import api from './api'

export const getSystemSettings = async () => {
  const response = await api.get('/system/settings')
  return response?.data?.data || response?.data || {}
}

export const updateSystemSettings = async (data) => {
  const response = await api.put('/system/settings', data)
  return response?.data?.data || response?.data || {}
}

export const updateEmailSettings = async (data) => {
  const response = await api.put('/system/settings/email', data)
  return response?.data?.data || response?.data || {}
}

export const testEmailSettings = async (data) => {
  const response = await api.post('/system/settings/email/test', data)
  return response?.data?.data || response?.data || {}
}

export const getSystemHealth = async () => {
  const response = await api.get('/system/health')
  return response?.data?.data || response?.data || {}
}

export const getAuditLogs = async (params) => {
  const response = await api.get('/system/audit-logs', { params })
  return response?.data?.data || response?.data || { logs: [], total: 0, page: 1, totalPages: 0 }
}

export const getBackups = async () => {
  const response = await api.get('/system/backups')
  return response?.data?.data || response?.data || []
}

export const createBackup = async () => {
  const response = await api.post('/system/backups')
  return response?.data?.data || response?.data || {}
}

export const deleteBackup = async (backupId) => {
  const response = await api.delete(`/system/backups/${backupId}`)
  return response?.data?.data || response?.data || {}
}

export const downloadBackup = async (backupId) => {
  const response = await api.get(`/system/backups/${backupId}/download`, {
    responseType: 'blob',
  })
  return response.data
}
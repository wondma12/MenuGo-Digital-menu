// src/services/systemService.js
import api from './api'
import { useAuthStore } from '../store/authStore'

const hasAuthToken = () => {
  try {
    return Boolean(useAuthStore.getState().token || (typeof window !== 'undefined' && window.sessionStorage.getItem('token')))
  } catch (e) {
    return false
  }
}

export const getSystemSettings = async () => {
  if (!hasAuthToken()) return {}
  const response = await api.get('/system/settings')
  return response?.data?.data || response?.data || {}
}

export const getPublicPlatformBranding = async () => {
  const response = await api.get('/system/public-branding')
  return response?.data?.data || response?.data || {}
}

export const updateSystemSettings = async (data) => {
  if (!hasAuthToken()) throw new Error('auth_required')
  const response = await api.put('/system/settings', data)
  return response?.data?.data || response?.data || {}
}

export const updateEmailSettings = async (data) => {
  if (!hasAuthToken()) throw new Error('auth_required')
  const response = await api.put('/system/settings/email', data)
  return response?.data?.data || response?.data || {}
}

export const testEmailSettings = async (data) => {
  if (!hasAuthToken()) throw new Error('auth_required')
  const response = await api.post('/system/settings/email/test', data)
  return response?.data?.data || response?.data || {}
}

export const getSystemHealth = async () => {
  if (!hasAuthToken()) return {}
  const response = await api.get('/system/health')
  return response?.data?.data || response?.data || {}
}

export const getAuditLogs = async (params) => {
  if (!hasAuthToken()) return { logs: [], total: 0, page: 1, totalPages: 0 }
  const response = await api.get('/system/audit-logs', { params })
  return response?.data?.data || response?.data || { logs: [], total: 0, page: 1, totalPages: 0 }
}

export const getBackups = async () => {
  if (!hasAuthToken()) return []
  const response = await api.get('/system/backups')
  return response?.data?.data || response?.data || []
}

export const createBackup = async () => {
  if (!hasAuthToken()) throw new Error('auth_required')
  const response = await api.post('/system/backups')
  return response?.data?.data || response?.data || {}
}

export const deleteBackup = async (backupId) => {
  if (!hasAuthToken()) throw new Error('auth_required')
  const response = await api.delete(`/system/backups/${backupId}`)
  return response?.data?.data || response?.data || {}
}

export const downloadBackup = async (backupId) => {
  if (!hasAuthToken()) throw new Error('auth_required')
  const response = await api.get(`/system/backups/${backupId}/download`, {
    responseType: 'blob',
  })
  return response.data
}
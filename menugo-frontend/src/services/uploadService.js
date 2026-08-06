import api from './api'

export const uploadFile = async (file, folder) => {
  const formData = new FormData()
  formData.append('file', file)
  if (folder) formData.append('folder', folder)

  const response = await api.post('/upload', formData, {
    // Remove any default JSON Content-Type so the browser sets the correct multipart boundary.
    transformRequest: [(data, headers) => {
      try { delete headers['Content-Type'] } catch (e) { if (import.meta.env.DEV) console.warn('remove Content-Type header failed:', e && e.message) }
      return data
    }]
  })
  // Backend wraps result in ApiResponse: { success, message, data }
  // Return the inner data payload when present for caller convenience.
  const payload = response.data?.data ?? response.data
  return {
    ...payload,
    source: 'backend',
  }
}

export const uploadMultipleFiles = async (files, folder) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  if (folder) formData.append('folder', folder)

  const response = await api.post('/upload/multiple', formData, {
    transformRequest: [(data, headers) => {
        try { delete headers['Content-Type'] } catch (e) { if (import.meta.env.DEV) console.warn('remove Content-Type header failed:', e && e.message) }
        return data
      }]
  })
  return response.data?.data ?? response.data
}

export const deleteFile = async (publicId) => {
  const response = await api.delete(`/upload/${publicId}`)
  return response.data
}
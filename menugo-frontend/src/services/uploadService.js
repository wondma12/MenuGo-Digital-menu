import api from './api'

export const uploadFile = async (file, folder) => {
  const formData = new FormData()
  formData.append('file', file)
  if (folder) formData.append('folder', folder)

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  // Backend wraps result in ApiResponse: { success, message, data }
  // Return the inner data payload when present for caller convenience.
  return response.data?.data ?? response.data
}

export const uploadMultipleFiles = async (files, folder) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  if (folder) formData.append('folder', folder)

  const response = await api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data?.data ?? response.data
}

export const deleteFile = async (publicId) => {
  const response = await api.delete(`/upload/${publicId}`)
  return response.data
}
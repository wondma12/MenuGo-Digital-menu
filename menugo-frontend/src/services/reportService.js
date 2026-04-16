import api from './api'

export const generateReport = async (type, params) => {
  const response = await api.get(`/reports/${type}`, { params, responseType: 'blob' })
  return response.data
}

export const getReportTemplates = async () => {
  const response = await api.get('/reports/templates')
  return response.data
}

export const scheduleReport = async (data) => {
  const response = await api.post('/reports/schedule', data)
  return response.data
}

export const getScheduledReports = async () => {
  const response = await api.get('/reports/scheduled')
  return response.data
}

export const cancelScheduledReport = async (id) => {
  const response = await api.delete(`/reports/scheduled/${id}`)
  return response.data
}
import api from './api'

const transformStaff = (raw) => {
  if (!raw) return raw
  const assigned = raw.assigned_user || raw.assignedUser || {}
  return {
    id: raw.id ?? raw.staff_id ?? assigned.id ?? raw.user_id ?? null,
    staffPk: raw.id ?? raw.staff_id ?? null,
    name: assigned.full_name ?? assigned.fullName ?? raw.full_name ?? raw.name ?? '',
    avatar: assigned.avatar_url ?? assigned.avatarUrl ?? raw.avatar ?? null,
    employeeId: raw.user_id ?? raw.employee_id ?? raw.employeeId ?? assigned.id ?? raw.id ?? null,
    email: assigned.email ?? raw.email ?? null,
    phone: assigned.phone ?? raw.phone ?? null,
    role: raw.role ?? null,
    isActive: raw.is_active ?? raw.isActive ?? true,
    hourlyRate: raw.hourly_rate ?? raw.hourlyRate ?? null,
    hireDate: raw.created_at ?? raw.createdAt ?? null,
    shiftStart: raw.shift_start ?? raw.shiftStart ?? '',
    shiftEnd: raw.shift_end ?? raw.shiftEnd ?? '',
    permissions: raw.permissions ?? {},
    raw,
  }
}

export const getStaff = async (params) => {
  const response = await api.get('/staff', { params })
  const raw = response.data?.data || response.data
  const list = Array.isArray(raw) ? raw : (raw.staff || [])
  return list.map(transformStaff)
}

export const createStaff = async (data) => {
  const response = await api.post('/staff', data)
  return response.data.data
}

export const updateStaff = async ({ id, data }) => {
  const response = await api.put(`/staff/${id}`, data)
  return response.data.data
}

export const deleteStaff = async (id) => {
  const response = await api.delete(`/staff/${id}`)
  return response.data.data
}

const _extractId = (objOrId) => {
  if (!objOrId) return null
  if (typeof objOrId === 'object') {
    return objOrId.id ?? objOrId._id ?? objOrId.staffId ?? objOrId.staff_id ?? objOrId.employeeId ?? objOrId.employee_id ?? objOrId.userId ?? objOrId.user_id ?? null
  }
  return objOrId
}

export const updateStaffStatus = async (idOrObj, isActiveParam) => {
  const id = _extractId(idOrObj)
  const isActive = (typeof idOrObj === 'object' && idOrObj !== null && Object.prototype.hasOwnProperty.call(idOrObj, 'isActive')) ? idOrObj.isActive : isActiveParam
  const response = await api.patch(`/staff/${id}/status`, { isActive })
  return response.data.data
}

export const getStaffSchedule = async (params) => {
  // Accept either a Date, a date string, or a params object
  let query = {}
  if (!params) query = {}
  else if (params instanceof Date) query.date = params.toISOString().split('T')[0]
  else if (typeof params === 'string') query.date = params
  else if (params?.date) query = params
  else query = params

  const response = await api.get('/staff/schedule', { params: query })
  return response.data.data
}

export const updateStaffSchedule = async (data) => {
  // Normalize payload: ensure staffId is a primitive PK and date is ISO date string
  const payload = { ...data }
  if (payload.staffId && typeof payload.staffId === 'object') {
    payload.staffId = payload.staffId.raw?.id ?? payload.staffId.staffId ?? payload.staffId.id ?? payload.staffId.employeeId ?? payload.staffId.employee_id ?? payload.staffId.userId ?? payload.staffId.user_id ?? null
  }
  if (payload.date instanceof Date) payload.date = payload.date.toISOString().split('T')[0]
  const response = await api.put('/staff/schedule', payload)
  return response.data.data
}

export const getRoles = async () => {
  const response = await api.get('/staff/roles')
  return response.data.data
}

export const updateRolePermissions = async ({ roleId, permissions }) => {
  const response = await api.put(`/staff/roles/${roleId}`, { permissions })
  return response.data.data
}

export const updateStaffPermissions = async ({ staffId, permissions }) => {
  const response = await api.put(`/staff/${staffId}/permissions`, { permissions })
  return response.data.data
}

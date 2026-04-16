import api from './api'

export const getReservations = async (restaurantId, params) => {
  const response = await api.get(`/restaurants/${restaurantId}/reservations`, { params })
  return response.data
}

export const getTodayReservations = async () => {
  // Use waiter-scoped endpoint for today's reservations (added on backend)
  const response = await api.get('/waiters/reservations/today')
  // API responses use { success, message, data } wrapper — return inner data when present
  return response.data?.data ?? response.data
}

export const createReservation = async (data) => {
  const response = await api.post('/reservations', data)
  return response.data
}

export const updateReservation = async (id, data) => {
  const response = await api.put(`/reservations/${id}`, data)
  return response.data
}

export const deleteReservation = async (id) => {
  const response = await api.delete(`/reservations/${id}`)
  return response.data
}

export const updateReservationStatus = async (id, status) => {
  const response = await api.patch(`/reservations/${id}/status`, { status })
  return response.data
}

export const seatReservation = async (reservationId, tableId, notes) => {
  const response = await api.post(`/reservations/${reservationId}/seat`, { tableId, notes })
  return response.data
}

export const getAvailableTables = async (partySize, date, time) => {
  const response = await api.get('/tables/available', { params: { partySize, date, time } })
  return response.data
}
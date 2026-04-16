import api from './api'

export const getReviews = async (restaurantId, params) => {
  const response = await api.get(`/restaurants/${restaurantId}/reviews`, { params })
  return response.data
}

export const getReview = async (id) => {
  const response = await api.get(`/reviews/${id}`)
  return response.data
}

export const createReview = async (data) => {
  const response = await api.post('/reviews', data)
  return response.data
}

export const updateReview = async (id, data) => {
  const response = await api.put(`/reviews/${id}`, data)
  return response.data
}

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`)
  return response.data
}

export const updateReviewStatus = async (id, status) => {
  const response = await api.patch(`/reviews/${id}/status`, { status })
  return response.data
}

export const respondToReview = async (reviewId, response) => {
  const responseData = await api.post(`/reviews/${reviewId}/respond`, { response })
  return responseData.data
}

export const getReviewAnalytics = async (restaurantId) => {
  const response = await api.get(`/restaurants/${restaurantId}/reviews/analytics`)
  return response.data
}
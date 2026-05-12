import api from './api'

const mapReview = (r) => ({
  id: r.id,
  restaurantId: r.restaurant_id || r.restaurantId,
  userId: r.user_id || r.userId,
  orderId: r.order_id || r.orderId,
  rating: r.rating,
  title: r.title,
  comment: r.comment || r.message || r.text,
  images: r.images || [],
  isVerifiedPurchase: r.is_verified_purchase || r.isVerifiedPurchase || false,
  status: r.status,
  // Prefer explicitly submitted customer fields when present to avoid showing
  // unrelated `user` objects (e.g., owner/restaurant) that might be attached.
  customerName: r.customer_name || r.user?.full_name || (r.is_anonymous ? 'Anonymous' : null),
  customerEmail: r.customer_email || r.user?.email || null,
  createdAt: r.created_at || r.createdAt,
  updatedAt: r.updated_at || r.updatedAt,
  replyFromRestaurant: r.reply_from_restaurant || r.replyFromRestaurant,
  replyAt: r.reply_at || r.replyAt,
})

export const getReviews = async (restaurantId, params) => {
  const response = await api.get(`/restaurants/${restaurantId}/reviews`, { params })
  const payload = response.data?.data || response.data
  // payload may be an array (legacy) or an object { reviews, total, ... }
  if (Array.isArray(payload)) {
    return payload.map(mapReview)
  }

  const reviews = (payload.reviews || payload.data || [])
  return {
    ...payload,
    reviews: reviews.map(mapReview),
  }
}

export const getReview = async (id) => {
  const response = await api.get(`/reviews/${id}`)
  return response.data
}

export const createReview = async (restaurantId, data) => {
  const response = await api.post(`/reviews/restaurant/${restaurantId}`, data)
  const review = response.data?.data || response.data
  if (!review) return review
  return mapReview(review)
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
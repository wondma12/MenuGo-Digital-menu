import React from 'react'
import { useQuery } from 'react-query'
import { StarIcon } from '@heroicons/react/24/outline'
import { getReviews } from '../../../services/reviewService'

const ReviewsSummary = ({ restaurantId }) => {
  const { data, isLoading } = useQuery(['restaurantReviews', restaurantId], () => getReviews(restaurantId, { page: 1, limit: 3 }), { enabled: !!restaurantId })

  const payload = data?.data || data
  let reviews = []
  if (Array.isArray(payload)) reviews = payload
  else if (payload?.reviews) reviews = payload.reviews
  else reviews = payload?.data || []

  const top = reviews[0] || null

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <StarIcon className="w-4 h-4 text-yellow-400" />
        Reviews
      </h4>
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-sm text-gray-500">No reviews yet</div>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="text-gray-800 font-medium">{top.rating} ★</div>
          <div className="text-gray-600 line-clamp-3">{top.comment || top.message || top.text || '—'}</div>
          {reviews.length > 1 && (
            <div className="text-xs text-gray-500">{reviews.length} recent reviews</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsSummary

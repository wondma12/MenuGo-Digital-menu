import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import ReviewList from './ReviewList'
import ReviewFilters from './ReviewFilters'
import RatingStars from './RatingStars'
import Loading from '../../../common/Loading'
import Tabs from '../../../common/Tabs'
import { getReviews } from '../../../services/reviewService'
import { useAuthStore } from '../../../store/authStore'

const ReviewManagement = () => {
  const [filters, setFilters] = useState({
    rating: 'all',
    status: 'all',
    search: '',
    dateRange: null,
  })
  // Default to showing all reviews so the admin list includes every feedback by default.
  const [showAll, setShowAll] = useState(true)

  const { user } = useAuthStore()
  const restaurantId = user?.restaurant_id || user?.restaurant?.id

  // When `showAll` is true, request a large `limit` so the backend returns all reviews.
  const effectiveFilters = React.useMemo(() => ({
    ...filters,
    page: 1,
    limit: showAll ? 10000 : (filters.page || 20),
  }), [filters, showAll])

  const { data, isLoading, refetch } = useQuery(['reviews', restaurantId, effectiveFilters, showAll], () => getReviews(restaurantId, effectiveFilters), { enabled: !!restaurantId })

  if (isLoading) return <Loading />

  // Backend returns an object payload: { reviews: [...], total, average_rating, rating_distribution, status_counts }
  // Accept either an array (legacy) or the payload object.
  const reviews = Array.isArray(data) ? data : (data?.reviews || [])

  // Use backend-provided aggregates when available (total reviews, average rating, distribution, status counts)
  const totalReviews = data && typeof data.total !== 'undefined' ? data.total : (Array.isArray(reviews) ? reviews.length : 0)

  // Prefer a server-provided average only when it's a finite, positive number.
  // Otherwise compute a sensible fallback average from the returned `reviews` array.
  const serverAvgRaw = data && data.average_rating != null ? Number(data.average_rating) : null
  const computedAvg = (Array.isArray(reviews) && reviews.length) ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) : 0
  const averageRating = (Number.isFinite(serverAvgRaw) && serverAvgRaw > 0)
    ? serverAvgRaw.toFixed(1)
    : (computedAvg > 0 ? computedAvg.toFixed(1) : '0')

  // Prefer server-sent rating distribution when present, otherwise derive from current page (fallback)
  const ratingDistribution = Array.isArray(data?.rating_distribution) && data.rating_distribution.length > 0
    ? [5,4,3,2,1].map(rating => ({
        rating,
        count: (data.rating_distribution.find(d => Number(d.rating) === rating)?.count) || 0,
      }))
    : [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: Array.isArray(reviews) ? (reviews.filter(r => Math.floor(r.rating) === rating).length || 0) : 0,
      }))

  const pendingCount = data?.status_counts?.pending || 0
  const approvedCount = data?.status_counts?.approved || 0

  const tabs = [
    { label: 'All Reviews', count: totalReviews, content: renderReviewsContent(reviews || []), status: 'all' },
    { label: 'Pending', count: pendingCount, content: renderReviewsContent(reviews || []), status: 'pending' },
    { label: 'Approved', count: approvedCount, content: renderReviewsContent(reviews || []), status: 'approved' },
  ]

  function renderReviewsContent(reviewsList) {
    return (
      <div className="space-y-6  bg-white p-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Customer Reviews</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and respond to customer feedback</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 py-2 px-3">List view</div>
            <div className="flex items-center ml-3">
              <label className="text-sm text-slate-600 mr-2">Show all</label>
              <input
                type="checkbox"
                checked={showAll}
                onChange={e => setShowAll(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="rounded-3xl border border-orange-100 bg-white/95 p-6 mb-6 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-slate-900">{averageRating}</div>
              <RatingStars rating={parseFloat(averageRating)} size="lg" />
              <p className="text-sm text-slate-500 mt-1">Based on {totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-12">{rating} stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${totalReviews ? (count / totalReviews) * 100 : 0}%` }}
                      />
                  </div>
                  <span className="text-sm w-12">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ReviewFilters filters={filters} onFiltersChange={setFilters} />

        {reviewsList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
            <p className="text-gray-500 mt-1">Reviews will appear here once customers leave feedback</p>
          </div>
        ) : (
          <ReviewList reviews={reviewsList} onRefresh={refetch} />
        )}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden p-6">
      <div className="relative mx-auto max-w-7xl">
        <Tabs tabs={tabs} onChange={(index, tab) => setFilters(prev => ({ ...prev, status: tab.status }))} />
      </div>
    </div>
  )
}

export default ReviewManagement
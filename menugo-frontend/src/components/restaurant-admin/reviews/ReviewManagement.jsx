import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import ReviewList from './ReviewList'
import ReviewCard from './ReviewCard'
import ReviewFilters from './ReviewFilters'
import RatingStars from './RatingStars'
import Loading from '../../../common/Loading'
import Tabs from '../../../common/Tabs'
import { getReviews } from '../../../services/reviewService'

const ReviewManagement = () => {
  const [viewMode, setViewMode] = useState('list')
  const [filters, setFilters] = useState({
    rating: 'all',
    status: 'all',
    search: '',
    dateRange: null,
  })

  const { data: reviews, isLoading, refetch } = useQuery(['reviews', filters], () => getReviews(filters))

  if (isLoading) return <Loading />

  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews?.filter(r => Math.floor(r.rating) === rating).length || 0,
  }))

  const pendingReviews = reviews?.filter(r => r.status === 'pending') || []
  const approvedReviews = reviews?.filter(r => r.status === 'approved') || []

  const tabs = [
    { label: 'All Reviews', count: reviews?.length, content: renderReviewsContent(reviews || []) },
    { label: 'Pending', count: pendingReviews.length, content: renderReviewsContent(pendingReviews) },
    { label: 'Approved', count: approvedReviews.length, content: renderReviewsContent(approvedReviews) },
  ]

  function renderReviewsContent(reviewsList) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
            <p className="text-gray-500 mt-1">Manage and respond to customer feedback</p>
          </div>
          <div className="flex gap-3">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold">{averageRating}</div>
              <RatingStars rating={parseFloat(averageRating)} size="lg" />
              <p className="text-primary-100 mt-1">Based on {reviews?.length} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-12">{rating} stars</span>
                  <div className="flex-1 h-2 bg-primary-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${reviews?.length ? (count / reviews.length) * 100 : 0}%` }}
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
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsList.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReviewCard review={review} onRefresh={refetch} />
              </motion.div>
            ))}
          </div>
        ) : (
          <ReviewList reviews={reviewsList} onRefresh={refetch} />
        )}
      </>
    )
  }

  return (
    <div className="p-6">
      <Tabs tabs={tabs} />
    </div>
  )
}

export default ReviewManagement
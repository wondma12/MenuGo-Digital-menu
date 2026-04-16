import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import RatingStars from './RatingStars'
import ReviewResponse from './ReviewResponse'
import Badge from '../../../common/Badge'
import { updateReviewStatus } from '../../../services/reviewService'
import toast from 'react-hot-toast'

const ReviewList = ({ reviews, onRefresh }) => {
  const [selectedReview, setSelectedReview] = useState(null)

  const handleStatusUpdate = async (reviewId, status) => {
    try {
      await updateReviewStatus(reviewId, status)
      toast.success(`Review ${status}`)
      onRefresh()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      reported: 'default',
    }
    return colors[status] || 'default'
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review, index) => (
                <motion.tr
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{review.customerName || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{review.orderId ? `Order #${review.orderId}` : 'Guest'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RatingStars rating={review.rating} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 font-medium">{review.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{review.comment}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusColor(review.status)} size="sm">{review.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReview && (
        <ReviewResponse
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

export default ReviewList
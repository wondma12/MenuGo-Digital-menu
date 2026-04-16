import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import RatingStars from './RatingStars'
import ReviewResponse from './ReviewResponse'
import Badge from '../../../common/Badge'
import Avatar from '../../../common/Avatar'
import { updateReviewStatus } from '../../../services/reviewService'
import toast from 'react-hot-toast'

const ReviewCard = ({ review, onRefresh }) => {
  const [showResponse, setShowResponse] = useState(false)

  const handleStatusUpdate = async (status) => {
    try {
      await updateReviewStatus(review.id, status)
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
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Avatar name={review.customerName || 'Anonymous'} size="md" />
              <div>
                <h3 className="font-semibold text-gray-900">{review.customerName || 'Anonymous Customer'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Badge variant={getStatusColor(review.status)} size="sm">{review.status}</Badge>
          </div>

          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
          <p className="text-gray-600 text-sm mb-4">{review.comment}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-4">
              {review.images.slice(0, 3).map((img, idx) => (
                <img key={idx} src={img} alt={`Review ${idx + 1}`} className="w-16 h-16 rounded-lg object-cover" />
              ))}
            </div>
          )}

          {review.replyFromRestaurant && (
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 mb-1">
                <ChatBubbleLeftIcon className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-medium text-primary-600">Your Response</span>
              </div>
              <p className="text-sm text-gray-600">{review.replyFromRestaurant}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(review.replyAt).toLocaleString()}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
            {review.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                >
                  <CheckCircleIcon className="w-3 h-3" />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-1"
                >
                  <XCircleIcon className="w-3 h-3" />
                  Reject
                </button>
              </>
            )}
            <button
              onClick={() => setShowResponse(true)}
              className="flex-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-1"
            >
              <ChatBubbleLeftIcon className="w-3 h-3" />
              {review.replyFromRestaurant ? 'Edit Response' : 'Respond'}
            </button>
          </div>
        </div>
      </motion.div>

      {showResponse && (
        <ReviewResponse
          review={review}
          onClose={() => setShowResponse(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

export default ReviewCard
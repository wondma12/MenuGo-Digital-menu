import {useState} from 'react'
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
        className="bg-white/95 rounded-3xl border border-orange-100 shadow-[0_18px_40px_rgba(15,23,42,0.08)] overflow-hidden hover:shadow-md transition-all"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Avatar name={review.customerName || 'Anonymous'} size="md" />
              <div>
                <h3 className="font-semibold text-slate-900">{review.customerName || 'Anonymous Customer'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  {review.customerEmail && (
                    <div className="text-xs text-slate-500 ml-3">{review.customerEmail}</div>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={getStatusColor(review.status)} size="sm">{review.status}</Badge>
          </div>

          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
          <h4 className="font-medium text-slate-900 mb-2">{review.title}</h4>
          <p className="text-slate-600 text-sm mb-4">{review.comment}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-4">
              {review.images.slice(0, 3).map((img, idx) => (
                <img key={idx} src={img} alt={`Review ${idx + 1}`} className="w-16 h-16 rounded-xl object-cover" />
              ))}
            </div>
          )}

          {review.replyFromRestaurant && (
            <div className="bg-slate-50 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 mb-1">
                <ChatBubbleLeftIcon className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">Your Response</span>
              </div>
              <p className="text-sm text-slate-600">{review.replyFromRestaurant}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(review.replyAt).toLocaleString()}</p>
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
              className="flex-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-1"
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
import {useState} from 'react'
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
      <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reviews.map((review, index) => (
                <motion.tr
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{review.customerName || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">{review.orderId ? `Order #${review.orderId}` : 'Guest'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RatingStars rating={review.rating} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-slate-900 font-medium">{review.title}</p>
                      <p className="text-sm text-slate-500 line-clamp-2">{review.comment}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusColor(review.status)} size="sm">{review.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-1 text-slate-700 hover:bg-slate-50 rounded"
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

        <div className="space-y-3 p-3 sm:p-4 md:hidden">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{review.customerName || 'Anonymous'}</p>
                  <p className="text-xs text-slate-500">{review.orderId ? `Order #${review.orderId}` : 'Guest'}</p>
                </div>
                <Badge variant={getStatusColor(review.status)} size="sm">{review.status}</Badge>
              </div>

              <div className="mt-3">
                <RatingStars rating={review.rating} size="sm" />
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-slate-900">{review.title}</p>
                <p className="mt-1 text-sm text-slate-500">{review.comment}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="rounded p-1 text-slate-700 hover:bg-slate-50"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(review.id, 'approved')}
                        className="rounded p-1 text-green-600 hover:bg-green-50"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(review.id, 'rejected')}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OrderStatus from './OrderStatus'
import EstimatedTime from './EstimatedTime'
import FeedbackModal from '../feedback/FeedbackModal'

const OrderCard = ({ order, displayNumber }) => {
  const navigate = useNavigate()
  const [showFeedback, setShowFeedback] = useState(false)
  const [hasReview, setHasReview] = useState(typeof order?.hasReview !== 'undefined' ? order.hasReview : null)

  useEffect(() => {
    // If parent didn't include hasReview, fetch order details to determine
    if (hasReview === null) {
      import('../../../services/orderService').then(({ getOrderDetails }) => {
        getOrderDetails(order.id).then(o => {
          setHasReview(!!o.hasReview)
        }).catch(() => setHasReview(false))
      }).catch(() => setHasReview(false))
    }
  }, [order.id, hasReview])

  const canLeaveFeedback = order?.status === 'completed' && !hasReview

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-gray-900">Order #{displayNumber ?? order.orderNumber}</p>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <OrderStatus status={order.status} />
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600">
          {order.items?.slice(0, 2).map(i => i.name).join(', ')}
          {order.items?.length > 2 && ` +${order.items.length - 2} more`}
        </p>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <EstimatedTime status={order.status} estimatedTime={order.estimatedPreparationTime} />
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary-600">${order.totalAmount}</span>
          {canLeaveFeedback && (
            <button
              onClick={() => setShowFeedback(true)}
              className="text-sm bg-primary-600 text-black px-3 py-1 rounded-md"
            >
              Leave Feedback
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <button onClick={() => navigate(`/menu/${order.restaurantId}/order/${order.id}`)} className="text-sm text-gray-500 underline">View details</button>
      </div>

      <FeedbackModal
        show={showFeedback}
        onClose={() => setShowFeedback(false)}
        order={order}
        onSubmitted={() => {
          // mark this order as reviewed so the button is hidden after submission
          setHasReview(true)
        }}
      />
    </div>
  )
}

export default OrderCard

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import OrderTracker from './OrderTracker'
import Button from '../../common/Button'
import Loading from '../../common/Loading'
import { getOrderDetails } from '../../../services/orderService'

const OrderConfirmation = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const { data: order, isLoading } = useQuery(['order', orderId], () => getOrderDetails(orderId), {
    refetchInterval: 5000
  })

  if (isLoading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-500 mt-1">Your order has been placed successfully</p>
          <p className="text-sm text-gray-400 mt-1">Order #{order?.orderNumber}</p>
        </div>

        <OrderTracker order={order} />

        <div className="bg-white rounded-xl p-4 space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">Table Number</span>
            <span className="font-medium text-gray-900">{order?.tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-bold text-primary-600">${order?.totalAmount}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/menu/${order?.restaurantId}`)}>
            Browse Menu
          </Button>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
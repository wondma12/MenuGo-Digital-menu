
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import OrderCard from './OrderCard'
import Loading from '../../common/Loading'
import { getOrderHistory } from '../../../services/orderService'

const OrderHistory = () => {
  const { data: orders, isLoading } = useQuery('orderHistory', getOrderHistory)

  if (isLoading) return <Loading />

  const activeOrders = orders?.filter(o => !['completed', 'cancelled'].includes(o.status)) || []
  const completedOrders = orders?.filter(o => ['completed', 'cancelled'].includes(o.status)) || []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>

        {activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Orders</h2>
            <div className="space-y-4">
              {activeOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <OrderCard order={order} displayNumber={idx + 1} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Orders</h2>
            <div className="space-y-4">
              {completedOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <OrderCard order={order} displayNumber={idx + 1} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {orders?.length === 0 && (
          <div className="text-center py-12">
            <img src="/assets/empty-states/no-orders.svg" alt="No orders" className="w-48 h-48 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory
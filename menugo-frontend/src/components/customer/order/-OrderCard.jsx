
import { useNavigate } from 'react-router-dom'
import OrderStatus from './OrderStatus'
import EstimatedTime from './EstimatedTime'

const OrderCard = ({ order, displayNumber }) => {
  const navigate = useNavigate()

  return (
    <div 
      onClick={() => navigate(`/menu/${order.restaurantId}/order/${order.id}`)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
    >
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
        <span className="font-bold text-primary-600">${order.totalAmount}</span>
      </div>
    </div>
  )
}

export default OrderCard

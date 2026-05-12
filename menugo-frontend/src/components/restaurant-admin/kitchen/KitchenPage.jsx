import React from 'react'
import { useQuery } from 'react-query'
import Loading from '../../common/Loading'
import KitchenDisplay from '../orders/KitchenDisplay'
import { getOrders } from '../../../services/orderService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import { useAuthStore } from '../../../store/authStore'

const KitchenPage = () => {
  const { user } = useAuthStore()
  const { lastMessage } = useWebSocket()

  const { data, isLoading, refetch } = useQuery(
    ['kitchen-orders', user?.restaurant_id],
    () => getOrders(user?.restaurant_id, { status: 'all', limit: 100 }),
    { enabled: !!user?.restaurant_id }
  )

  React.useEffect(() => {
    if (!lastMessage) return
    const types = ['new_order', 'order_updated', 'order_ready', 'order_verified', 'kitchen_updated', 'preparation_started']
    if (types.includes(lastMessage.type)) {
      refetch()
    }
  }, [lastMessage, refetch])

  if (isLoading) return <Loading />

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kitchen</h1>
          <p className="text-sm text-gray-500">Real-time verified orders queue</p>
        </div>
      </div>

      <KitchenDisplay orders={data?.orders || []} onRefresh={refetch} />
    </div>
  )
}

export default KitchenPage

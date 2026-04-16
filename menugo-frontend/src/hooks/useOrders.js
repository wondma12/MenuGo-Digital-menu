import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  verifyOrder,
  rejectOrder,
  getOrderStats,
} from '../services/orderService'
import toast from 'react-hot-toast'

export const useOrders = (restaurantId, filters) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    ['orders', restaurantId, filters],
    () => getOrders(restaurantId, filters),
    { enabled: !!restaurantId, refetchInterval: 10000 }
  )

  const statusMutation = useMutation(
    ({ id, status }) => updateOrderStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders', restaurantId])
        toast.success('Order status updated')
      },
      onError: () => toast.error('Failed to update status'),
    }
  )

  const verifyMutation = useMutation(
    ({ id, method, code }) => verifyOrder(id, method, code),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders', restaurantId])
        toast.success('Order verified')
      },
    }
  )

  const rejectMutation = useMutation(
    ({ id, reason, notes }) => rejectOrder(id, reason, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders', restaurantId])
        toast.success('Order rejected')
      },
    }
  )

  const cancelMutation = useMutation(cancelOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders', restaurantId])
      toast.success('Order cancelled')
    },
  })

  return {
    orders: data?.orders || [],
    stats: data?.stats,
    isLoading,
    updateStatus: statusMutation.mutate,
    verifyOrder: verifyMutation.mutate,
    rejectOrder: rejectMutation.mutate,
    cancelOrder: cancelMutation.mutate,
    refetch,
  }
}

export const useOrder = (id) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['order', id],
    () => getOrder(id),
    { enabled: !!id, refetchInterval: 5000 }
  )

  const updateStatus = useMutation(
    (status) => updateOrderStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id])
        queryClient.invalidateQueries(['orders'])
        toast.success('Order status updated')
      },
    }
  )

  return { order: data, isLoading, updateStatus: updateStatus.mutate }
}

export default useOrders
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getWaiters,
  getWaiter,
  createWaiter,
  updateWaiter,
  deleteWaiter,
  updateWaiterStatus,
  getWaiterSchedule,
  updateWaiterSchedule,
  getWaiterPerformance,
} from '../services/waiterService'
import toast from 'react-hot-toast'

export const useWaiters = (restaurantId, filters) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    ['waiters', restaurantId, filters],
    () => getWaiters(restaurantId, filters),
    { enabled: !!restaurantId }
  )

  const createMutation = useMutation(
    (data) => createWaiter(restaurantId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['waiters', restaurantId])
        toast.success('Waiter added successfully')
      },
      onError: () => toast.error('Failed to add waiter'),
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateWaiter(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['waiters', restaurantId])
        toast.success('Waiter updated successfully')
      },
      onError: () => toast.error('Failed to update waiter'),
    }
  )

  const deleteMutation = useMutation(deleteWaiter, {
    onSuccess: () => {
      queryClient.invalidateQueries(['waiters', restaurantId])
      toast.success('Waiter deleted successfully')
    },
    onError: () => toast.error('Failed to delete waiter'),
  })

  const statusMutation = useMutation(
    ({ id, isActive }) => updateWaiterStatus(id, isActive),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['waiters', restaurantId])
        toast.success('Waiter status updated')
      },
    }
  )

  return {
    waiters: data?.waiters || [],
    total: data?.total || 0,
    isLoading,
    createWaiter: createMutation.mutate,
    updateWaiter: updateMutation.mutate,
    deleteWaiter: deleteMutation.mutate,
    updateStatus: statusMutation.mutate,
    refetch,
  }
}

export const useWaiter = (id) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['waiter', id],
    () => getWaiter(id),
    { enabled: !!id }
  )

  const { data: schedule } = useQuery(
    ['waiter-schedule', id],
    () => getWaiterSchedule(id),
    { enabled: !!id }
  )

  const { data: performance } = useQuery(
    ['waiter-performance', id],
    () => getWaiterPerformance(id),
    { enabled: !!id }
  )

  const scheduleMutation = useMutation(
    (data) => updateWaiterSchedule(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['waiter-schedule', id])
        toast.success('Schedule updated')
      },
    }
  )

  return {
    waiter: data,
    schedule,
    performance,
    isLoading,
    updateSchedule: scheduleMutation.mutate,
  }
}

export default useWaiters
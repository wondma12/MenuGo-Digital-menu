import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getRestaurant,
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantStats,
  updateRestaurantSettings,
} from '../services/restaurantService'
import toast from 'react-hot-toast'

export const useRestaurant = (id) => {
  const queryClient = useQueryClient()

  const { data: restaurant, isLoading, error } = useQuery(
    ['restaurant', id],
    () => getRestaurant(id),
    { enabled: !!id }
  )

  const { data: stats } = useQuery(
    ['restaurant-stats', id],
    () => getRestaurantStats(id),
    { enabled: !!id }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateRestaurant(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant', id])
        toast.success('Restaurant updated successfully')
      },
      onError: () => toast.error('Failed to update restaurant'),
    }
  )

  const settingsMutation = useMutation(
    ({ id, settings }) => updateRestaurantSettings(id, settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant', id])
        toast.success('Settings updated successfully')
      },
      onError: () => toast.error('Failed to update settings'),
    }
  )

  return {
    restaurant,
    stats,
    isLoading,
    error,
    updateRestaurant: updateMutation.mutate,
    updateSettings: settingsMutation.mutate,
    isUpdating: updateMutation.isLoading,
  }
}

export const useRestaurants = (filters) => {
  const { data, isLoading, refetch } = useQuery(
    ['restaurants', filters],
    () => getRestaurants(filters)
  )

  const createMutation = useMutation(createRestaurant, {
    onSuccess: () => {
      refetch()
      toast.success('Restaurant created successfully')
    },
    onError: () => toast.error('Failed to create restaurant'),
  })

  const deleteMutation = useMutation(deleteRestaurant, {
    onSuccess: () => {
      refetch()
      toast.success('Restaurant deleted successfully')
    },
    onError: () => toast.error('Failed to delete restaurant'),
  })

  return {
    restaurants: data?.restaurants || [],
    total: data?.total || 0,
    isLoading,
    createRestaurant: createMutation.mutate,
    deleteRestaurant: deleteMutation.mutate,
    refetch,
    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  }
}

export default useRestaurant
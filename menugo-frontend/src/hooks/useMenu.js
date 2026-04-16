import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemAvailability,
  bulkUpdateMenuItems,
  bulkDeleteMenuItems,
  importMenuItems,
  exportMenuItems,
} from '../services/menuService'
import toast from 'react-hot-toast'

export const useMenu = (restaurantId, filters) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    ['menu', restaurantId, filters],
    () => getMenuItems(restaurantId, filters),
    { enabled: !!restaurantId }
  )

  const createMutation = useMutation(
    (data) => createMenuItem(restaurantId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['menu', restaurantId])
        toast.success('Menu item created successfully')
      },
      onError: () => toast.error('Failed to create menu item'),
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateMenuItem(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['menu', restaurantId])
        toast.success('Menu item updated successfully')
      },
      onError: () => toast.error('Failed to update menu item'),
    }
  )

  const deleteMutation = useMutation(deleteMenuItem, {
    onSuccess: () => {
      queryClient.invalidateQueries(['menu', restaurantId])
      toast.success('Menu item deleted successfully')
    },
    onError: () => toast.error('Failed to delete menu item'),
  })

  const availabilityMutation = useMutation(
    ({ id, isAvailable }) => updateMenuItemAvailability(id, isAvailable),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['menu', restaurantId])
        toast.success('Availability updated')
      },
    }
  )

  const bulkUpdateMutation = useMutation(
    ({ ids, data }) => bulkUpdateMenuItems(ids, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['menu', restaurantId])
        toast.success('Items updated successfully')
      },
    }
  )

  const bulkDeleteMutation = useMutation(bulkDeleteMenuItems, {
    onSuccess: () => {
      queryClient.invalidateQueries(['menu', restaurantId])
      toast.success('Items deleted successfully')
    },
  })

  return {
    items: data?.items || [],
    total: data?.total || 0,
    isLoading,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    updateAvailability: availabilityMutation.mutate,
    bulkUpdate: bulkUpdateMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    refetch,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
  }
}

export const useMenuItem = (id) => {
  const { data, isLoading } = useQuery(
    ['menu-item', id],
    () => getMenuItem(id),
    { enabled: !!id }
  )

  return { item: data, isLoading }
}

export default useMenu
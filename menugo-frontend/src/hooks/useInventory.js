import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
  getLowStockItems,
  getInventoryTransactions,
} from '../services/inventoryService'
import toast from 'react-hot-toast'

export const useInventory = (restaurantId, filters) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    ['inventory', restaurantId, filters],
    () => getInventoryItems(restaurantId, filters),
    { enabled: !!restaurantId }
  )

  const { data: lowStockItems } = useQuery(
    ['low-stock', restaurantId],
    () => getLowStockItems(restaurantId),
    { enabled: !!restaurantId }
  )

  const createMutation = useMutation(
    (data) => createInventoryItem(restaurantId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory', restaurantId])
        toast.success('Item added successfully')
      },
      onError: () => toast.error('Failed to add item'),
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateInventoryItem(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory', restaurantId])
        toast.success('Item updated successfully')
      },
      onError: () => toast.error('Failed to update item'),
    }
  )

  const deleteMutation = useMutation(deleteInventoryItem, {
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory', restaurantId])
      toast.success('Item deleted successfully')
    },
    onError: () => toast.error('Failed to delete item'),
  })

  const adjustMutation = useMutation(
    ({ id, quantity, reason }) => adjustStock(id, quantity, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory', restaurantId])
        toast.success('Stock adjusted successfully')
      },
      onError: () => toast.error('Failed to adjust stock'),
    }
  )

  return {
    items: data?.items || [],
    lowStockItems: lowStockItems || [],
    total: data?.total || 0,
    isLoading,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    adjustStock: adjustMutation.mutate,
    refetch,
  }
}

export const useInventoryTransactions = (restaurantId, filters) => {
  const { data, isLoading } = useQuery(
    ['inventory-transactions', restaurantId, filters],
    () => getInventoryTransactions(restaurantId, filters),
    { enabled: !!restaurantId }
  )

  return { transactions: data?.transactions || [], isLoading }
}

export default useInventory
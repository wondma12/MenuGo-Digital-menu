import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  assignTableToWaiter,
  transferTable,
  getTableQRCode,
  regenerateQRCode,
} from '../services/tableService'
import toast from 'react-hot-toast'

export const useTables = (restaurantId, filters) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    ['tables', restaurantId, filters],
    () => getTables(restaurantId, filters),
    { enabled: !!restaurantId, refetchInterval: 10000 }
  )

  const createMutation = useMutation(
    (data) => createTable(restaurantId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tables', restaurantId])
        toast.success('Table created successfully')
      },
      onError: () => toast.error('Failed to create table'),
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateTable(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tables', restaurantId])
        toast.success('Table updated successfully')
      },
      onError: () => toast.error('Failed to update table'),
    }
  )

  const deleteMutation = useMutation(deleteTable, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tables', restaurantId])
      toast.success('Table deleted successfully')
    },
    onError: () => toast.error('Failed to delete table'),
  })

  const statusMutation = useMutation(
    ({ id, status }) => updateTableStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tables', restaurantId])
        toast.success('Table status updated')
      },
    }
  )

  const assignMutation = useMutation(
    ({ tableId, waiterId, reason }) => assignTableToWaiter(tableId, waiterId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tables', restaurantId])
        toast.success('Table assigned successfully')
      },
    }
  )

  return {
    tables: data?.tables || [],
    stats: data?.stats,
    isLoading,
    createTable: createMutation.mutate,
    updateTable: updateMutation.mutate,
    deleteTable: deleteMutation.mutate,
    updateStatus: statusMutation.mutate,
    assignTable: assignMutation.mutate,
    refetch,
  }
}

export const useTable = (id) => {
  const { data, isLoading } = useQuery(
    ['table', id],
    () => getTable(id),
    { enabled: !!id }
  )

  const qrMutation = useMutation(() => getTableQRCode(id), {
    onSuccess: (data) => {
      toast.success('QR code generated')
    },
  })

  const regenerateMutation = useMutation(() => regenerateQRCode(id), {
    onSuccess: (data) => {
      toast.success('QR code regenerated')
    },
  })

  return {
    table: data,
    isLoading,
    getQRCode: qrMutation.mutate,
    regenerateQRCode: regenerateMutation.mutate,
    qrCode: qrMutation.data,
  }
}

export default useTables
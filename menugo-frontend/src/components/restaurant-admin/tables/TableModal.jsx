
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../../common/Modal'
import TableForm from './TableForm'
import { createTable, updateTable } from '../../../services/tableService'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../../store/authStore'

const TableModal = ({ isOpen, onClose, table, onSuccess }) => {
  const queryClient = useQueryClient()
  const isEditing = !!table
  const { user } = useAuthStore()

  const createMutation = useMutation(
    ({ restaurantId, data }) => createTable(restaurantId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tables'])
        toast.success('Table created successfully')
        onSuccess()
      },
      onError: () => toast.error('Failed to create table'),
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateTable(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tables'])
        toast.success('Table updated successfully')
        onSuccess()
      },
      onError: () => toast.error('Failed to update table'),
    }
  )

  const handleSubmit = (formData) => {
    // Normalize form field names to API expected snake_case
    const payload = {
      table_number: formData.tableNumber ?? formData.table_number,
      table_name: formData.tableName ?? formData.table_name,
      capacity: formData.capacity,
      section: formData.section,
      shape: formData.shape,
      width: formData.width,
      height: formData.height,
      x_position: formData.xPosition ?? formData.x_position,
      y_position: formData.yPosition ?? formData.y_position,
    }

    if (isEditing) {
      updateMutation.mutate({ id: table.id, data: payload })
    } else {
      createMutation.mutate({ restaurantId: user?.restaurant_id, data: payload })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Table' : 'Add New Table'} size="md">
      <TableForm
        table={table}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Modal>
  )
}

export default TableModal
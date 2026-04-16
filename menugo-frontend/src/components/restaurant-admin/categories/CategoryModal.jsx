import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useAuthStore } from '../../../store/authStore'
import Modal from '../../../common/Modal'
import CategoryForm from './CategoryForm'
import { createCategory, updateCategory } from '../../../services/categoryService'
import toast from 'react-hot-toast'

const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const queryClient = useQueryClient()
  const isEditing = !!category

  const { user } = useAuthStore()

  const createMutation = useMutation(
    ({ restaurantId, data }) => createCategory(restaurantId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories', user?.restaurant_id])
        toast.success('Category created successfully')
        onSuccess()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create category')
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateCategory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories', user?.restaurant_id])
        toast.success('Category updated successfully')
        onSuccess()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update category')
      },
    }
  )

  const handleSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate({ id: category.id, data })
    } else {
      if (!user?.restaurant_id) {
        toast.error('No restaurant selected')
        return
      }
      createMutation.mutate({ restaurantId: user?.restaurant_id, data })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Add New Category'}
      size="md"
    >
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Modal>
  )
}

export default CategoryModal
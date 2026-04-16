import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../../common/Modal'
import StaffForm from './StaffForm'
import { createStaff, updateStaff } from '../../../services/staffService'
import { useAuthStore } from '../../../store/authStore'
import toast from 'react-hot-toast'

const StaffModal = ({ isOpen, onClose, staff, onSuccess }) => {
  const queryClient = useQueryClient()
  const isEditing = !!staff
  const { user } = useAuthStore()

  const createMutation = useMutation(createStaff, {
    onSuccess: (created) => {
      queryClient.invalidateQueries('staff')
      toast.success('Staff member added successfully')
      // If backend returned a plain password (dev), surface it to the admin
      const plain = created?.plain_password || created?.password || null
      if (plain) {
        try {
          navigator.clipboard?.writeText(plain)
        } catch {}
        toast('Temporary password copied to clipboard: ' + plain, { icon: '🔐' })
      }
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add staff member')
    },
  })

  const updateMutation = useMutation(updateStaff, {
    onSuccess: () => {
      queryClient.invalidateQueries('staff')
      toast.success('Staff member updated successfully')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update staff member')
    },
  })

  const handleSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate({ id: staff.id, data })
    } else {
      // Normalize restaurant id and validate required fields before sending
      const restaurantId = user?.restaurant_id?.id || user?.restaurant_id || user?.restaurant?.id || user?.restaurant?._id

      if (!restaurantId) {
        toast.error('Unable to determine restaurant for this action. Please ensure you are logged into a restaurant account.')
        return
      }

      if (!data?.email) {
        toast.error('Email is required to create a staff member')
        return
      }

      const payload = {
        ...data,
        restaurant_id: restaurantId,
      }

      // Defensive: ensure role is a primitive string (not an object)
      if (typeof payload.role === 'object') payload.role = payload.role.value || payload.role.id || String(payload.role)

      createMutation.mutate(payload)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
      size="lg"
    >
      <StaffForm
        staff={staff}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Modal>
  )
}

export default StaffModal
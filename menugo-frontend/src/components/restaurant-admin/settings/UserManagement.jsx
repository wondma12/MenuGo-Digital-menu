import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Avatar from '../../../common/Avatar'
import Badge from '../../../common/Badge'
import Modal from '../../../common/Modal'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import { getRestaurantUsers, inviteUser, updateUserRole, removeUser } from '../../../services/userService'
import toast from 'react-hot-toast'

const UserManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const { data: users, isLoading, refetch } = useQuery('restaurantUsers', getRestaurantUsers)

  const inviteMutation = useMutation(inviteUser, {
    onSuccess: () => {
      refetch()
      setShowInviteModal(false)
      toast.success('Invitation sent')
    },
  })

  const updateRoleMutation = useMutation(updateUserRole, {
    onSuccess: () => {
      refetch()
      setEditingUser(null)
      toast.success('Role updated')
    },
  })

  const removeUserMutation = useMutation(removeUser, {
    onSuccess: () => {
      refetch()
      toast.success('User removed')
    },
  })

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'chef', label: 'Chef' },
    { value: 'cashier', label: 'Cashier' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
        <Button onClick={() => setShowInviteModal(true)} icon={PlusIcon}>Invite User</Button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <div>
          {users?.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div>
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editingUser?.id === user.id ? (
                    <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                  >
                    {roleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="info" size="sm">{user.role}</Badge>
                )}
                {editingUser?.id === user.id ? (
                  <>
                    <Button size="sm" onClick={() => updateRoleMutation.mutate({ userId: user.id, role: editingUser.role })}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingUser(user)} className="p-1 text-slate-500 hover:text-primary-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeUserMutation.mutate(user.id)} className="p-1 text-slate-500 hover:text-red-600">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member" size="md">
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          inviteMutation.mutate({
            email: formData.get('email'),
            role: formData.get('role'),
          })
        }} className="space-y-4">
          <Input name="email" label="Email Address" type="email" required />
          <Select name="role" label="Role" options={roleOptions} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={inviteMutation.isLoading}>Send Invitation</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UserManagement
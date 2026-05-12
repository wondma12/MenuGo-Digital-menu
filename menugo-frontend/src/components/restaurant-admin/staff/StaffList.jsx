import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Avatar from '../../../common/Avatar'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { updateStaffStatus, deleteStaff } from '../../../services/staffService'
import toast from 'react-hot-toast'

const StaffList = ({ staff, onEdit, onRefresh }) => {
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleStatusToggle = async (staffMember) => {
    try {
      const resolveStaffPk = (member) => {
        if (!member) return null
        return member.staffPk ?? member.raw?.id ?? member.staffId ?? member.id ?? member.employeeId ?? null
      }
      const staffPk = resolveStaffPk(staffMember)
      await updateStaffStatus(staffPk, !staffMember.isActive)
      toast.success(`${staffMember.name} ${!staffMember.isActive ? 'activated' : 'deactivated'}`)
      onRefresh()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      const resolveStaffPk = (member) => {
        if (!member) return null
        return member.staffPk ?? member.raw?.id ?? member.staffId ?? member.id ?? member.employeeId ?? null
      }
      const staffPk = resolveStaffPk(deleteTarget)
      await deleteStaff(staffPk)
      toast.success('Staff member deleted successfully')
      onRefresh()
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Failed to delete staff member')
    }
  }

  const roleColors = {
    admin: 'purple',
    // manager: 'blue',
    waiter: 'green',
    chef: 'orange',
    // cashier: 'cyan',
    // delivery: 'indigo',
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={member.avatar} name={member.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">ID: {member.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={roleColors[member.role]} size="sm">{member.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500">{member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.shiftStart} - {member.shiftEnd}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(member)}
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        member.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {member.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                      {member.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(member)} className="p-1 text-gray-500 hover:text-primary-600">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(member)} className="p-1 text-gray-500 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default StaffList
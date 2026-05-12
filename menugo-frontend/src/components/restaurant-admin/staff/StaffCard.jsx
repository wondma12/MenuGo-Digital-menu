import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, EnvelopeIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'
import Avatar from '../../../common/Avatar'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { updateStaffStatus, deleteStaff } from '../../../services/staffService'
import toast from 'react-hot-toast'

const StaffCard = ({ staff, onEdit, onRefresh }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleStatusToggle = async () => {
    try {
      const resolveStaffPk = (member) => {
        if (!member) return null
        return member.staffPk ?? member.raw?.id ?? member.staffId ?? member.id ?? member.employeeId ?? null
      }
      const staffPk = resolveStaffPk(staff)
      await updateStaffStatus(staffPk, !staff.isActive)
      toast.success(`${staff.name} ${!staff.isActive ? 'activated' : 'deactivated'}`)
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
      const staffPk = resolveStaffPk(staff)
      await deleteStaff(staffPk)
      toast.success('Staff member deleted successfully')
      onRefresh()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Failed to delete staff member')
    }
  }

  const roleColors = {
    admin: 'purple',
    manager: 'blue',
    waiter: 'green',
    chef: 'orange',
    cashier: 'cyan',
    delivery: 'indigo',
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all h-full flex flex-col"
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar src={staff.avatar} name={staff.name} size="xl" />
              <div>
                <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                <p className="text-xs text-gray-500">ID: {staff.employeeId}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={onEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                <PencilIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setShowDeleteDialog(true)} className="p-1.5 text-gray-500 hover:bg-red-50 rounded-lg">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={roleColors[staff.role]} size="sm">{staff.role}</Badge>
              <button
                onClick={handleStatusToggle}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  staff.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {staff.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              <span className="truncate">{staff.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              <span>{staff.phone}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span>{staff.shiftStart} - {staff.shiftEnd}</span>
            </div>
          </div>

        </div>

        <div className="pt-3 border-t border-gray-100 p-4 bg-gray-50">
          <p className="text-xs text-gray-500">Hired: {staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : '—'}</p>
          {staff.hourlyRate && (
            <p className="text-xs text-gray-500 mt-1">Hourly Rate: ${staff.hourlyRate}/hr</p>
          )}
        </div>
      </motion.div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${staff.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default StaffCard

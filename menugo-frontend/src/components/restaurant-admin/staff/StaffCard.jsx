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
        whileHover={{ y: -2 }}
        className="flex h-full flex-col overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.10)]"
      >
        <div className="flex flex-1 flex-col p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={staff.avatar} name={staff.name} size="xl" />
              <div>
                <h3 className="truncate font-black tracking-tight text-slate-900">{staff.name}</h3>
              </div>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={roleColors[staff.role]} size="sm">{staff.role}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <EnvelopeIcon className="w-4 h-4 text-slate-400" />
              <span className="truncate">{staff.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <PhoneIcon className="w-4 h-4 text-slate-400" />
              <span>{staff.phone}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ClockIcon className="w-4 h-4 text-slate-400" />
              <span>{staff.shiftStart} - {staff.shiftEnd}</span>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</span>
                <button
                  onClick={handleStatusToggle}
                  className={`w-fit rounded-none px-2.5 py-1 text-xs font-medium ${
                    staff.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {staff.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</span>
                <div className="flex flex-wrap gap-2">
                  <button onClick={onEdit} className="rounded-none border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-orange-200 hover:text-orange-600">
                    Edit
                  </button>
                  <button onClick={() => setShowDeleteDialog(true)} className="rounded-none border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-orange-200 hover:text-orange-600">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-4 pt-3">
          <p className="text-xs text-slate-500">Hired: {staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : '—'}</p>
          {staff.hourlyRate && (
            <p className="mt-1 text-xs text-slate-500">Hourly Rate: ${staff.hourlyRate}/hr</p>
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

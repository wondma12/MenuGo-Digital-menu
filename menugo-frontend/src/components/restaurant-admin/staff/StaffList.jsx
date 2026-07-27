import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Avatar from '../../../common/Avatar'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import StaffCard from './StaffCard'
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
      <div className="mt-6 overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-orange-50/40"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={member.avatar} name={member.name} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const role = String(member.role || '').toLowerCase()
                      const forceBlack = role === 'chef' || role === 'waiter'
                      return (
                        <Badge
                          variant={roleColors[member.role] || 'default'}
                          size="sm"
                          className={forceBlack ? 'text-black' : ''}
                        >
                          {member.role}
                        </Badge>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-600">{member.email}</p>
                      <p className="text-xs text-slate-500">{member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {member.shiftStart} - {member.shiftEnd}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-none px-2 py-1 text-xs font-medium ${
                        member.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusToggle(member)}
                        className={`rounded-none p-1 ${
                          member.isActive
                            ? 'text-emerald-600 hover:bg-orange-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={member.isActive ? 'Deactivate staff member' : 'Activate staff member'}
                        aria-label={member.isActive ? 'Deactivate staff member' : 'Activate staff member'}
                      >
                        {member.isActive ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                      <button onClick={() => onEdit(member)} className="rounded-none p-1 text-slate-500 hover:text-orange-600">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(member)} className="rounded-none p-1 text-slate-500 hover:text-orange-700">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-3 sm:p-4 md:hidden">
          {staff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <StaffCard staff={member} onEdit={() => onEdit(member)} onRefresh={onRefresh} />
            </motion.div>
          ))}
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
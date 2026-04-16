import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import { getStaffSchedule, updateStaffSchedule } from '../../../services/staffService'
import toast from 'react-hot-toast'

const StaffSchedule = ({ staff }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingSchedule, setEditingSchedule] = useState(null)

  const { data: schedule, isLoading, refetch } = useQuery(
    ['staffSchedule', selectedDate],
    () => getStaffSchedule(selectedDate)
  )

  const updateMutation = useMutation(updateStaffSchedule, {
    onSuccess: () => {
      refetch()
      setEditingSchedule(null)
      toast.success('Schedule updated')
    },
  })

  if (isLoading) return <Loading />

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currentDay = selectedDate.getDay()

  const getStaffForShift = (staffId, shift) => {
    const staffMember = staff.find(s => s.id === staffId)
    return staffMember
  }

  const shifts = [
    { name: 'Morning', time: '9:00 AM - 1:00 PM', icon: '🌅' },
    { name: 'Afternoon', time: '1:00 PM - 5:00 PM', icon: '☀️' },
    { name: 'Evening', time: '5:00 PM - 9:00 PM', icon: '🌙' },
    { name: 'Night', time: '9:00 PM - 1:00 AM', icon: '⭐' },
  ]

  const resolveStaffPk = (member) => {
    // Prefer the original restaurant_staff primary key if available
    if (!member) return null
    return member.staffPk ?? member.raw?.id ?? member.staffId ?? member.id ?? member.employeeId ?? null
  }

  const handleScheduleUpdate = (staffIdOrMember, shift, isAssigned) => {
    // Allow caller to pass either the staff id or the staff member object
    const staffPk = typeof staffIdOrMember === 'object' ? resolveStaffPk(staffIdOrMember) : staffIdOrMember
    if (!staffPk) {
      toast.error('Unable to determine staff record for this member')
      return
    }

    updateMutation.mutate({
      date: selectedDate,
      staffId: staffPk,
      shift,
      assigned: isAssigned,
    })
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
              className="px-3 py-1 border rounded-lg hover:bg-gray-50"
            >
              Previous Day
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
              className="px-3 py-1 border rounded-lg hover:bg-gray-50"
            >
              Next Day
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                {shifts.map(shift => (
                  <th key={shift.name} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center gap-1">
                      <span>{shift.icon}</span>
                      <span>{shift.name}</span>
                    </div>
                    <div className="text-xs font-normal text-gray-400">{shift.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff?.map((staffMember) => (
                <motion.tr
                  key={staffMember.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{staffMember.name}</p>
                        <p className="text-xs text-gray-500">{staffMember.role}</p>
                      </div>
                    </div>
                  </td>
                  {shifts.map((shift) => {
                    const isAssigned = schedule?.some(
                      s => s.staffId === staffMember.id && s.shift === shift.name && s.date === selectedDate.toISOString().split('T')[0]
                    )
                    return (
                      <td key={shift.name} className="px-4 py-3">
                        <button
                          onClick={() => handleScheduleUpdate(staffMember, shift.name, !isAssigned)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            isAssigned
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {isAssigned ? '✓' : '+'}
                        </button>
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Summary */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClockIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Shift Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shifts.map(shift => {
            const count = schedule?.filter(s => s.shift === shift.name).length || 0
            return (
              <div key={shift.name} className="text-center">
                <p className="text-sm text-blue-700">{shift.name}</p>
                <p className="text-xl font-bold text-blue-900">{count} staff</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StaffSchedule
import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Sun, Moon, Star } from 'lucide-react'
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
    { name: 'Morning', time: '9:00 AM - 1:00 PM', icon: <Sun className="w-4 h-4" /> },
    { name: 'Afternoon', time: '1:00 PM - 5:00 PM', icon: <Sun className="w-4 h-4" /> },
    { name: 'Evening', time: '5:00 PM - 9:00 PM', icon: <Moon className="w-4 h-4" /> },
    { name: 'Night', time: '9:00 PM - 1:00 AM', icon: <Star className="w-4 h-4" /> },
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
      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <span className="text-lg font-black tracking-tight text-slate-900">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
              className="flex items-center justify-center rounded-none border border-slate-200 px-3 py-1 text-slate-700 hover:bg-orange-50"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="rounded-none bg-gradient-to-r from-orange-500 to-blue-500 px-3 py-1 text-white hover:from-orange-600 hover:to-blue-600"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
              className="flex items-center justify-center rounded-none border border-slate-200 px-3 py-1 text-slate-700 hover:bg-orange-50"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Staff Member</th>
                {shifts.map(shift => (
                  <th key={shift.name} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <div className="flex items-center gap-1">
                      <span>{shift.icon}</span>
                      <span>{shift.name}</span>
                    </div>
                    <div className="text-xs font-normal text-slate-400">{shift.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff?.map((staffMember) => (
                <motion.tr
                  key={staffMember.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-orange-50/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{staffMember.name}</p>
                        <p className="text-xs text-slate-500">{staffMember.role}</p>
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
                          className={`h-8 w-8 rounded-none transition-all ${
                            isAssigned
                              ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white hover:from-orange-600 hover:to-blue-600'
                              : 'bg-slate-100 text-slate-400 hover:bg-orange-50'
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

      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 mb-3">
          <ClockIcon className="w-5 h-5 text-orange-600" />
          <h3 className="font-black tracking-tight text-slate-900">Shift Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shifts.map(shift => {
            const count = schedule?.filter(s => s.shift === shift.name).length || 0
            return (
              <div key={shift.name} className="text-center">
                <p className="text-sm text-slate-500">{shift.name}</p>
                <p className="text-xl font-black text-slate-900">{count} staff</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StaffSchedule
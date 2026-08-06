
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline'

const TodaySchedule = ({ schedule }) => {
  const fallbackSlots = [
    { time: '11:00 AM', reservations: 2, available: 8 },
    { time: '12:00 PM', reservations: 5, available: 5 },
    { time: '1:00 PM', reservations: 4, available: 6 },
    { time: '2:00 PM', reservations: 1, available: 9 },
    { time: '6:00 PM', reservations: 6, available: 4 },
    { time: '7:00 PM', reservations: 8, available: 2 },
    { time: '8:00 PM', reservations: 7, available: 3 },
    { time: '9:00 PM', reservations: 3, available: 7 },
  ]

  const timeSlots = Array.isArray(schedule?.slots) && schedule.slots.length > 0 ? schedule.slots : fallbackSlots
  const totalReservations = schedule?.totalReservations ?? timeSlots.reduce((sum, slot) => sum + (slot.reservations || 0), 0)
  const availableTables = schedule?.availableTables ?? timeSlots.reduce((sum, slot) => Math.max(sum, slot.available || 0), 0)

  return (
    <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Today's Schedule</h3>
          <p className="text-sm text-slate-500">Reservations and table availability</p>
        </div>
        <ClockIcon className="w-5 h-5 text-slate-400" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="rounded-none bg-orange-50 p-3">
          <p className="text-slate-500">Reservations</p>
          <p className="text-lg font-semibold text-slate-900">{totalReservations}</p>
        </div>
        <div className="rounded-none bg-blue-50 p-3">
          <p className="text-slate-500">Tables available</p>
          <p className="text-lg font-semibold text-slate-900">{availableTables}</p>
        </div>
      </div>

      <div className="space-y-3">
        {timeSlots.map((slot, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium text-slate-700">{slot.time}</span>
              <div className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3 text-slate-400" />
                <span className="text-sm text-slate-600">{slot.reservations} reservations</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-none bg-slate-200">
                <div
                  className="h-full rounded-none bg-orange-500"
                  style={{ width: `${(slot.reservations / (slot.reservations + slot.available)) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{slot.available} tables left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodaySchedule
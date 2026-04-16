import React from 'react'
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline'

const TodaySchedule = ({ schedule }) => {
  const timeSlots = [
    { time: '11:00 AM', reservations: 2, available: 8 },
    { time: '12:00 PM', reservations: 5, available: 5 },
    { time: '1:00 PM', reservations: 4, available: 6 },
    { time: '2:00 PM', reservations: 1, available: 9 },
    { time: '6:00 PM', reservations: 6, available: 4 },
    { time: '7:00 PM', reservations: 8, available: 2 },
    { time: '8:00 PM', reservations: 7, available: 3 },
    { time: '9:00 PM', reservations: 3, available: 7 },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
          <p className="text-sm text-gray-500">Reservations and table availability</p>
        </div>
        <ClockIcon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {timeSlots.map((slot, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">{slot.time}</span>
              <div className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-600">{slot.reservations} reservations</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(slot.reservations / (slot.reservations + slot.available)) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{slot.available} tables left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodaySchedule
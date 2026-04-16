import React, { useState } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ReservationCalendar = ({ reservations, onSelectDate }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getReservationsForDate = (date) => {
    return reservations.filter(r => isSameDay(new Date(r.reservationDate), date))
  }

  const getHourlySlots = (date) => {
    const dayReservations = getReservationsForDate(date)
    const slots = ['11:00', '12:00', '13:00', '14:00', '15:00', '17:00', '18:00', '19:00', '20:00', '21:00']
    return slots.map(slot => ({
      time: slot,
      reservations: dayReservations.filter(r => r.reservationTime?.startsWith(slot))
    }))
  }

  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-gray-900">
          {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
        </h3>
        <button onClick={handleNextWeek} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {days.map((day, index) => (
              <div key={index} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                <div className="text-sm font-medium text-gray-500">{format(day, 'EEE')}</div>
                <div className="text-lg font-semibold text-gray-900">{format(day, 'dd')}</div>
              </div>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {['11:00', '12:00', '13:00', '14:00', '15:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((hour) => (
              <div key={hour} className="grid grid-cols-7">
                {days.map((day, dayIndex) => {
                  const dayReservations = getReservationsForDate(day)
                  const hourReservations = dayReservations.filter(r => r.reservationTime?.startsWith(hour))
                  const isPast = new Date(day) < new Date() && new Date(day).toDateString() !== new Date().toDateString()

                  return (
                    <div
                      key={dayIndex}
                      className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[60px] ${isPast ? 'bg-gray-50' : ''}`}
                    >
                      <div className="text-xs text-gray-400 mb-1">{hour}</div>
                      {hourReservations.map((res, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-primary-100 text-primary-700 rounded p-1 mb-1 truncate cursor-pointer hover:bg-primary-200"
                          title={`${res.customerName} - ${res.partySize} guests`}
                        >
                          {res.customerName} ({res.partySize})
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationCalendar
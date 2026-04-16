import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'

const ReservationCalendar = ({ reservations, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getReservationsForDate = (date) => {
    return reservations.filter(r => isSameDay(new Date(r.reservationDate), date))
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((date, index) => {
          const dayReservations = getReservationsForDate(date)
          const isCurrentMonth = isSameMonth(date, currentMonth)
          
          return (
            <div
              key={index}
              onClick={() => onSelectDate(date)}
              className={`
                min-h-24 p-2 border rounded-lg cursor-pointer transition-all
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                ${dayReservations.length > 0 ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}
              `}
            >
              <div className="text-right text-sm font-medium mb-1">
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {dayReservations.slice(0, 2).map((res, idx) => (
                  <div key={idx} className="text-xs truncate">
                    <Badge variant="info" size="sm">
                      {res.reservationTime} - {res.partySize}p
                    </Badge>
                  </div>
                ))}
                {dayReservations.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayReservations.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReservationCalendar
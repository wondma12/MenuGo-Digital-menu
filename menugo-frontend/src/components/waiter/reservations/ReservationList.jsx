import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import ReservationCard from './ReservationCard'
import ReservationCalendar from './ReservationCalendar'
import SeatReservation from './SeatReservation'
import Button from '../../common/Button'
import Loading from '../../common/Loading'
import { getTodayReservations } from '../../../services/reservationService'

const ReservationList = () => {
  const [viewMode, setViewMode] = useState('list')
  const [selectedReservation, setSelectedReservation] = useState(null)

  const { data: reservations, isLoading, refetch } = useQuery('todayReservations', getTodayReservations, {
    refetchInterval: 30000
  })

  if (isLoading) return <Loading />

  const upcomingReservations = reservations?.filter(r => 
    r.status === 'confirmed' && new Date(r.reservationTime) > new Date()
  ) || []

  const pastReservations = reservations?.filter(r => 
    r.status !== 'confirmed' || new Date(r.reservationTime) <= new Date()
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Today's Reservations</h2>
          <p className="text-sm text-gray-500">{upcomingReservations.length} upcoming reservations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'calendar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {/* Upcoming Reservations */}
          {upcomingReservations.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Upcoming</h3>
              <div className="space-y-3">
                {upcomingReservations.map((reservation, index) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ReservationCard
                      reservation={reservation}
                      onSeat={() => setSelectedReservation(reservation)}
                      onRefresh={refetch}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past/Completed Reservations */}
          {pastReservations.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Past & Completed</h3>
              <div className="space-y-3">
                {pastReservations.map((reservation, index) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ReservationCard
                      reservation={reservation}
                      onRefresh={refetch}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <ReservationCalendar reservations={reservations || []} />
      )}

      {selectedReservation && (
        <SeatReservation
          isOpen={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
          reservation={selectedReservation}
          onSuccess={() => {
            refetch()
            setSelectedReservation(null)
          }}
        />
      )}
    </div>
  )
}

export default ReservationList
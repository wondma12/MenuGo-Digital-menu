import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import ReservationForm from './ReservationForm'
import ReservationCalendar from './ReservationCalendar'
import Button from '../../../common/Button'
import Modal from '../../../common/Modal'
import Badge from '../../../common/Badge'
import Loading from '../../../common/Loading'
import { getReservations, updateReservationStatus } from '../../../services/reservationService'
import { useRestaurantStore } from '../../../store/restaurantStore'
import toast from 'react-hot-toast'

const ReservationsList = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [viewMode, setViewMode] = useState('list')

  const { restaurant } = useRestaurantStore()
  const restaurantId = restaurant?.id || restaurant?.restaurant_id || null

  const { data: reservations, isLoading, refetch } = useQuery(
    ['reservations', restaurantId],
    () => getReservations(restaurantId, {}),
    { enabled: !!restaurantId }
  )

  const updateMutation = useMutation(updateReservationStatus, {
    onSuccess: () => {
      toast.success('Reservation status updated')
      refetch()
    },
  })

  if (isLoading) return <Loading />

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'success',
      seated: 'info',
      cancelled: 'danger',
      no_show: 'warning',
      completed: 'success',
    }
    return colors[status] || 'default'
  }

  const handleStatusUpdate = (id, status) => {
    updateMutation.mutate({ id, status })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reservations</h2>
          <p className="text-sm text-gray-500">Manage table reservations</p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'calendar' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Calendar
            </button>
          </div>
          <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
            New Reservation
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations?.map((reservation) => (
                  <motion.tr key={reservation.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{reservation.customerName}</p>
                        <p className="text-sm text-gray-500">{reservation.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Table {reservation.tableNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{new Date(reservation.reservationDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{reservation.reservationTime}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reservation.partySize} guests</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(reservation.status)} size="sm">{reservation.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {reservation.status === 'confirmed' && (
                          <>
                            <button onClick={() => handleStatusUpdate(reservation.id, 'seated')} className="text-green-600 hover:text-green-700">
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleStatusUpdate(reservation.id, 'cancelled')} className="text-red-600 hover:text-red-700">
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <ReservationCalendar reservations={reservations || []} onSelectDate={(date) => console.log(date)} />
      )}

      {/* Reservation Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Reservation" size="md">
        <ReservationForm onSuccess={() => { refetch(); setShowModal(false); }} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}

export default ReservationsList
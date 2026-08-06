import {useState} from 'react'
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
      <div className="flex items-center justify-between gap-4 rounded-none border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Reservations</p>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Manage table reservations</h2>
          <p className="text-sm text-slate-500">Track guests, seating status, and calendar availability.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm ${viewMode === 'calendar' ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50'}`}
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
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Party Size</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations?.map((reservation) => (
                  <motion.tr key={reservation.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-orange-50/40">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{reservation.customerName}</p>
                        <p className="text-sm text-slate-500">{reservation.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">Table {reservation.tableNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{new Date(reservation.reservationDate).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{reservation.reservationTime}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{reservation.partySize} guests</td>
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
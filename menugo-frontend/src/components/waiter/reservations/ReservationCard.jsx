
import { motion } from 'framer-motion'
import { User, Clock, Users, MapPin, Phone } from 'lucide-react'
import Button from '../../common/Button'
import Badge from '../../common/Badge'

const ReservationCard = ({ reservation, onSeat, onRefresh }) => {
  const getStatusConfig = (status) => {
    const configs = {
      confirmed: { label: 'Confirmed', color: 'success' },
      seated: { label: 'Seated', color: 'info' },
      cancelled: { label: 'Cancelled', color: 'danger' },
      no_show: { label: 'No Show', color: 'warning' },
      completed: { label: 'Completed', color: 'success' }
    }
    return configs[status] || configs.confirmed
  }

  const statusConfig = getStatusConfig(reservation.status)
  const isUpcoming = reservation.status === 'confirmed' && new Date(reservation.reservationTime) > new Date()

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{reservation.customerName}</span>
        </div>
        <Badge variant={statusConfig.color} size="sm">{statusConfig.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{reservation.reservationTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{reservation.partySize} guests</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Table {reservation.tableNumber}</span>
        </div>
        {reservation.customerPhone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{reservation.customerPhone}</span>
          </div>
        )}
      </div>

      {isUpcoming && onSeat && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Button onClick={onSeat} size="sm" fullWidth>
            Seat Guest
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReservationCard
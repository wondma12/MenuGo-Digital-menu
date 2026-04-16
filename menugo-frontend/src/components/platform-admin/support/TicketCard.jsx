import React from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../../common/Badge'

const TicketCard = ({ ticket }) => {
  const priorityVariant = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
  }

  return (
    <Link
      to={`/platform/support/${ticket.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">#{ticket.ticketNumber || ticket.id}</p>
          <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
          <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={priorityVariant[ticket.priority] || 'default'} size="sm">
            {ticket.priority || 'normal'}
          </Badge>
          <Badge variant="info" size="sm">
            {ticket.status || 'open'}
          </Badge>
        </div>
      </div>
    </Link>
  )
}

export default TicketCard

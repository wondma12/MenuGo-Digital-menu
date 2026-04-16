import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import Badge from '../../../common/Badge'
import Avatar from '../../../common/Avatar'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import TicketMessages from './TicketMessages'
import { getTicketDetails, addTicketMessage, updateTicketStatus } from '../../../services/supportService'
import toast from 'react-hot-toast'

const TicketDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const { data: ticket, isLoading } = useQuery(['ticket', id], () => getTicketDetails(id))

  const addMessageMutation = useMutation(addTicketMessage, {
    onSuccess: () => {
      queryClient.invalidateQueries(['ticket', id])
      setMessage('')
      toast.success('Message sent')
    },
  })

  const updateStatusMutation = useMutation(updateTicketStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(['ticket', id])
      toast.success('Status updated')
    },
  })

  if (isLoading) return <Loading />

  const getPriorityColor = (priority) => {
    const colors = { low: 'success', medium: 'info', high: 'warning', urgent: 'danger' }
    return colors[priority] || 'default'
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      addMessageMutation.mutate({ ticketId: id, message })
    }
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate('/platform/support')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Tickets
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900">#{ticket.ticketNumber} - {ticket.subject}</h1>
              <div className="flex gap-2 mt-2">
                <Badge variant={getPriorityColor(ticket.priority)} size="sm">{ticket.priority}</Badge>
                <Badge variant="info" size="sm">{ticket.status}</Badge>
                <Badge variant="default" size="sm">{ticket.category}</Badge>
              </div>
            </div>
            <select
              value={ticket.status}
              onChange={(e) => updateStatusMutation.mutate({ ticketId: id, status: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Avatar name={ticket.customerName} size="md" />
            <div>
              <p className="font-medium text-gray-900">{ticket.customerName}</p>
              <p className="text-sm text-gray-500">Restaurant: {ticket.restaurantName}</p>
            </div>
          </div>
          <p className="text-gray-700">{ticket.description}</p>
          <p className="text-xs text-gray-400 mt-2">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <TicketMessages ticketId={id} />

      <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
        <div className="flex gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
            rows={3}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} isLoading={addMessageMutation.isLoading} icon={PaperAirplaneIcon}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TicketDetails
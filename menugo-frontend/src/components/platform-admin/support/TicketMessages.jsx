import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import Avatar from '../../../common/Avatar'
import Loading from '../../../common/Loading'
import { getTicketMessages } from '../../../services/supportService'

const TicketMessages = ({ ticketId }) => {
  const { data: messages, isLoading } = useQuery(
    ['ticketMessages', ticketId],
    () => getTicketMessages(ticketId),
    { refetchInterval: 5000 }
  )

  if (isLoading) return <Loading />

  return (
    <div className="space-y-4">
      {messages?.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex gap-3 ${message.isAdmin ? 'justify-end' : ''}`}
        >
          {!message.isAdmin && (
            <Avatar name={message.senderName} size="sm" />
          )}
          <div className={`max-w-[70%] ${message.isAdmin ? 'bg-primary-50' : 'bg-gray-100'} rounded-lg p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-900">{message.senderName}</span>
              <span className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm text-gray-700">{message.message}</p>
          </div>
          {message.isAdmin && (
            <Avatar name="Support" size="sm" />
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default TicketMessages
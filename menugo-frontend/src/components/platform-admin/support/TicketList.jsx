import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import TicketCard from './TicketCard'
import TicketFilters from './TicketFilters'
import Loading from '../../../common/Loading'
import EmptyState from '../../../common/EmptyState'
import Pagination from '../../../common/Pagination'
import { getSupportTickets } from '../../../services/supportService'

const TicketList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, refetch } = useQuery(
    ['supportTickets', currentPage, searchTerm, filters],
    () => getSupportTickets({ page: currentPage, search: searchTerm, ...filters })
  )

  if (isLoading) return <Loading />

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500 mt-1">Manage customer support requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Open" value={data?.openCount || 0} color="yellow" />
        <StatCard title="In Progress" value={data?.inProgressCount || 0} color="blue" />
        <StatCard title="Resolved" value={data?.resolvedCount || 0} color="green" />
        <StatCard title="Avg Response" value={`${data?.avgResponseTime || 0}h`} color="purple" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <FunnelIcon className="w-5 h-5 text-black" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6">
          <TicketFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {data?.tickets?.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TicketCard ticket={ticket} onUpdate={refetch} />
          </motion.div>
        ))}
      </div>

      {data?.tickets?.length === 0 && (
        <EmptyState title="No tickets found" description="No support tickets match your criteria" />
      )}

      {data?.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={data.totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}

const StatCard = ({ title, value, color }) => {
  let borderClass = 'border-l-blue-500'
  let valueClass = 'text-blue-600'
  if (color === 'yellow') {
    borderClass = 'border-l-yellow-500'
    valueClass = 'text-yellow-600'
  } else if (color === 'blue') {
    borderClass = 'border-l-blue-500'
    valueClass = 'text-blue-600'
  } else if (color === 'green') {
    borderClass = 'border-l-green-500'
    valueClass = 'text-green-600'
  } else if (color === 'purple') {
    borderClass = 'border-l-purple-500'
    valueClass = 'text-purple-600'
  } else if (color === 'red') {
    borderClass = 'border-l-red-500'
    valueClass = 'text-red-600'
  } else if (color === 'orange') {
    borderClass = 'border-l-orange-500'
    valueClass = 'text-orange-600'
  }

  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-200 text-center h-full border-l-4 ${borderClass}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

export default TicketList
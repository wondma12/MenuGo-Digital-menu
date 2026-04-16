import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import Pagination from '../../../common/Pagination'
import DatePicker from '../../../common/DatePicker'
import { getAuditLogs } from '../../../services/systemService'

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useQuery(
    ['auditLogs', currentPage, searchTerm, dateRange],
    () => getAuditLogs({ page: currentPage, search: searchTerm, ...dateRange })
  )

  if (isLoading) return <Loading />

  const getActionColor = (action) => {
    if (action.includes('create')) return 'text-green-600'
    if (action.includes('update') || action.includes('edit')) return 'text-blue-600'
    if (action.includes('delete')) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Track all system activities</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
          />
        </div>
        <DatePicker selected={dateRange.start} onChange={(date) => setDateRange({ ...dateRange, start: date })} placeholder="Start Date" />
        <DatePicker selected={dateRange.end} onChange={(date) => setDateRange({ ...dateRange, end: date })} placeholder="End Date" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.logs?.map((log, index) => (
              <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.userName || 'System'}</p>
                    <p className="text-xs text-gray-500">{log.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${getActionColor(log.action)}`}>{log.action}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.entityType}: {log.entityId?.slice(0, 8)}...</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.ipAddress || '-'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={data.totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}

export default AuditLogs
import {useState} from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { EyeIcon } from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import Badge from '../../../common/Badge'
import Pagination from '../../../common/Pagination'
import { getSubscriptions } from '../../../services/subscriptionService'

const SubscriptionList = () => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useQuery(
    ['subscriptions', currentPage],
    () => getSubscriptions({ page: currentPage })
  )

  if (isLoading) return <Loading />

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      past_due: 'warning',
      cancelled: 'danger',
      expired: 'danger',
      trial: 'info',
    }
    return colors[status] || 'default'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Subscriptions</h1>
        <p className="text-gray-500 mt-1">Manage restaurant subscriptions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.subscriptions?.map((sub, index) => (
              <motion.tr
                key={sub.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{sub.restaurantName}</p>
                    <p className="text-sm text-gray-500">{sub.restaurantEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="purple" size="sm">{sub.plan}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusColor(sub.status)} size="sm">{sub.status}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(sub.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(sub.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button className="text-primary-600 hover:text-primary-700">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
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

export default SubscriptionList
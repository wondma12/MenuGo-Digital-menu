import {useState} from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Box, Coffee, Trash2, Settings, Clipboard } from 'lucide-react'
import Badge from '../../../common/Badge'
import Pagination from '../../../common/Pagination'
import { getInventoryTransactions } from '../../../services/inventoryService'

const InventoryTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useQuery(
    ['inventoryTransactions', currentPage],
    () => getInventoryTransactions({ page: currentPage })
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const getTransactionColor = (type) => {
    const colors = {
      purchase: 'success',
      usage: 'warning',
      waste: 'danger',
      adjustment: 'info',
    }
    return colors[type] || 'default'
  }

  const getTransactionIcon = (type) => {
    const icons = {
      purchase: <Box className="w-4 h-4" />,
      usage: <Coffee className="w-4 h-4" />,
      waste: <Trash2 className="w-4 h-4" />,
      adjustment: <Settings className="w-4 h-4" />,
    }
    return icons[type] || <Clipboard className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.transactions?.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{transaction.itemName}</p>
                    <p className="text-xs text-gray-500">{transaction.itemCategory}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getTransactionColor(transaction.type)} size="sm">
                      {getTransactionIcon(transaction.type)} {transaction.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{transaction.previousQuantity} {transaction.unit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{transaction.newQuantity} {transaction.unit}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{transaction.reason || '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data?.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={data.totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {data?.transactions?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}
    </div>
  )
}

export default InventoryTransactions
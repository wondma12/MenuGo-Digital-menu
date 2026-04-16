import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { DocumentArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import Badge from '../../../common/Badge'
import Pagination from '../../../common/Pagination'
import Modal from '../../../common/Modal'
import { getInvoices, downloadInvoice } from '../../../services/subscriptionService'
import toast from 'react-hot-toast'

const InvoiceList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const { data, isLoading } = useQuery(
    ['invoices', currentPage],
    () => getInvoices({ page: currentPage })
  )

  const handleDownload = async (invoice) => {
    try {
      await downloadInvoice(invoice.id)
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      toast.error('Failed to download invoice')
    }
  }

  if (isLoading) return <Loading />

  const getStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'default',
    }
    return colors[status] || 'default'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">Manage all platform invoices</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.invoices?.map((invoice, index) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {invoice.invoiceNumber}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.restaurantName}</p>
                    <p className="text-sm text-gray-500">{invoice.restaurantEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">${invoice.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusColor(invoice.status)} size="sm">
                    {invoice.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(invoice)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Download"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="View"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice Details - ${selectedInvoice?.invoiceNumber}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Invoice Number</p>
                <p className="font-medium text-gray-900">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={getStatusColor(selectedInvoice.status)} size="sm">
                  {selectedInvoice.status}
                </Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">${selectedInvoice.amount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Tax</p>
                <p className="font-medium text-gray-900">${selectedInvoice.taxAmount?.toLocaleString() || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Created Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleString()}</p>
              </div>
            </div>
            
            {selectedInvoice.paidAt && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600">Paid At</p>
                <p className="text-sm text-green-700">{new Date(selectedInvoice.paidAt).toLocaleString()}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => handleDownload(selectedInvoice)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Download PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InvoiceList
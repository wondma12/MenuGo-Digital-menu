import React from 'react'
import { User, Mail, Phone } from 'lucide-react'

const CustomerInfo = ({ customer }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{customer?.name || 'Guest'}</span>
        </div>
        {customer?.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{customer.email}</span>
          </div>
        )}
        {customer?.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{customer.phone}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerInfo
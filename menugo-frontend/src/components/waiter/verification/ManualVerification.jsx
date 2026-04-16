import React from 'react'
import { CheckCircle } from 'lucide-react'

const ManualVerification = () => {
  return (
    <div className="text-center py-6">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
      <h4 className="text-lg font-semibold text-gray-900 mb-2">Manual Verification</h4>
      <p className="text-sm text-gray-500">
        Confirm that you have visually verified the order with the customer
      </p>
    </div>
  )
}

export default ManualVerification
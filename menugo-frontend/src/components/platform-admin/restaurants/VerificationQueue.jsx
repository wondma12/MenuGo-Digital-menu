import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import Badge from '../../../common/Badge'
import Modal from '../../../common/Modal'
import Button from '../../../common/Button'
import VerificationModal from './VerificationModal'
import { getPendingVerifications, verifyRestaurant } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const VerificationQueue = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const { data, isLoading, refetch } = useQuery(
    'pendingVerifications',
    getPendingVerifications,
    { refetchInterval: 30000 }
  )

  const verifyMutation = useMutation(verifyRestaurant, {
    onSuccess: () => {
      toast.success('Restaurant verified successfully')
      refetch()
      setShowDetails(false)
    },
    onError: (error) => {
      const serverMessage = error?.response?.data?.message || error?.message || 'Failed to verify restaurant'
      console.error('Verify mutation error:', error)
      toast.error(serverMessage)
    },
  })

  if (isLoading) return <Loading />

  const handleVerify = (restaurantId, status, notes) => {
    verifyMutation.mutate({ restaurantId, status, notes })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-500 mt-1">Review and verify pending restaurant applications</p>
      </div>

      <div className="space-y-4">
        {data?.map((restaurant, index) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {restaurant.logo ? (
                  <img src={restaurant.logo} alt={restaurant.name} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                    <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{restaurant.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="warning" size="sm">Pending Verification</Badge>
                    <span className="text-xs text-gray-400">
                      Submitted: {new Date(restaurant.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRestaurant(restaurant)
                    setShowDetails(true)
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleVerify(restaurant.id, 'approved')}
                  disabled={verifyMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(restaurant.id, 'rejected')}
                  disabled={verifyMutation.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {data?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No pending verifications</h3>
            <p className="text-gray-500 mt-1">All restaurants have been verified</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={`Review Application - ${selectedRestaurant?.name}`}
        size="lg"
      >
        {selectedRestaurant && (
          <VerificationModal
            restaurant={selectedRestaurant}
            onVerify={handleVerify}
            onClose={() => setShowDetails(false)}
          />
        )}
      </Modal>
    </div>
  )
}

export default VerificationQueue
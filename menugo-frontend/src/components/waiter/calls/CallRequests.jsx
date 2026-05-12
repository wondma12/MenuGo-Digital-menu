import React from 'react'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import CallCard from './CallCard'
import CallDetails from './CallDetails'
import { Phone } from 'lucide-react'
import Loading from '../../common/Loading'
import { getWaiterCalls } from '../../../services/callService'

const CallRequests = () => {
  const [selectedCall, setSelectedCall] = React.useState(null)

  const { data: calls, isLoading, refetch } = useQuery('waiterCalls', getWaiterCalls, {
    refetchInterval: 5000
  })

  if (isLoading) return <Loading />

  const pendingCalls = calls?.filter(c => c.status === 'pending') || []
  const acknowledgedCalls = calls?.filter(c => c.status === 'acknowledged') || []
  const resolvedCalls = calls?.filter(c => c.status === 'resolved') || []

  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded p-4">
      {/* Pending Calls */}
      {pendingCalls.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-semibold text-gray-900">Pending Calls ({pendingCalls.length})</h2>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {pendingCalls.map((call) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <CallCard call={call} onClick={() => setSelectedCall(call)} onRefresh={refetch} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Acknowledged Calls */}
      {acknowledgedCalls.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Acknowledged ({acknowledgedCalls.length})</h2>
          <div className="space-y-3">
            {acknowledgedCalls.map((call) => (
              <CallCard key={call.id} call={call} onClick={() => setSelectedCall(call)} onRefresh={refetch} />
            ))}
          </div>
        </div>
      )}

      {/* Resolved Calls */}
      {resolvedCalls.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Resolved ({resolvedCalls.length})</h2>
          <div className="space-y-3">
            {resolvedCalls.slice(0, 5).map((call) => (
              <CallCard key={call.id} call={call} onClick={() => setSelectedCall(call)} onRefresh={refetch} />
            ))}
          </div>
        </div>
      )}

      {calls?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3"><Phone className="w-12 h-12 mx-auto text-gray-400" /></div>
          <h3 className="text-lg font-medium text-gray-900">No call requests</h3>
          <p className="text-gray-500 mt-1">Customer calls will appear here</p>
        </div>
      )}

      {selectedCall && (
        <CallDetails
          isOpen={!!selectedCall}
          onClose={() => setSelectedCall(null)}
          call={selectedCall}
          onRefresh={refetch}
        />
      )}
    </div>
  )
}

export default CallRequests
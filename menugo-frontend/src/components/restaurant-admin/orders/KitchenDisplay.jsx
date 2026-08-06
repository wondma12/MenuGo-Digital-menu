import {useState, useEffect, useRef} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from 'react-query'
import { BellIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import OrderStatusBadge from './OrderStatusBadge'
import { updateOrderStatus } from '../../../services/orderService'
import toast from 'react-hot-toast'
import useAudio from '../../../hooks/useAudio'

const KitchenDisplay = ({ orders, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filter, setFilter] = useState('all')
  const { playSound } = useAudio()
  const [previousCount, setPreviousCount] = useState(0)
  const [autoStart, setAutoStart] = useState(() => {
    try {
      const raw = localStorage.getItem('kitchen:autoStart')
      if (!raw) return false
      const { safeParseJSON } = require('../../../utils/helpers')
      const parsed = safeParseJSON(raw)
      if (typeof parsed === 'boolean') return parsed
      return JSON.parse(raw)
    } catch (e) {
      return false
    }
  })

  const prevPendingIdsRef = useRef(new Set())
  const didInitialLoadRef = useRef(false)

  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const pendingOrders = orders.filter(o => o.status === 'verified')
  const readyOrders = orders.filter(o => o.status === 'ready')

  const updateMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success('Status updated')
      onRefresh()
    },
  })

  // Watch for new pending (verified) orders. Play sound and optionally auto-start preparation.
  useEffect(() => {
    const currentIds = new Set(pendingOrders.map(o => o.id))

    if (!didInitialLoadRef.current) {
      // Initialize tracker on first load; don't auto-start existing orders
      prevPendingIdsRef.current = currentIds
      didInitialLoadRef.current = true
      setPreviousCount(pendingOrders.length)
      return
    }

    const newOrders = pendingOrders.filter(o => !prevPendingIdsRef.current.has(o.id))
    if (newOrders.length > 0) {
      playSound('new-order')
      if (autoStart) {
        // Auto-start each newly arrived verified order
        newOrders.forEach(o => updateMutation.mutate({ id: o.id, status: 'preparing' }))
      }
    }

    prevPendingIdsRef.current = currentIds
    setPreviousCount(pendingOrders.length)
  }, [pendingOrders, autoStart, playSound, updateMutation])

  const handleStatusUpdate = (orderId, newStatus) => {
    updateMutation.mutate({ id: orderId, status: newStatus })
  }

  const filteredOrders = () => {
    switch (filter) {
      case 'preparing':
        return preparingOrders
      case 'ready':
        return readyOrders
      default:
        return [...pendingOrders, ...preparingOrders, ...readyOrders]
    }
  }

  return (
    <div className="space-y-6">
      {/* Compact toolbar - layout provides the main header */}
      <div className="flex justify-end items-center mb-2">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All ({pendingOrders.length + preparingOrders.length + readyOrders.length})
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'preparing' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Preparing ({preparingOrders.length})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'ready' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Ready ({readyOrders.length})
          </button>
          {/* Auto-start toggle */}
          <label className="inline-flex items-center gap-2 ml-3 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => {
                const v = e.target.checked
                setAutoStart(v)
                try { localStorage.setItem('kitchen:autoStart', JSON.stringify(v)) } catch (err) {}
              }}
              className="h-4 w-4"
            />
            <span>Auto-start</span>
          </label>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredOrders().map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              layout
              className={`bg-white rounded-xl shadow-lg border-l-4 overflow-hidden ${
                order.status === 'preparing' ? 'border-l-orange-500' :
                order.status === 'ready' ? 'border-l-green-500' :
                'border-l-yellow-500'
              }`}
            >
                <div className="p-4">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">#{idx + 1}</h3>
                    <p className="text-sm text-gray-500">Table {order.tableNumber}</p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} size="sm" />
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Timer */}
                {order.status === 'preparing' && order.preparationStartedAt && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Prep Time:</span>
                      <Timer startTime={order.preparationStartedAt} expectedTime={order.estimatedPreparationTime} />
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-4 max-h-48 overflow-y-auto">
                  {order.items?.map((item, idx) => (
                      <div key={idx} className="py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
                            )}
                            <span className="text-sm"><span className="font-medium">{item.quantity}x</span> {item.name}</span>
                          </div>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <span className="text-xs text-gray-500">
                              +{item.modifiers.length}
                            </span>
                          )}
                        </div>
                      {item.modifiers && item.modifiers.slice(0, 2).map((mod, i) => (
                        <div key={i} className="text-xs text-gray-500 ml-4">
                          + {mod.name}
                        </div>
                      ))}
                      {item.modifiers && item.modifiers.length > 2 && (
                        <div className="text-xs text-gray-400 ml-4">
                          +{item.modifiers.length - 2} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  {order.status === 'verified' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Start Cooking
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <div className="flex-1 text-center py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Ready for Pickup
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredOrders().length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No orders in kitchen</h3>
          <p className="text-gray-500 mt-1">Orders will appear here when customers place them</p>
        </div>
      )}
    </div>
  )
}

// Timer component for kitchen display
const Timer = ({ startTime, expectedTime = 20 }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = Math.floor((new Date() - new Date(startTime)) / 60000)
      setElapsed(minutes)
    }, 60000)
    return () => clearInterval(interval)
  }, [startTime])

  const isOvertime = elapsed > expectedTime
  const remaining = Math.max(0, expectedTime - elapsed)

  return (
    <div className={`flex items-center gap-1 ${isOvertime ? 'text-red-600' : 'text-green-600'}`}>
      <ClockIcon className="w-3 h-3" />
      <span className="text-xs font-medium">
        {isOvertime ? `+${elapsed - expectedTime} min` : `${remaining} min left`}
      </span>
    </div>
  )
}

export default KitchenDisplay
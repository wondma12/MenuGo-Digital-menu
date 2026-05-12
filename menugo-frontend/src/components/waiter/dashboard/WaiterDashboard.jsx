import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Bell, CheckCircle, Clock } from 'lucide-react'
import WaiterStats from './WaiterStats'
import TodayMetrics from './TodayMetrics'
import PerformanceChart from './PerformanceChart'
import Loading from '../../common/Loading'
import { getWaiterDashboard } from '../../../services/waiterService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import { useAudio } from '../../../hooks/useAudio'
import WaiterOrderList from '../orders/WaiterOrderList'

const WaiterDashboard = () => {
  const { data, isLoading, refetch } = useQuery('waiterDashboard', getWaiterDashboard, {
    refetchInterval: 30000
  })
  const { lastMessage } = useWebSocket()
  const { playSound } = useAudio()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (lastMessage?.type === 'new_order') {
      playSound('new-order')
      setNotifications(prev => [{
        id: Date.now(),
        title: 'New Order',
        message: `New order received for table ${lastMessage.tableNumber}`,
        time: new Date()
      }, ...prev].slice(0, 5))
      refetch()
    }
  }, [lastMessage, playSound, refetch])

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6 border border-gray-200 rounded">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waiter Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {data?.waiterName}!</p>
        </div>
        <div className="relative">
            <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
            <Bell className="w-5 h-5 text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <WaiterStats stats={data?.stats} />

      {/* Today's Metrics */}
      <TodayMetrics metrics={data?.todayMetrics} />

      {/* Performance Chart */}
      <PerformanceChart data={data?.performanceData} />

      {/* Recent Activity removed per request */}

      {/* Quick Status (compact) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-green-50 rounded p-3 border border-green-200/25">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-green-600">On Duty</p>
              <p className="text-lg font-bold text-green-700">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded p-3 border border-blue-200/25">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600">Shift Duration</p>
              <p className="text-lg font-bold text-blue-700">{data?.shiftDuration || '0h 0m'}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded p-3 border border-purple-200/25">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-purple-600">Today's Rating</p>
              <p className="text-lg font-bold text-purple-700">{data?.todayRating || '0.0'} ★</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div>
        <WaiterOrderList />
      </div>
    </div>
  )
}

export default WaiterDashboard
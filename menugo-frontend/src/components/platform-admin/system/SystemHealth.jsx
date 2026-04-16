import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { 
  ServerIcon, 
  CircleStackIcon, 
  CloudArrowUpIcon, 
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import { getSystemHealth } from '../../../services/systemService'

const SystemHealth = () => {
  const { data, isLoading, refetch } = useQuery('systemHealth', getSystemHealth, {
    refetchInterval: 30000,
  })

  if (isLoading) return <Loading />

  const services = [
    { name: 'API Server', key: 'api', icon: ServerIcon },
    { name: 'Database', key: 'database', icon: CircleStackIcon },
    { name: 'Redis Cache', key: 'redis', icon: CloudArrowUpIcon },
    { name: 'Queue Worker', key: 'queue', icon: CpuChipIcon },
  ]

  const getStatusIcon = (status) => {
    if (status === 'healthy') return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    if (status === 'degraded') return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
    return <XCircleIcon className="w-5 h-5 text-red-500" />
  }

  const getStatusColor = (status) => {
    if (status === 'healthy') return 'bg-green-100 text-green-800'
    if (status === 'degraded') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500 mt-1">Monitor system performance and status</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Overall System Status</p>
            <p className={`text-2xl font-bold capitalize ${getStatusColor(data?.overallStatus).split(' ')[2]}`}>
              {data?.overallStatus || 'healthy'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Uptime</p>
            <p className="text-xl font-bold text-gray-900">{data?.uptime || '99.99'}%</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {services.map((service) => {
          const metrics = data?.services?.[service.key]
          return (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <service.icon className="w-8 h-8 text-gray-400" />
                {getStatusIcon(metrics?.status)}
              </div>
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              {metrics?.latency && (
                <p className="text-sm text-gray-500 mt-1">Latency: {metrics.latency}ms</p>
              )}
              {metrics?.responseTime && (
                <p className="text-sm text-gray-500">Response: {metrics.responseTime}ms</p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(metrics?.status)}`}>
                  {metrics?.status || 'unknown'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
          <div className="space-y-4">
            <MetricBar label="CPU Usage" value={data?.metrics?.cpu || 45} unit="%" color="blue" />
            <MetricBar label="Memory Usage" value={data?.metrics?.memory || 60} unit="%" color="green" />
            <MetricBar label="Disk Usage" value={data?.metrics?.disk || 35} unit="%" color="yellow" />
            <MetricBar label="Database Connection Pool" value={data?.metrics?.dbConnections || 12} max={50} unit="connections" color="purple" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {data?.alerts?.length > 0 ? (
              data.alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{alert.message}</p>
                    <p className="text-xs text-red-600 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No active alerts</p>
                <p className="text-sm text-gray-400">All systems are operating normally</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const MetricBar = ({ label, value, max = 100, unit = '%', color = 'blue' }) => {
  const percentage = (value / max) * 100
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">{value}{unit}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default SystemHealth

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const SystemHealth = ({ health }) => {
  const services = [
    { name: 'API Server', status: health.apiStatus || 'healthy', latency: health.apiLatency },
    { name: 'Database', status: health.dbStatus || 'healthy', latency: health.dbLatency },
    { name: 'Redis Cache', status: health.redisStatus || 'healthy', latency: health.redisLatency },
    { name: 'Socket Server', status: health.socketStatus || 'healthy', latency: health.socketLatency },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'degraded':
        return <ExclamationCircleIcon className="w-4 h-4 text-yellow-500" />
      case 'down':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Operational'
      case 'degraded':
        return 'Degraded'
      case 'down':
        return 'Down'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      <div className="space-y-3">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(service.status)}
              <span className="text-sm text-gray-700">{service.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {service.latency && (
                <span className="text-xs text-gray-400">{service.latency}ms</span>
              )}
              <span className={`text-xs font-medium ${
                service.status === 'healthy' ? 'text-green-600' :
                service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getStatusText(service.status)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Uptime (30d)</span>
          <span className="font-semibold text-gray-900">{health.uptime || 99.99}%</span>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth
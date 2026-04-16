import React from 'react'
import { ChartBarIcon, UserGroupIcon, HeartIcon } from '@heroicons/react/24/outline'

const CustomerInsights = ({ insights }) => {
  const defaultInsights = {
    newCustomers: 0,
    newCustomersChange: 0,
    returningRate: 0,
    returningRateChange: 0,
    avgSpend: 0,
    avgSpendChange: 0,
    peakHours: [
      { hour: '9am', percentage: 20 },
      { hour: '12pm', percentage: 80 },
      { hour: '3pm', percentage: 40 },
      { hour: '6pm', percentage: 100 },
      { hour: '9pm', percentage: 60 },
    ],
  }

  const data = { ...defaultInsights, ...insights }

  const metrics = [
    {
      label: 'New Customers',
      value: data.newCustomers,
      change: data.newCustomersChange,
      icon: UserGroupIcon,
      color: 'blue',
    },
    {
      label: 'Returning Rate',
      value: `${data.returningRate}%`,
      change: data.returningRateChange,
      icon: HeartIcon,
      color: 'pink',
    },
    {
      label: 'Avg Spend',
      value: `$${data.avgSpend.toLocaleString()}`,
      change: data.avgSpendChange,
      icon: ChartBarIcon,
      color: 'green',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => {
          const colors = getColorClasses(metric.color)
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex p-2 rounded-lg ${colors.bg} mb-2`}>
                <metric.icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.label}</p>
              {metric.change !== 0 && (
                <p className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Popular Times */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">Peak Hours</p>
        <div className="flex gap-1 items-end h-32">
          {data.peakHours.map((hour, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary-500 rounded-t-lg transition-all duration-300 hover:bg-primary-600"
                style={{ height: `${Math.min(hour.percentage, 100)}%`, maxHeight: '80px' }}
              />
              <p className="text-xs text-gray-500 mt-2">{hour.hour}</p>
              <p className="text-xs font-medium text-gray-700">{hour.percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerInsights

import { ChartBarIcon, UserGroupIcon, HeartIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '../../../utils/currency'

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
      value: formatPrice(data.avgSpend || 0),
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
    <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Customer Insights</h3>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => {
          const colors = getColorClasses(metric.color)
          return (
            <div key={index} className="text-center">
              <div className={`mb-2 inline-flex rounded-none p-2 ${colors.bg}`}>
                <metric.icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <p className="text-xl font-black text-slate-900">{metric.value}</p>
              <p className="text-xs text-slate-500">{metric.label}</p>
              {metric.change !== 0 && (
                <p className={`mt-1 text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Popular Times */}
      <div className="pt-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Peak Hours</p>
        <div className="flex gap-1 items-end h-32">
          {data.peakHours.map((hour, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full rounded-none bg-gradient-to-t from-orange-500 to-blue-500 transition-all duration-300 hover:from-orange-600 hover:to-blue-600"
                style={{ height: `${Math.min(hour.percentage, 100)}%`, maxHeight: '80px' }}
              />
              <p className="mt-2 text-xs text-slate-500">{hour.hour}</p>
              <p className="text-xs font-medium text-slate-700">{hour.percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerInsights
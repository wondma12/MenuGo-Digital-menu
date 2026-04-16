import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const RestaurantGrowthChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            New: <span className="font-semibold text-green-600">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-semibold text-blue-600">{payload[1].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const getBarColor = (value, index) => {
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
    return colors[index % colors.length]
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Restaurant Growth</h3>
        <p className="text-sm text-gray-500">New restaurants added per month</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="newRestaurants" name="New Restaurants" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.newRestaurants, index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RestaurantGrowthChart
import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BuildingOfficeIcon, MapPinIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import Button from '../../../common/Button'

const RecentRestaurants = ({ restaurants }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Restaurants</h3>
            <p className="text-sm text-gray-500">Latest restaurant signups</p>
          </div>
          <Link to="/platform/restaurants">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {restaurants.map((restaurant, index) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {restaurant.logo ? (
                  <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <div>
                  <Link to={`/platform/restaurants/${restaurant.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                    {restaurant.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {restaurant.city}, {restaurant.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={restaurant.isVerified ? 'success' : 'warning'} size="sm">
                  {restaurant.isVerified ? 'Verified' : 'Pending'}
                </Badge>
                <Badge variant="info" size="sm">
                  {restaurant.subscriptionTier}
                </Badge>
                <Link to={`/platform/restaurants/${restaurant.id}`}>
                  <EyeIcon className="w-4 h-4 text-gray-400 hover:text-primary-600 cursor-pointer" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {restaurants.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No recent restaurants found
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentRestaurants
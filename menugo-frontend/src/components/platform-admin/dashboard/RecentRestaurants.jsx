
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BuildingOfficeIcon, MapPinIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import Button from '../../../common/Button'

const RecentRestaurants = ({ restaurants }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Activity</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">Recent Restaurants</h3>
            <p className="text-sm text-slate-500">Latest restaurant signups</p>
          </div>
          <Link to="/platform/restaurants">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {restaurants.map((restaurant, index) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 transition-colors hover:bg-orange-50/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {restaurant.logo ? (
                  <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-100 to-blue-100">
                    <BuildingOfficeIcon className="w-5 h-5 text-orange-600" />
                  </div>
                )}
                <div>
                  <Link to={`/platform/restaurants/${restaurant.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                    {restaurant.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {restaurant.city}, {restaurant.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {(() => {
                        const created = restaurant.created_at ?? restaurant.createdAt
                        try {
                          return created ? new Date(created).toLocaleDateString() : '-'
                        } catch (e) {
                          return '-'
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const isActive = restaurant.is_active ?? restaurant.isActive ?? false
                  const isVerified = restaurant.is_verified ?? restaurant.isVerified ?? false
                  if (isActive) {
                    return <Badge variant="success" size="sm">Active</Badge>
                  }
                  if (isVerified) {
                    return <Badge variant="success" size="sm">Verified</Badge>
                  }
                  return <Badge variant="warning" size="sm">Pending</Badge>
                })()}
                <Badge variant="info" size="sm">
                  {restaurant.subscriptionTier}
                </Badge>
                <Link to={`/platform/restaurants/${restaurant.id}`}>
                  <EyeIcon className="w-4 h-4 cursor-pointer text-slate-400 hover:text-orange-600" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {restaurants.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No recent restaurants found
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentRestaurants
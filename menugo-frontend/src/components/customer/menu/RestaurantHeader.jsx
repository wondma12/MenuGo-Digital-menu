import React from 'react'
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const RestaurantHeader = ({ restaurant }) => {
  if (!restaurant) return null

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: 'easeOut' } },
  }

  return (
    <motion.div className="relative" initial="hidden" animate="show" variants={container}>
      {/* Cover Image */}
      <motion.div variants={fadeUp} className="h-32 sm:h-40 md:h-48 lg:h-56 bg-gradient-to-r from-primary-500 to-primary-700 overflow-hidden">
        {restaurant.coverImage && (
          <motion.img variants={fadeUp} src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
      </motion.div>

      {/* Logo and Info */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex items-end -mt-10 mb-3">
          {restaurant.logo ? (
            <motion.img variants={fadeUp} src={restaurant.logo} alt={restaurant.name} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-3 border-white bg-white object-cover" />
          ) : (
            <motion.div variants={fadeUp} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-3 border-white bg-primary-100 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">🍽️</span>
            </motion.div>
          )}
        </div>

        <motion.h1 variants={fadeUp} className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{restaurant.name}</motion.h1>
        <motion.p variants={fadeUp} className="text-sm sm:text-sm md:text-base text-gray-500 mt-1 line-clamp-3">{restaurant.description}</motion.p>

        <div className="flex flex-wrap gap-3 mt-3 text-sm sm:text-sm md:text-base">
          <motion.div variants={fadeUp} className="flex items-center gap-1 text-gray-600">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span>{restaurant.rating || 0} ({restaurant.reviewCount || 0})</span>
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-1 text-gray-600">
            <MapPinIcon className="w-4 h-4" />
            <span>{restaurant.city}{restaurant.country ? `, ${restaurant.country}` : ''}</span>
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-1 text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>{restaurant.cuisineType}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default RestaurantHeader
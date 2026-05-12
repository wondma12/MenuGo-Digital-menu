import React, { useState } from 'react'
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Coffee } from 'lucide-react'
import { motion } from 'framer-motion'

const RestaurantHeader = ({ restaurant }) => {
  if (!restaurant) return null

  const formatTime12 = (t) => {
    if (!t) return '--'
    const m = String(t).match(/(\d{1,2}):(\d{2})/)
    if (!m) return String(t)
    let hh = parseInt(m[1], 10)
    const mm = m[2]
    const ampm = hh >= 12 ? 'PM' : 'AM'
    hh = hh % 12
    if (hh === 0) hh = 12
    return `${hh}:${mm} ${ampm}`
  }

  const getOpenClose = (h) => {
    if (!h) return { open: null, close: null, isClosed: false }
    const open = h.open || h.start || h.from || h.opens_at || h.opening_time || null
    const close = h.close || h.end || h.to || h.closes_at || h.close_time || null
    const isClosed = !!(h.is_closed || h.closed)
    return { open, close, isClosed }
  }

  // derive today's hours
  let hoursSource = restaurant.operatingHours || restaurant.operating_hours || restaurant.hours || restaurant.openingHours || restaurant.opening_hours || restaurant.opening_hours_week || null
  if (Array.isArray(hoursSource)) {
    const map = {}
    hoursSource.forEach((entry) => {
      const key = (entry.day || entry.weekday || entry.name || '').toString().toLowerCase()
      if (key) map[key] = entry
    })
    hoursSource = map
  }
  const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  let todayLabel = 'Hours not specified'
  if (hoursSource) {
    const todayHours = hoursSource[todayKey] || null
    if (todayHours) {
      const { open, close, isClosed } = getOpenClose(todayHours)
      todayLabel = isClosed ? 'Closed' : `${formatTime12(open)} - ${formatTime12(close)}`
    }
  }

  const addressParts = [restaurant.address, restaurant.address_line_2, restaurant.city, restaurant.state, restaurant.postcode, restaurant.country].filter(Boolean)
  const address = addressParts.join(', ')
  const lat = restaurant.latitude || restaurant.lat
  const lng = restaurant.longitude || restaurant.lon || restaurant.lng
  let mapUrl = ''
  if (lat && lng) mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  else if (address) mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: 'easeOut' } },
  }

  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div className="relative" initial="hidden" animate="show" variants={container}>
      {/* Cover Image */}
      <motion.div variants={fadeUp} className="h-32 sm:h-40 md:h-48 lg:h-56 bg-gradient-to-r from-primary-500 to-primary-700 overflow-hidden">
        {restaurant.coverImage && (
          (() => {
            // prefer requesting a higher-quality Cloudinary image when possible
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
            let src = restaurant.coverImage
            try {
              const u = new URL(src)
              if ((u.hostname.includes('res.cloudinary.com') || (cloudName && u.hostname.includes(cloudName)))) {
                // inject a transformation requesting larger width and automatic quality/format
                src = src.replace('/upload/', '/upload/f_auto,q_auto:best,w_1600/')
              }
            } catch (e) {
              // ignore
            }
            return (
              <motion.img
                variants={fadeUp}
                src={src}
                alt={restaurant.name}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.src = restaurant.coverImage }}
              />
            )
          })()
        )}
      </motion.div>

      {/* Logo and Info */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex items-end -mt-10 mb-3">
          {restaurant.logo ? (
            <motion.img variants={fadeUp} src={restaurant.logo} alt={restaurant.name} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-3 border-white bg-white object-cover" />
          ) : (
            <motion.div variants={fadeUp} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-3 border-white bg-primary-100 flex items-center justify-center">
              <Coffee className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </div>

        <motion.h1 variants={fadeUp} className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{restaurant.name}</motion.h1>
        <motion.div variants={fadeUp} className="mt-1">
          <motion.p variants={fadeUp} className={`text-sm sm:text-sm md:text-base text-gray-500 ${expanded ? '' : 'line-clamp-3'}`}>{restaurant.description}</motion.p>
          {restaurant.description && restaurant.description.length > 180 && (
            <button
              type="button"
              onClick={() => setExpanded((s) => !s)}
              className="mt-1 text-primary-600 text-sm hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </motion.div>

        <div className="flex flex-wrap gap-3 mt-3 text-sm sm:text-sm md:text-base items-center">
          <motion.div variants={fadeUp} className="flex items-center gap-1 text-gray-600">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span>{restaurant.rating || 0} ({restaurant.reviewCount || 0})</span>
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-1 text-gray-600">
            <MapPinIcon className="w-4 h-4" />
            {mapUrl ? (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" title={address}>{restaurant.city || address || 'Location'}</a>
            ) : (
              <span>{restaurant.city || address || 'Location'}</span>
            )}
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-1 text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>{todayLabel}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default RestaurantHeader
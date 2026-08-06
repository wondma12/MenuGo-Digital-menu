import {useState} from 'react'
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Coffee } from 'lucide-react'
import { motion } from 'framer-motion'

const RestaurantHeader = ({ restaurant }) => {
  const [expanded, setExpanded] = useState(false)

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

  return (
    <motion.div className="relative" initial="hidden" animate="show" variants={container}>
      <motion.div variants={fadeUp} className="relative h-40 sm:h-48 md:h-56 lg:h-[20rem] overflow-hidden bg-gradient-to-br from-slate-950 via-primary-900 to-amber-700">
        {restaurant.coverImage && (() => {
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          let src = restaurant.coverImage
          try {
            const u = new URL(src)
            if (u.hostname.includes('res.cloudinary.com') || (cloudName && u.hostname.includes(cloudName))) {
              src = src.replace('/upload/', '/upload/f_auto,q_auto:best,w_1600/')
            }
          } catch (e) {
            // ignore malformed URL
          }

          return (
            <motion.img
              variants={fadeUp}
              src={src}
              alt={restaurant.name}
              className="w-full h-full object-cover object-center opacity-85"
              loading="lazy"
              decoding="async"
              onError={(e) => { e.currentTarget.src = restaurant.coverImage }}
            />
          )
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      </motion.div>

      {/* <div className="container mx-auto px-4 pb-0 relative z-10 -mt-12 sm:-mt-14"> */}
          <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-blue-500" />

          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.4fr_0.9fr] lg:items-center lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {restaurant.logo ? (
                <motion.img
                  variants={fadeUp}
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-16 w-16 shrink-0 rounded-2xl border border-white bg-white object-cover shadow-lg ring-4 ring-white/80 sm:h-20 sm:w-20"
                />
              ) : (
                <motion.div variants={fadeUp} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white bg-orange-600 shadow-lg ring-4 ring-white/80 sm:h-20 sm:w-20">
                  <Coffee className="h-8 w-8 text-white" />
                </motion.div>
              )}

              <div className="min-w-0 flex-1">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-700">
                  Fresh dining experience
                </motion.div>

                <motion.h1 variants={fadeUp} className="mt-3 text-lg font-black tracking-tight text-slate-900 sm:text-xl md:text-2xl">
                  {restaurant.name}
                </motion.h1>

                <motion.p variants={fadeUp} className={`mt-2 max-w-2xl text-xs leading-5 text-slate-600 sm:text-sm ${expanded ? '' : 'line-clamp-3'}`}>
                  {restaurant.description}
                </motion.p>

                {restaurant.description && restaurant.description.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((s) => !s)}
                    className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <motion.div variants={fadeUp} className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Location</div>
                  <div className="mt-1 text-xs font-semibold text-slate-900">
                    {restaurant.city || address || 'Location'}
                  </div>
                </div>
                <MapPinIcon className="h-5 w-5 text-slate-500" />
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">Today</div>
                  <div className="mt-1 text-xs font-semibold text-slate-900">{todayLabel}</div>
                </div>
                <ClockIcon className="h-5 w-5 text-emerald-600" />
              </motion.div>
            </div>
          </div>
        </div>
      {/* </div> */}
    </motion.div>
  )
}

export default RestaurantHeader
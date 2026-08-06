import React from 'react'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import CallWaiterButton from '../common/CallWaiterButton'

const RestaurantInfo = ({ restaurant }) => {
  if (!restaurant) return null

  const addressParts = [restaurant.address, restaurant.address_line_2, restaurant.city, restaurant.state, restaurant.postcode, restaurant.country].filter(Boolean)
  const address = addressParts.join(', ')
  const lat = restaurant.latitude || restaurant.lat
  const lng = restaurant.longitude || restaurant.lon || restaurant.lng
  let mapUrl = ''
  if (lat && lng) mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  else if (address) mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  // Support multiple shapes for opening hours from API
  let hoursSource = restaurant.operatingHours || restaurant.operating_hours || restaurant.hours || restaurant.openingHours || restaurant.opening_hours || restaurant.opening_hours_week || null
  // Normalize array shape into a keyed object { monday: { ... } }
  if (Array.isArray(hoursSource)) {
    const map = {}
    hoursSource.forEach((entry) => {
      const key = (entry.day || entry.weekday || entry.name || '').toString().toLowerCase()
      if (key) map[key] = entry
    })
    hoursSource = map
  }
  const formatTime12 = (t) => {
    if (!t) return '--'
    const m = String(t).match(/(\d{1,2}):(\d{2})/)
    if (!m) return String(t)
    let hh = parseInt(m[1], 10)
    const mm = m[2]
    const ampm = hh >= 12 ? 'PM' : 'AM'
    hh = hh % 12
    if (hh === 0) hh = 12
    return `${hh.toString().padStart(2, '0')}:${mm} ${ampm}`
  }

  const getOpenClose = (h) => {
    if (!h) return { open: null, close: null, isClosed: false }
    const open = h.open || h.start || h.from || h.opens_at || h.opening_time || null
    const close = h.close || h.end || h.to || h.closes_at || h.close_time || null
    const isClosed = !!(h.is_closed || h.closed)
    return { open, close, isClosed }
  }
  const weekdayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  let hoursDisplay = 'Hours not specified'
  if (hoursSource) {
    const todayHours = (hoursSource[todayKey] || null)
    if (todayHours) {
      const { open, close, isClosed } = getOpenClose(todayHours)
      hoursDisplay = isClosed ? 'Closed' : `${formatTime12(open)} - ${formatTime12(close)}`
    } else {
      // if hoursSource is a simple string
      if (typeof hoursSource === 'string' && hoursSource.trim()) hoursDisplay = hoursSource
    }
  }
  const deliveryEnabled = restaurant.enableDelivery ?? restaurant.enable_delivery ?? restaurant.deliveryEnabled ?? false
  const pickupEnabled = restaurant.enablePickup ?? restaurant.enable_pickup ?? restaurant.pickupEnabled ?? false

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="mb-4">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Restaurant</div>
            <div className="text-2xl font-bold text-slate-900">{restaurant.name}</div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Contact</h3>
          <div className="flex flex-col gap-2 text-sm">
            {address && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-gray-600 hover:text-primary-600">
                <MapPinIcon className="w-4 h-4 mt-1" />
                <div>
                  {addressParts.map((p, idx) => (
                    <div key={idx}>{p}</div>
                  ))}
                </div>
              </a>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
                <PhoneIcon className="w-4 h-4" /> <span>{restaurant.phone}</span>
              </a>
            )}
            {restaurant.whatsapp && (
              <a href={`https://wa.me/${String(restaurant.whatsapp).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                <PhoneIcon className="w-4 h-4" /> <span>WhatsApp: {restaurant.whatsapp}</span>
              </a>
            )}
            {restaurant.email && (
              <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
                <EnvelopeIcon className="w-4 h-4" /> <span>{restaurant.email}</span>
              </a>
            )}
            {restaurant.website && (
              <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
                <GlobeAltIcon className="w-4 h-4" /> <span>{restaurant.website}</span>
              </a>
            )}
            {/* restaurant.description intentionally removed from contact block */}
          </div>
        </div>
        <div className="w-64">
          <h3 className="text-sm text-gray-500 mb-2">Today</h3>
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-base font-semibold text-gray-900">{hoursDisplay}</div>
            </div>
          </div>
          {deliveryEnabled && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs">Delivery available</span>
            </div>
          )}
          {pickupEnabled && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs">Pickup available</span>
            </div>
          )}
          {hoursSource && (
            <div className="mt-2 text-sm text-gray-600">
              <div className="capitalize">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
            </div>
          )}
        </div>
        <div className="mt-3">
          <CallWaiterButton restaurantId={restaurant.id} />
        </div>
      </div>
    </div>
  )
}

export default RestaurantInfo

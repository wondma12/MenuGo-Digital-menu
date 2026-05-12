import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline'
import DietaryIcons from './DietaryIcons'
import AvailabilityBadge from './AvailabilityBadge'
import SpiceLevel from './SpiceLevel'
import { useCartStore } from '../../../store/cartStore'
import useLocalStorage from '../../../hooks/useLocalStorage'
import { Link, useParams } from 'react-router-dom'

const MenuItemCard = ({ item, onClick, statusInfo }) => {
  const { addItem } = useCartStore()
  const [favorites, setFavorites] = useLocalStorage('favorites', [])
  const params = useParams()
  const restaurantId = params.restaurantId

  const isFav = Array.isArray(favorites) && favorites.some((f) => f.id === item.id)

  const toggleFav = (e) => {
    e.stopPropagation()
    if (isFav) {
      setFavorites((favorites || []).filter((f) => f.id !== item.id))
    } else {
      setFavorites([...(favorites || []), item])
    }
  }

  const quickAdd = (e) => {
    e.stopPropagation()
    addItem({ ...item, quantity: 1 })
  }

  const formattedDiscount = typeof item.discountPrice === 'number' ? item.discountPrice.toFixed(2) : item.discountPrice
  const formattedPrice = typeof item.price === 'number' ? item.price.toFixed(2) : item.price

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onClick && onClick(item)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
    >
      <div className="relative">
        {item.image ? (
          <Link to={`/menu/${restaurantId}/item/${item.id}`} onClick={(e) => e.stopPropagation()}>
            <img src={item.image} alt={item.name} className="w-full h-36 sm:h-40 md:h-48 lg:h-56 object-cover" />
          </Link>
        ) : (
          <div className="w-full h-36 sm:h-40 md:h-48 lg:h-56 bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" /></svg>
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.discountPrice && (
            <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full font-semibold">Sale ${formattedDiscount}</span>
          )}
          {item.isPopular && (
            <span className="text-xs px-2 py-1 bg-yellow-400 text-gray-900 rounded-full font-semibold">Popular</span>
          )}
          {item.isNew && (
            <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full font-semibold">New</span>
          )}
          {statusInfo && statusInfo.status && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">{(statusInfo.status || '').toUpperCase()}</span>
          )}
        </div>

        {/* Top-right quick actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={toggleFav}
            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
            className={`p-2 rounded-full transition-colors ${isFav ? 'bg-red-50 text-red-600' : 'bg-white text-gray-600'}`}
          >
            <HeartIcon className="w-4 h-4" />
          </button>
          {item.isAvailable && (
            <button
              onClick={quickAdd}
              aria-label={`Quick add ${item.name}`}
              className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700"
            >
              <ShoppingBagIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {!item.isAvailable && <AvailabilityBadge status="unavailable" />}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">
            <Link to={`/menu/${restaurantId}/item/${item.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
              {item.name}
            </Link>
          </h3>
          <div className="text-right">
            {item.discountPrice ? (
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-400 line-through">${formattedPrice}</span>
                <span className="font-bold text-primary-600">${formattedDiscount}</span>
              </div>
            ) : (
              <span className="font-bold text-primary-600">${formattedPrice}</span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DietaryIcons
              isVegetarian={item.isVegetarian}
              isVegan={item.isVegan}
              isGlutenFree={item.isGlutenFree}
            />
            {item.spiceLevel > 0 && <SpiceLevel level={item.spiceLevel} />}
          </div>

          {/* Primary action (open details) */}
          {item.isAvailable && (
            <Link to={`/menu/${restaurantId}/item/${item.id}`} onClick={(e) => e.stopPropagation()} className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
              View
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MenuItemCard
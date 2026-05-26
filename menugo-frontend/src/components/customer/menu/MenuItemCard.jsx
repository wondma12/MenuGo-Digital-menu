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
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative shrink-0">
        {item.image ? (
          <Link to={`/menu/${restaurantId}/item/${item.id}`} onClick={(e) => e.stopPropagation()}>
            <img src={item.image} alt={item.name} className="w-full h-40 sm:h-44 md:h-48 lg:h-56 object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          </Link>
        ) : (
          <div className="w-full h-40 sm:h-44 md:h-48 lg:h-56 bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" /></svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />

        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 text-sm font-extrabold text-slate-900 shadow-lg backdrop-blur">
            Br {item.discountPrice ? formattedDiscount : formattedPrice}
          </span>
        </div>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.discountPrice && (
            <span className="text-xs px-2.5 py-1 bg-rose-600 text-white rounded-full font-semibold shadow">Sale</span>
          )}
          {item.isPopular && (
            <span className="text-xs px-2.5 py-1 bg-amber-300 text-slate-900 rounded-full font-semibold shadow">Popular</span>
          )}
          {item.isNew && (
            <span className="text-xs px-2.5 py-1 bg-emerald-500 text-white rounded-full font-semibold shadow">New</span>
          )}
          {statusInfo && statusInfo.status && (
            <span className="text-xs px-2.5 py-1 bg-white/90 text-slate-700 rounded-full font-semibold shadow backdrop-blur">{(statusInfo.status || '').toUpperCase()}</span>
          )}
        </div>

        {/* Top-right quick actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={toggleFav}
            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
            className={`p-2 rounded-full transition-colors ${isFav ? 'bg-red-50 text-red-600' : 'bg-white text-slate-600'}`}
          >
            <HeartIcon className="w-4 h-4" />
          </button>
          {item.isAvailable && (
            <button
              onClick={quickAdd}
              aria-label={`Quick add ${item.name}`}
              className="p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700"
            >
              <ShoppingBagIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {!item.isAvailable && <AvailabilityBadge status="unavailable" />}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 font-semibold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2">
            <Link to={`/menu/${restaurantId}/item/${item.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
              {item.name}
            </Link>
          </h3>
          <div className="shrink-0 text-right">
            {item.discountPrice ? (
              <div className="flex flex-col items-end rounded-2xl bg-rose-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-400 line-through">Br {formattedPrice}</span>
                <span className="text-lg font-black text-rose-700">Br {formattedDiscount}</span>
              </div>
            ) : (
              <span className="inline-flex rounded-2xl bg-orange-50 px-3 py-2 text-lg font-black text-orange-700">Br {formattedPrice}</span>
            )}
          </div>
        </div>
        <p className="mb-4 min-h-[3rem] text-sm text-slate-600 line-clamp-2">{item.description || ' '}</p>
        
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <DietaryIcons
              isVegetarian={item.isVegetarian}
              isVegan={item.isVegan}
              isGlutenFree={item.isGlutenFree}
            />
            {item.spiceLevel > 0 && <SpiceLevel level={item.spiceLevel} />}
          </div>

          {/* Primary action (open details) */}
          {item.isAvailable && (
            <Link to={`/menu/${restaurantId}/item/${item.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-95 hover:shadow-lg">
              Details
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MenuItemCard
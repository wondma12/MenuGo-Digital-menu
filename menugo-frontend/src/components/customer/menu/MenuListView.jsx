import React from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

const MenuListView = ({ items, onItemClick, itemStatuses = {} }) => {
  const { restaurantId } = useParams()

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id || `${item.name || 'item'}-${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onItemClick(item)}
          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex gap-4">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" /></svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {itemStatuses[item.id] && (
                <div className="mb-1">
                  <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{(itemStatuses[item.id].status || '').toUpperCase()}</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-slate-900 line-clamp-1">{item.name}</h3>
                <span className="shrink-0 rounded-2xl bg-primary-50 px-3 py-1.5 text-sm font-black text-primary-700 whitespace-nowrap">
                  Br {(typeof item.price === 'number' ? item.price.toFixed(2) : Number(item.price || 0).toFixed(2))}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.isVegetarian && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Veg</span>}
                {item.isVegan && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Vegan</span>}
                {item.isGlutenFree && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">GF</span>}
                {item.spiceLevel > 0 && (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                    {'🔥'.repeat(item.spiceLevel)}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Tap for details</span>
                <Link
                  to={`/menu/${restaurantId}/item/${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg"
                >
                  View
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default MenuListView
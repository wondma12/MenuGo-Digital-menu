import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ClockIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { getRestaurantMenu } from '../../../services/menuService'
import { useCartStore } from '../../../store/cartStore'
import Button from '../../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const MenuItemDetail = () => {
  const { restaurantId, itemId } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const menu = await getRestaurantMenu(restaurantId)
        const found = (menu?.items || []).find((menuItem) => String(menuItem.id) === String(itemId)) || null
        if (mounted) setItem(found)
      } catch (error) {
        if (mounted) setItem(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [itemId, restaurantId])

  const price = typeof item?.price === 'number' ? item.price : Number(item?.price || 0)
  const discount = typeof item?.discountPrice === 'number' ? item.discountPrice : Number(item?.discountPrice || 0)
  const hasDiscount = discount > 0 && discount < price
  const displayPrice = hasDiscount ? discount : price
  const total = useMemo(() => displayPrice * quantity, [displayPrice, quantity])

  const dietaryTags = [
    item?.isVegetarian ? 'Veg' : null,
    item?.isVegan ? 'Vegan' : null,
    item?.isGlutenFree ? 'GF' : null,
    item?.isHalal ? 'Halal' : null,
  ].filter(Boolean)

  const handleAdd = () => {
    if (!item) return
    if (item.is_available === false || item.available === false || item.isAvailable === false) {
      toast.error('Item unavailable. Please select available menu item')
      return
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      selectedOptions: {},
      specialInstructions: '',
      image: item.image,
    })
    toast.success('Added to cart')
  }

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Item not found</h1>
          <p className="mt-2 text-sm text-slate-600">This dish may no longer be available.</p>
          <button
            onClick={() => navigate(`/menu/${restaurantId}`)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
        <div className="relative">
          {item.image ? (
            <div className="relative h-72 sm:h-96">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 sm:h-96">
              <SparklesIcon className="h-16 w-16 text-slate-300" />
            </div>
          )}

          <div className="absolute left-0 top-0 z-10 p-4 sm:p-6">
            <button
              onClick={() => navigate(`/menu/${restaurantId}`)}
              className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur transition hover:bg-white sm:px-4 sm:text-sm"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {item.isPopular && <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-bold text-slate-900">Popular</span>}
              {item.isNew && <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white">New</span>}
              {item.spiceLevel > 0 && <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white">{'🔥'.repeat(item.spiceLevel)}</span>}
              {!item.isAvailable && <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">Unavailable</span>}
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">{item.name}</h1>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/85 sm:text-sm">{item.description}</p>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6 lg:p-6">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {dietaryTags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-primary-50 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Price</p>
                <div className="mt-1.5 text-xl font-black text-primary-700">Br {displayPrice.toFixed(2)}</div>
                {hasDiscount && <p className="mt-1 text-xs text-slate-400 line-through">Br {price.toFixed(2)}</p>}
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Quantity</p>
                <div className="mt-1.5 text-xl font-black text-slate-900">{quantity}</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
                <div className="mt-1.5 text-xl font-black text-emerald-700">Br {total.toFixed(2)}</div>
              </div>
            </div>

            {(item.preparationTime || item.spiceLevel) && (
              <div className="flex flex-wrap gap-2.5">
                {item.preparationTime ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                    <ClockIcon className="h-3.5 w-3.5 text-slate-500" />
                    {item.preparationTime} min
                  </div>
                ) : null}
                {item.spiceLevel > 0 ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1.5 text-xs text-rose-700">
                    <FireIcon className="h-3.5 w-3.5" />
                    Spice level {item.spiceLevel}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Order</h2>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-100">
              <span className="text-xs font-medium text-slate-600">Quantity</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base font-bold text-slate-900 transition hover:bg-slate-50">-</button>
                <span className="w-6 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base font-bold text-slate-900 transition hover:bg-slate-50">+</button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs text-slate-500">You’ll pay</p>
              <p className="mt-1 text-2xl font-black text-slate-900">Br {total.toFixed(2)}</p>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleAdd}
                size="sm"
                fullWidth
                className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-sm text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600"
                disabled={item.is_available === false || item.available === false || item.isAvailable === false}
              >
                {item.is_available === false || item.available === false || item.isAvailable === false ? 'Unavailable' : 'Add to Cart'}
              </Button>
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-500">Tap back anytime to keep browsing the menu.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuItemDetail

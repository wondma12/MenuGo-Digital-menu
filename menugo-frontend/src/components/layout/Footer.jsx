
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { EnvelopeIcon, PhoneIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function Footer({ onOpenCart, restaurantId, restaurant, centered = false }) {
  const { totalItems, totalPrice } = useCartStore()
  const email = restaurant?.email || restaurant?.restaurant_email || restaurant?.contactEmail || ''
  const phone = restaurant?.phone || restaurant?.restaurant_phone || restaurant?.contactPhone || ''

  return (
    <>
      {/* Mobile quick-checkout bar (above footer) */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 md:hidden px-4">
          {/* <div className="max-w-4xl mx-auto bg-primary-600 text-white rounded-lg p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">{totalItems} item{totalItems > 1 ? 's' : ''}</div>
              <div className="text-sm opacity-90">${(totalPrice || 0).toFixed(2)}</div>
            </div>
            <button onClick={onOpenCart} className="bg-white text-primary-600 px-3 py-2 rounded-md font-semibold">Checkout</button>
          </div> */}
        </div>
      )}

      <footer className="mt-10 border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)]">
        {/* <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"> */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
            <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-amber-400 to-emerald-400" />

            <div className={`grid gap-2 p-5 sm:p-6 lg:p-8 ${centered ? 'grid-cols-1 text-center' : 'grid-cols-1 lg:grid-cols-[1.6fr_1fr]'}`}>
              <div className={`space-y-2 ${centered ? 'flex flex-col items-center' : ''}`}>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                  <SparklesIcon className="h-4 w-4" />
                  Fresh dining experience
                </div>
                {/* Restaurant name intentionally removed per request */}

                <div className="flex flex-wrap gap-1">
                  <Link to={`/menu/${restaurantId}?showCall=1`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-primary-700">
                    <PhoneIcon className="h-4 w-4" />
                    Call Waiter
                  </Link>

                  <Link to="/login?forceLogin=1" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-primary-700">
                    <SparklesIcon className="h-4 w-4" />
                    Staff Login
                  </Link>

                  <Link to={`/menu/${restaurantId}?showReview=1`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-primary-700">
                    <EnvelopeIcon className="h-4 w-4" />
                    Feedback
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Contact</h4>
                {(email || phone) && (
                  <div className="flex flex-col text-xs text-slate-700">
                    {email && (
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-primary-600" />
                        <span className="break-all">{email}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-2 mt-1">
                        <PhoneIcon className="h-4 w-4 text-primary-600" />
                        <span>{phone}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Address removed per request */}
              </div>

              {/* Support & branding removed per request */}
            </div>

            <div className="border-t border-slate-200 px-5 py-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
              © {new Date().getFullYear()} Digital Menu. All rights reserved.
            </div>
          </div>
        {/* </div> */}
      </footer>
    </>
  )
}
 
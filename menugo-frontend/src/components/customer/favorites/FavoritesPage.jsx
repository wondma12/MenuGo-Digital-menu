import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useLocalStorage from '../../../hooks/useLocalStorage'
import { useCartStore } from '../../../store/cartStore'
import Button from '../../common/Button'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useLocalStorage('favorites', [])
  const { addItem } = useCartStore()
  const navigate = useNavigate()
  const { restaurantId } = useParams()

  const handleRemove = (id) => {
    setFavorites((favorites || []).filter((f) => f.id !== id))
  }

  const handleAddToCart = (item) => {
    if (item && (item.is_available === false || item.available === false || item.isAvailable === false)) {
      // show user-friendly message when trying to add unavailable items
      // prefer using react-hot-toast but keep it simple here
      // import toast if not already present
      // we'll import toast below
      return toast.error('Item unavailable. Please select available menu item')
    }

    addItem({ ...item, quantity: 1 })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
          <div>
            <Button onClick={() => navigate(`/menu/${restaurantId}`)}>Back to Menu</Button>
          </div>
        </div>

        {(!favorites || favorites.length === 0) ? (
          <div className="text-center py-12">
            <img src="/assets/empty-states/empty-favorites.svg" alt="No favorites" className="w-44 h-44 mx-auto mb-4" />
            <p className="text-gray-500">You have no favorites yet. Tap the ♥ icon on items to save them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center"><svg className="w-8 h-8 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" /></svg></div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <div className="text-primary-600 font-bold">${(item.price || 0).toFixed(2)}</div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => handleAddToCart(item)}>Add to Cart</Button>
                      <button onClick={() => handleRemove(item.id)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-red-600">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

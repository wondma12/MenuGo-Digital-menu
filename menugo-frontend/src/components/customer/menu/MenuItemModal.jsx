import React, { useState } from 'react'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import ItemOptions from './ItemOptions'
import { useCartStore } from '../../../store/cartStore'
import toast from 'react-hot-toast'

const MenuItemModal = ({ item, onClose, restaurantId }) => {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [specialInstructions, setSpecialInstructions] = useState('')
  const { addItem } = useCartStore()

  const totalPrice = (item.price + Object.values(selectedOptions).reduce((sum, val) => sum + val, 0)) * quantity

  const handleAddToCart = () => {
    if (item && (item.is_available === false || item.available === false || item.isAvailable === false)) {
      toast.error('Item unavailable. Please select available menu item')
      return
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      selectedOptions,
      specialInstructions,
      image: item.image
    })
    toast.success('Added to cart')
    onClose()
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={item.name} size="md">
      <div className="space-y-4 max-w-full">
        {item.image && (
        <img src={item.image} alt={item.name} className="w-full h-36 sm:h-44 md:h-48 lg:h-56 object-cover rounded-lg" />
          )}
        
        <p className="text-gray-600">{item.description}</p>
        
        {item.options && item.options.length > 0 && (
          <ItemOptions options={item.options} onChange={setSelectedOptions} />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder="Any special requests?"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 bg-white"
            >
              -
            </button>
            <span className="w-8 text-center font-medium text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 bg-white"
            >
              +
            </button>
          </div>
          <div className="text-right mt-3 sm:mt-0">
            <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">Br {totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <Button onClick={handleAddToCart} fullWidth disabled={item && (item.is_available === false || item.available === false)} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">
          {item && (item.is_available === false || item.available === false) ? 'Unavailable' : 'Add to Cart'}
        </Button>
      </div>
    </Modal>
  )
}

export default MenuItemModal
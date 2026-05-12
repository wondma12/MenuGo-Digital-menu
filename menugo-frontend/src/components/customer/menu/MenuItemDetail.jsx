import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMenuItem } from '../../../services/menuService'
import { useCartStore } from '../../../store/cartStore'
import Button from '../../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const MenuItemDetail = () => {
  const { itemId } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await getMenuItem(itemId)
        if (mounted) setItem(res)
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [itemId])

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

  if (loading) return <div className="p-8"><LoadingSpinner /></div>
  if (!item) return <div className="p-8 text-center">Item not found</div>

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-sm">
      {item.image && <img src={item.image} alt={item.name} className="w-full h-64 object-cover rounded-md" />}
      <h1 className="text-2xl mt-4 font-semibold">{item.name}</h1>
      <p className="text-gray-600 mt-2">{item.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">${item.price?.toFixed(2)}</div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 border rounded text-gray-900 bg-white">-</button>
            <span className="text-gray-900">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 border rounded text-gray-900 bg-white">+</button>
        </div>
      </div>

      <div className="mt-4">
        <Button onClick={handleAdd} disabled={item.is_available === false || item.available === false || item.isAvailable === false}>
          {item.is_available === false || item.available === false || item.isAvailable === false ? 'Unavailable' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  )
}

export default MenuItemDetail

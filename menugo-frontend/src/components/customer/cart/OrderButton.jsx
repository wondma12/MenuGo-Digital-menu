import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import Button from '../../common/Button'
import { createOrder } from '../../../services/orderService'
import toast from 'react-hot-toast'

const OrderButton = ({ restaurantId, items, tableNumber, specialInstructions, totalAmount, orderType = 'dine_in', customerName = '', customerPhone = '', customerEmail = '', deliveryAddress = '', onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const mutation = useMutation(createOrder, {
    onSuccess: (data) => {
      toast.success('Order placed successfully!')
      onSuccess()
      // Auto-show the "chicken" category after placing an order
      navigate(`/menu/${restaurantId}?category=chicken`)
    },
    onError: (error) => {
      const resp = error?.response?.data
      if (resp) {
        const serverMsg = resp.message || 'Failed to place order'
        const details = resp.errors
        if (Array.isArray(details) && details.length > 0) {
          const detailMsg = details.map(d => `${d.field}: ${d.message}`).join(', ')
          toast.error(`${serverMsg} — ${detailMsg}`)
        } else {
          toast.error(serverMsg)
        }
      } else {
        toast.error('Failed to place order')
      }
    },
    onSettled: () => {
      setIsLoading(false)
    }
  })

  const handlePlaceOrder = () => {
    if (orderType === 'dine_in' && !tableNumber) {
      toast.error('Please enter your table number')
      return
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      toast.error('Please enter delivery address')
      return
    }

    // Client-side email validation: only allow empty or valid email
    const isValidEmail = (email) => {
      if (!email) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    if (!isValidEmail(customerEmail)) {
      toast.error('Please provide a valid email address')
      return
    }

    setIsLoading(true)
    // Normalize payload to backend expected snake_case shape
    const payload = {
      restaurant_id: restaurantId,
      items: items.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        special_instructions: item.specialInstructions || null,
        options: Array.isArray(item.selectedOptions)
          ? item.selectedOptions
          : Object.keys(item.selectedOptions || {}).length > 0
            ? Object.entries(item.selectedOptions).map(([name, price]) => ({ name, price_adjustment: price }))
            : [],
        modifiers: item.selectedModifiers || []
      })),
      table_number: tableNumber || null,
      special_instructions: specialInstructions || null,
      order_type: orderType,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_email: customerEmail && customerEmail.trim() !== '' ? customerEmail.trim() : null,
      delivery_address: deliveryAddress || null,
    }

    mutation.mutate(payload)
  }

  return (
    <Button
      onClick={handlePlaceOrder}
      isLoading={isLoading}
      fullWidth
      size="lg"
      className="mt-6"
    >
      Place Order
    </Button>
  )
}

export default OrderButton
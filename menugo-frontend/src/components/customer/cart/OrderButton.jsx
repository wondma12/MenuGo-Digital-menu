import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import Button from '../../common/Button'
import { createOrder } from '../../../services/orderService'
import toast from 'react-hot-toast'

const OrderButton = ({ restaurantId, items, tableNumber, specialInstructions, totalAmount, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const mutation = useMutation(createOrder, {
    onSuccess: (data) => {
      toast.success('Order placed successfully!')
      onSuccess()
      // Auto-show the "chicken" category after placing an order
      navigate(`/menu/${restaurantId}?category=chicken`)
    },
    onError: () => {
      toast.error('Failed to place order')
    },
    onSettled: () => {
      setIsLoading(false)
    }
  })

  const handlePlaceOrder = () => {
    if (!tableNumber) {
      toast.error('Please enter your table number')
      return
    }

    setIsLoading(true)
    mutation.mutate({
      restaurantId,
      items: items.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        selectedOptions: item.selectedOptions
      })),
      tableNumber,
      specialInstructions,
      totalAmount
    })
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
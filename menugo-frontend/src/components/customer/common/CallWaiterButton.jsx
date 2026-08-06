import React, { useState } from 'react'
import { createCustomerCall } from '../../../services/callService'
import { useCartStore } from '../../../store/cartStore'
import Button from '../../common/Button'
import toast from 'react-hot-toast'

const CallWaiterButton = ({ restaurantId }) => {
  const { tableNumber } = useCartStore()
  const [loading, setLoading] = useState(false)

  const handleCall = async (type = 'service') => {
    if (!tableNumber) {
      toast.error('Please enter your table number first')
      return
    }

    setLoading(true)
    try {
      await createCustomerCall(restaurantId, { table_number: tableNumber, call_type: type, customer_name: 'Guest' })
      toast.success('Waiter notified — someone will assist you shortly')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send call request'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <Button onClick={() => handleCall('service')} isLoading={loading} size="sm">
        Call Waiter
      </Button>
    </div>
  )
}

export default CallWaiterButton

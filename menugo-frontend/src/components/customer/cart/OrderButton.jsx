import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import Button from '../../common/Button'
import { createOrder } from '../../../services/orderService'
import { getPublicTables } from '../../../services/tableService'
import { getRestaurantDetails } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const formatMoney = (value) => `Br ${Number(value || 0).toFixed(2)}`

const getItemUnitPrice = (item) => {
  const basePrice = Number(item?.price || 0)
  const optionsPrice = Object.values(item?.selectedOptions || {}).reduce((sum, price) => sum + (Number(price) || 0), 0)
  return basePrice + optionsPrice
}

const downloadCustomerReceipt = ({ data, items, tableNumber, orderType, customerName, specialInstructions, totalAmount }) => {
  const orderNumber = data?.order_number || data?.orderNumber || data?.order_id || data?.orderId || 'new-order'
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 40
  const contentWidth = pageWidth - marginX * 2
  const bottomMargin = 48
  let cursorY = 44

  const ensureSpace = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage()
      cursorY = 44
    }
  }

  const writeLine = (text, options = {}) => {
    const fontSize = options.fontSize || 11
    const style = options.style || 'normal'
    doc.setFont('helvetica', style)
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(String(text), options.width || contentWidth)
    ensureSpace(lines.length * (fontSize + 4))
    doc.text(lines, marginX, cursorY)
    cursorY += lines.length * (fontSize + 4)
  }

  doc.setTextColor(20)
  writeLine('MenuGo Order Receipt', { fontSize: 18, style: 'bold' })
  cursorY += 6
  writeLine(`Order Number: ${orderNumber}`)
  writeLine(`Date: ${new Date().toLocaleString()}`)
  writeLine(`Customer: ${customerName || 'Guest'}`)
  writeLine(`Order Type: ${orderType}`)
  writeLine(`Table Number: ${tableNumber || 'N/A'}`)
  cursorY += 8
  writeLine('Items:', { fontSize: 13, style: 'bold' })

  let calculatedSubtotal = 0
  items.forEach((item, index) => {
    const qty = Number(item?.quantity || 0)
    const unitPrice = getItemUnitPrice(item)
    const lineTotal = unitPrice * qty
    calculatedSubtotal += lineTotal

    const itemName = item?.name || 'Item'
    const optionSummary = item?.selectedOptions && Object.keys(item.selectedOptions).length > 0
      ? ` (${Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${formatMoney(value)}`).join(', ')})`
      : ''

    writeLine(`${index + 1}. ${itemName}${optionSummary}`)
    writeLine(`   Qty: ${qty}   Unit: ${formatMoney(unitPrice)}   Line Total: ${formatMoney(lineTotal)}`)
    cursorY += 2
  })

  cursorY += 6
  writeLine(`Subtotal: ${formatMoney(calculatedSubtotal)}`, { style: 'bold' })
  writeLine(`Total: ${formatMoney(totalAmount)}`, { fontSize: 13, style: 'bold' })
  if (specialInstructions) {
    cursorY += 6
    writeLine('Special Instructions:', { style: 'bold' })
    writeLine(specialInstructions)
  }

  doc.save(`order-${orderNumber}.pdf`)
}

const OrderButton = ({ restaurantId, items, tableNumber, specialInstructions, totalAmount, orderType = 'dine_in', customerName = '', customerPhone = '', customerEmail = '', deliveryAddress = '', onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const mutation = useMutation(createOrder, {
    onSuccess: (data) => {
      downloadCustomerReceipt({
        data,
        items,
        tableNumber,
        orderType,
        customerName,
        specialInstructions,
        totalAmount,
      })
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

    const placeOrder = async () => {
      let resolvedRestaurantId = restaurantId
      if (orderType === 'dine_in') {
        const restaurant = await getRestaurantDetails(restaurantId)
        resolvedRestaurantId = restaurant?.id || restaurantId
        let tables = []
        try {
          tables = await getPublicTables(resolvedRestaurantId)
        } catch (publicTablesError) {
          tables = Array.isArray(restaurant?.tables) ? restaurant.tables : []
        }

        if (!Array.isArray(tables) || tables.length === 0) {
          tables = Array.isArray(restaurant?.tables) ? restaurant.tables : []
        }

        const normalizedTableNumber = String(tableNumber).trim()
        const selectedTable = (Array.isArray(tables) ? tables : []).find((table) => {
          const tableValue = String(table?.tableNumber ?? table?.table_number ?? table?.number ?? table?.tableNo ?? table?.table_no ?? '').trim()
          return tableValue === normalizedTableNumber
        })

        if (!selectedTable) {
          toast.error('Please enter the correct table number')
          return
        }

        // Only verify the selected table exists and belongs to this restaurant.
        // Do not block ordering based on the current table status (occupied/available).
      }

      setIsLoading(true)
      // Normalize payload to backend expected snake_case shape
      const payload = {
        restaurant_id: resolvedRestaurantId,
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

    placeOrder().catch((error) => {
      console.error('Failed to validate table before placing order', error)
      toast.error('Unable to verify table number right now')
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
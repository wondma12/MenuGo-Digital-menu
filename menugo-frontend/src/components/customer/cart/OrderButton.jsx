import {useState} from 'react'
import { useMutation } from 'react-query'
import jsPDF from 'jspdf'
import Button from '../../common/Button'
import { createOrder } from '../../../services/orderService'
import { getPublicTables } from '../../../services/tableService'
import { getRestaurantDetails } from '../../../services/restaurantService'
import toast from 'react-hot-toast'
import ReceiptModal from './ReceiptModal'

const formatMoney = (value) => `Br ${Number(value || 0).toFixed(2)}`

const getItemUnitPrice = (item) => {
  const basePrice = Number(item?.price || 0)
  const optionsPrice = Object.values(item?.selectedOptions || {}).reduce((sum, price) => sum + (Number(price) || 0), 0)
  return basePrice + optionsPrice
}

const loadImageDataUrl = async (src) => {
  if (!src) return null
  if (src.startsWith('data:image')) return src

  try {
    const response = await fetch(src, { mode: 'cors' })
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const downloadCustomerReceipt = async ({ data, items, tableNumber, orderType, customerName, specialInstructions, totalAmount, restaurant = {} }) => {
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
    const align = options.align || 'left'
    const color = options.color || [20, 20, 20]
    
    doc.setFont('helvetica', style)
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    
    const lines = doc.splitTextToSize(String(text), options.width || contentWidth)
    ensureSpace(lines.length * (fontSize + 4))
    
    if (align === 'center') {
      doc.text(lines, pageWidth / 2, cursorY, { align: 'center' })
    } else {
      doc.text(lines, marginX, cursorY)
    }
    cursorY += lines.length * (fontSize + 4)
  }

  // Header with restaurant branding
  const logoDataUrl = await loadImageDataUrl(restaurant?.logo || restaurant?.logoUrl || restaurant?.logo_url)
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', pageWidth / 2 - 28, cursorY, 56, 56)
      cursorY += 68
    } catch (error) {
      console.warn('Receipt logo could not be embedded', error)
    }
  }

  doc.setTextColor(230, 126, 34)
  writeLine(restaurant?.name || restaurant?.restaurant_name || 'MenuGo', { fontSize: 24, style: 'bold', align: 'center' })
  doc.setTextColor(100, 100, 100)
  if (restaurant?.location) writeLine(restaurant.location, { fontSize: 10, align: 'center' })
  if (restaurant?.contact_phone) writeLine(restaurant.contact_phone, { fontSize: 10, align: 'center' })
  
  cursorY += 6
  
  // Divider line
  doc.setDrawColor(230, 126, 34)
  doc.setLineWidth(1)
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY)
  cursorY += 8

  // Order details
  doc.setFillColor(255, 247, 237)
  doc.roundedRect(marginX, cursorY, contentWidth, 28, 6, 6, 'F')
  cursorY += 19
  doc.setTextColor(194, 65, 12)
  writeLine('ORDER RECEIPT', { fontSize: 14, style: 'bold', align: 'center' })
  cursorY += 4
  
  writeLine(`Order #: ${orderNumber}`)
  writeLine(`Date: ${new Date().toLocaleString()}`)
  writeLine(`Type: ${orderType.replace('_', ' ').toUpperCase()}`)
  if (tableNumber) writeLine(`Table: ${tableNumber}`)
  if (customerName) writeLine(`Customer: ${customerName}`)
  
  let calculatedSubtotal = 0
  const columnWidths = [28, contentWidth - 225, 45, 75, 77]
  const columnX = columnWidths.reduce((positions, width, index) => {
    positions.push((positions[index - 1] || marginX) + (index ? columnWidths[index - 1] : 0))
    return positions
  }, [])
  const drawTableHeader = () => {
    doc.setFillColor(31, 42, 68)
    doc.rect(marginX, cursorY, contentWidth, 24, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('#', columnX[0] + 8, cursorY + 16)
    doc.text('Item', columnX[1] + 6, cursorY + 16)
    doc.text('Qty', columnX[2] + columnWidths[2] - 8, cursorY + 16, { align: 'right' })
    doc.text('Unit Price', columnX[3] + columnWidths[3] - 4, cursorY + 16, { align: 'right' })
    doc.text('Amount', columnX[4] + columnWidths[4], cursorY + 16, { align: 'right' })
    doc.setDrawColor(120, 130, 150)
    for (let index = 1; index < columnX.length; index += 1) {
      doc.line(columnX[index], cursorY, columnX[index], cursorY + 24)
    }
    cursorY += 24
  }

  drawTableHeader()
  items.forEach((item, index) => {
    const qty = Number(item?.quantity || 0)
    const basePrice = Number(item?.price || 0)
    const optionsPrice = Object.values(item?.selectedOptions || {}).reduce((sum, price) => sum + (Number(price) || 0), 0)
    const unitPrice = basePrice + optionsPrice
    const lineTotal = unitPrice * qty
    calculatedSubtotal += lineTotal

    const itemName = item?.name || 'Item'
    const optionText = item?.selectedOptions && Object.keys(item.selectedOptions).length > 0
      ? Object.entries(item.selectedOptions).map(([key, value]) => `${key}: Br ${Number(value || 0).toFixed(2)}`).join(', ')
      : ''
    const itemLines = doc.splitTextToSize(`${itemName}${optionText ? ` (${optionText})` : ''}`, columnWidths[1] - 12)
    const rowHeight = Math.max(28, itemLines.length * 11 + 12)
    ensureSpace(rowHeight)
    doc.setFillColor(index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 250 : 255, 252)
    doc.rect(marginX, cursorY, contentWidth, rowHeight, 'F')
    doc.setDrawColor(220, 225, 232)
    doc.rect(marginX, cursorY, contentWidth, rowHeight)
    for (let columnIndex = 1; columnIndex < columnX.length; columnIndex += 1) {
      doc.line(columnX[columnIndex], cursorY, columnX[columnIndex], cursorY + rowHeight)
    }
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(String(index + 1), columnX[0] + 8, cursorY + 17)
    doc.setFont('helvetica', 'bold')
    doc.text(itemLines, columnX[1] + 6, cursorY + 14)
    doc.setFont('helvetica', 'normal')
    doc.text(String(qty), columnX[2] + columnWidths[2] - 8, cursorY + 17, { align: 'right' })
    doc.text(`Br ${unitPrice.toFixed(2)}`, columnX[3] + columnWidths[3] - 4, cursorY + 17, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(`Br ${lineTotal.toFixed(2)}`, columnX[4] + columnWidths[4], cursorY + 17, { align: 'right' })
    cursorY += rowHeight
  })

  cursorY += 10
  cursorY += 4

  // Special instructions
  if (specialInstructions) {
    doc.setTextColor(230, 126, 34)
    writeLine('SPECIAL INSTRUCTIONS', { fontSize: 11, style: 'bold' })
    doc.setTextColor(20, 20, 20)
    writeLine(specialInstructions, { fontSize: 10 })
    cursorY += 4
    writeLine('-'.repeat(50))
    cursorY += 4
  }

  // Totals
  doc.setTextColor(20, 20, 20)
  writeLine(`Subtotal: Br ${calculatedSubtotal.toFixed(2)}`, { style: 'bold' })
  doc.setTextColor(230, 126, 34)
  writeLine(`TOTAL: Br ${totalAmount.toFixed(2)}`, { fontSize: 14, style: 'bold' })

  // Footer
  cursorY += 8
  doc.setTextColor(100, 100, 100)
  writeLine('Thank you for your order!', { fontSize: 11, align: 'center', style: 'italic' })
  writeLine('Enjoy your meal!', { fontSize: 10, align: 'center' })

  doc.save(`MenuGo-Receipt-${orderNumber}.pdf`)
}

const OrderButton = ({ restaurantId, items, tableNumber, specialInstructions, totalAmount, orderType = 'dine_in', customerName = '', customerPhone = '', customerEmail = '', deliveryAddress = '', restaurant = {}, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)

  const mutation = useMutation(createOrder, {
    onSuccess: async (data) => {
      try {
        await downloadCustomerReceipt({
          data,
          items,
          tableNumber,
          orderType,
          customerName,
          specialInstructions,
          totalAmount,
          restaurant,
        })
        toast.success('Order placed successfully! Receipt downloaded.')
      } catch (error) {
        console.error('Automatic receipt download failed:', error)
        toast.success('Order placed successfully! Receipt is ready below.')
      }
      setReceiptOrder(data)
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
      const restaurantDetails = await getRestaurantDetails(restaurantId)
      resolvedRestaurantId = restaurantDetails?.id || restaurantId

      if (orderType === 'dine_in') {
        let tables = []
        try {
          tables = await getPublicTables(resolvedRestaurantId)
        } catch (publicTablesError) {
          tables = Array.isArray(restaurantDetails?.tables) ? restaurantDetails.tables : []
        }

        if (!Array.isArray(tables) || tables.length === 0) {
          tables = Array.isArray(restaurantDetails?.tables) ? restaurantDetails.tables : []
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
    <>
      <Button
        onClick={handlePlaceOrder}
        isLoading={isLoading}
        fullWidth
        size="lg"
        className="mt-6 rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600"
      >
        Place Order
      </Button>
      <ReceiptModal
        isOpen={Boolean(receiptOrder)}
        onClose={() => {
          setReceiptOrder(null)
          onSuccess()
        }}
        order={receiptOrder}
        restaurant={restaurant}
        items={items}
        totalAmount={totalAmount}
        orderType={orderType}
        tableNumber={tableNumber}
        specialInstructions={specialInstructions}
      />
    </>
  )
}

export default OrderButton
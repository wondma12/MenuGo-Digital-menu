import {useRef} from 'react'
import { X, Printer } from 'lucide-react'
import Button from '../../common/Button'

const ReceiptModal = ({ isOpen, onClose, order, restaurant, items, totalAmount, orderType, tableNumber, specialInstructions }) => {
  const receiptRef = useRef()

  if (!isOpen) return null

  const orderNumber = order?.order_number || order?.orderNumber || order?.order_id || order?.orderId || 'N/A'
  const orderDate = new Date(order?.created_at || order?.createdAt || Date.now()).toLocaleString()
  const restaurantLogo = restaurant?.logo || restaurant?.logo_url || restaurant?.logoUrl || null
  const restaurantName = restaurant?.name || restaurant?.restaurant_name || 'MenuGo'
  const normalizedOrderType = String(orderType || 'dine_in').replace('_', ' ').toUpperCase()
  
  const handlePrint = () => {
    if (!receiptRef.current) return
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write(receiptRef.current.innerHTML)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-none sm:rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#1f2a44] px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-white font-black text-xl">Order Receipt</h2>
          <button onClick={onClose} className="text-white hover:bg-orange-800 p-1 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-8 bg-white">
          {/* Restaurant Header */}
          <div className="text-center mb-6 pb-5 border-b border-slate-200">
            {restaurantLogo && (
              <img
                src={restaurantLogo}
                alt={restaurantName}
                className="h-16 w-16 mx-auto mb-3 rounded-full object-cover shadow-md border border-slate-200"
              />
            )}
            <h1 className="text-3xl font-black text-[#1f2a44] uppercase mb-1">{restaurantName}</h1>
            <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">Order Receipt</p>
            {restaurant?.location && (
              <p className="text-sm text-slate-600">{restaurant.location}</p>
            )}
            {restaurant?.contact_phone && (
              <p className="text-sm text-slate-600">{restaurant.contact_phone}</p>
            )}
          </div>

          {/* Order Details */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 border border-slate-300 bg-slate-50 text-sm">
            <div className="p-3 border-b md:border-b-0 md:border-r border-slate-300">
              <span className="text-slate-600 font-medium">Order #</span>
              <span className="block font-bold text-slate-900 break-all">{orderNumber}</span>
            </div>
            <div className="p-3 border-b md:border-b-0 md:border-r border-slate-300">
              <span className="text-slate-600 font-medium">Type</span>
              <span className="block text-slate-900">{normalizedOrderType}</span>
            </div>
            <div className="p-3 border-b md:border-b-0 md:border-r border-slate-300">
              <span className="text-slate-600 font-medium">Customer</span>
              <span className="block text-slate-900">{order?.customer_name || order?.customerName || 'Guest'}</span>
            </div>
            <div className="p-3 border-b md:border-b-0 md:border-r border-slate-300">
              <span className="text-slate-600 font-medium">Date</span>
              <span className="block text-slate-900">{orderDate}</span>
            </div>
            <div className="p-3">
                <span className="text-slate-600 font-medium">Table</span>
                <span className="block text-slate-900">{tableNumber || '-'}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[2rem_minmax(0,1fr)_4rem_7rem_7rem] gap-2 bg-[#1f2a44] text-white text-sm font-bold px-3 py-3">
                  <span>#</span><span>Item</span><span className="text-right">Qty</span><span className="text-right">Unit Price</span><span className="text-right">Amount</span>
                </div>
                <div>
                  {items.map((item, index) => {
                const qty = Number(item?.quantity || 0)
                const basePrice = Number(item?.price || 0)
                const optionsPrice = Object.values(item?.selectedOptions || {}).reduce((sum, price) => sum + (Number(price) || 0), 0)
                const unitPrice = basePrice + optionsPrice
                const lineTotal = unitPrice * qty

                    return (
                      <div key={index} className="grid grid-cols-[2rem_minmax(0,1fr)_4rem_7rem_7rem] gap-2 items-start border-x border-b border-slate-200 px-3 py-3 text-sm">
                      <span className="text-slate-700">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 break-words">{item?.name}</p>
                        {item?.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            {Object.entries(item.selectedOptions)
                              .map(([key, value]) => `${key}: Br ${Number(value || 0).toFixed(2)}`)
                              .join(' • ')}
                          </p>
                        )}
                      </div>
                      <span className="text-right text-slate-900">{qty}</span>
                      <span className="text-right text-slate-900 whitespace-nowrap">Br {unitPrice.toFixed(2)}</span>
                      <span className="text-right font-bold text-slate-900 whitespace-nowrap">Br {lineTotal.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {specialInstructions && (
            <div className="mb-6 pb-6 border-b-2 border-orange-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Special Instructions</p>
              <p className="text-sm text-slate-900 italic">{specialInstructions}</p>
            </div>
          )}

          {/* Totals */}
          <div className="space-y-3 p-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="text-slate-900">Br {(totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-[#d99000] pt-3">
              <span className="text-slate-900">Total</span>
              <span className="text-[#1f2a44]">Br {(totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-orange-200 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900">Thank you for your order!</p>
            <p className="text-xs text-slate-500">Enjoy your meal! 🍽️</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 flex gap-3 border-t">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Print
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal

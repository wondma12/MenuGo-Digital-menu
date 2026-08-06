import {useRef} from 'react'
import { X, Download, Printer } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Button from '../../common/Button'

const ReceiptModal = ({ isOpen, onClose, order, restaurant, items, totalAmount, orderType, tableNumber, specialInstructions }) => {
  const receiptRef = useRef()

  if (!isOpen) return null

  const orderNumber = order?.order_number || order?.orderNumber || order?.order_id || order?.orderId || 'N/A'
  const orderDate = new Date(order?.created_at || order?.createdAt || Date.now()).toLocaleString()
  
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      pdf.save(`MenuGo-Receipt-${orderNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handlePrint = () => {
    if (!receiptRef.current) return
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write(receiptRef.current.innerHTML)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-black text-xl">Order Receipt</h2>
          <button onClick={onClose} className="text-white hover:bg-orange-800 p-1 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-8 bg-white">
          {/* Restaurant Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-orange-200">
            {restaurant?.logo && (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-16 w-16 mx-auto mb-3 rounded-full object-cover shadow-md"
              />
            )}
            <h1 className="text-3xl font-black text-orange-600 mb-1">{restaurant?.name || 'MenuGo'}</h1>
            {restaurant?.location && (
              <p className="text-sm text-slate-600">{restaurant.location}</p>
            )}
            {restaurant?.contact_phone && (
              <p className="text-sm text-slate-600">{restaurant.contact_phone}</p>
            )}
          </div>

          {/* Order Details */}
          <div className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Order #</span>
              <span className="font-bold text-slate-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Date</span>
              <span className="text-slate-900">{orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Order Type</span>
              <span className="text-slate-900 capitalize">{orderType?.replace('_', ' ')}</span>
            </div>
            {tableNumber && (
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Table</span>
                <span className="text-slate-900">Table {tableNumber}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-6 pb-6 border-b-2 border-orange-200">
            <h3 className="font-bold text-slate-900 mb-4 text-base">Order Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => {
                const qty = Number(item?.quantity || 0)
                const basePrice = Number(item?.price || 0)
                const optionsPrice = Object.values(item?.selectedOptions || {}).reduce((sum, price) => sum + (Number(price) || 0), 0)
                const unitPrice = basePrice + optionsPrice
                const lineTotal = unitPrice * qty

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item?.name}</p>
                        {item?.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            {Object.entries(item.selectedOptions)
                              .map(([key, value]) => `${key}: Br ${Number(value || 0).toFixed(2)}`)
                              .join(' • ')}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 ml-2">Br {lineTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-600">Qty: {qty} × Br {unitPrice.toFixed(2)}</p>
                  </div>
                )
              })}
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
          <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="text-slate-900">Br {(totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-orange-200 pt-3">
              <span className="text-slate-900">Total</span>
              <span className="text-orange-600">Br {(totalAmount).toFixed(2)}</span>
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
            onClick={handleDownloadPDF}
            className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download
          </Button>
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

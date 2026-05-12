import React, { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { generateRestaurantQRCode, downloadQRCode } from '../../../services/qrService'

export default function RestaurantQRCodePage() {
  const { user } = useAuthStore()
  const defaultRestaurantId = user?.restaurant_id || user?.restaurant?.id || ''

  const [restaurantId, setRestaurantId] = useState(defaultRestaurantId)
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [route, setRoute] = useState('menu')
  const [tableNumber, setTableNumber] = useState('')
  const [orderIdInput, setOrderIdInput] = useState('')

  const handleGenerate = async () => {
    if (!restaurantId) {
      setError('Restaurant ID is required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Build options for route/table/order
      const options = { route }
      if (route === 'table' && tableNumber) options.table = tableNumber
      if (route === 'order' && orderIdInput) options.orderId = orderIdInput

      const response = await generateRestaurantQRCode(restaurantId, options)
      // service normalizes to return data payload directly
      const payload = response?.data || response
      setQrData(payload)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to generate QR')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!qrData) return
    setError(null)
    try {
      // Prefer server-provided image URL or base64
      const imgUrl = qrData.qr_image_url || (qrData.qr_code && qrData.qr_code.qr_image_url)
      if (imgUrl) {
        const res = await fetch(imgUrl)
        const blob = await res.blob()
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `restaurant-${restaurantId}-qr.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(link.href)
        return
      }

      if (qrData.qr_base64) {
        const link = document.createElement('a')
        link.href = `data:image/png;base64,${qrData.qr_base64}`
        link.download = `restaurant-${restaurantId}-qr.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
        return
      }

      // Fallback: call backend download endpoint to get blob
      const blob = await downloadQRCode(restaurantId, null, 'png')
      if (blob) {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `restaurant-${restaurantId}-qr.png`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(link.href)
        return
      }

      setError('No QR image available to download')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Download failed')
    }
  }

  const handlePrint = () => {
    if (!qrData) return
    setError(null)

    const openPrintWindowWithSrc = (imgSrc) => {
      const w = window.open('', '_blank')
      if (!w) {
        setError('Unable to open print window')
        return
      }
      w.document.write(`<html><head><title>Print QR</title></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0">`)
      w.document.write(`<img src="${imgSrc}" style="max-width:80%;height:auto" />`)
      w.document.write('</body></html>')
      w.document.close()
      w.focus()
      w.print()
      w.close()
    }

    const url = qrData.qr_image_url || (qrData.qr_code && qrData.qr_code.qr_image_url)
    if (url) {
      openPrintWindowWithSrc(url)
      return
    }

    if (qrData.qr_base64) {
      openPrintWindowWithSrc(`data:image/png;base64,${qrData.qr_base64}`)
      return
    }

    // Fallback: fetch blob from backend and print via object URL
    downloadQRCode(restaurantId, null, 'png')
      .then((blob) => {
        if (!blob) throw new Error('No blob returned')
        const urlObj = URL.createObjectURL(blob)
        openPrintWindowWithSrc(urlObj)
        // revoke after slight delay to ensure print window uses it
        setTimeout(() => URL.revokeObjectURL(urlObj), 30000)
      })
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Print failed'))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Restaurant QR Code</h1>

      <div className="max-w-xl bg-white shadow rounded p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant ID</label>
        <input
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Enter restaurant ID (or use your account's restaurant)"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Route</label>
            <select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="menu">Menu Home</option>
              <option value="customer">Customer Home</option>
              <option value="cart">Cart</option>
              <option value="table">Table (append ?table=)</option>
              <option value="order">Order (open specific order)</option>
              <option value="history">Order History</option>
              <option value="root">Customer Root (legacy)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            {route === 'table' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. 12" />
              </div>
            )}

            {route === 'order' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <input value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="existing order id (optional)" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded"
          >
            {loading ? 'Generating...' : 'Generate QR'}
          </button>

          {qrData && (
            <>
              <button onClick={handleDownload} className="px-4 py-2 bg-gray-700 text-white rounded">Download</button>
              <button onClick={handlePrint} className="px-4 py-2 bg-gray-500 text-white rounded">Print</button>
            </>
          )}
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        {qrData && (
          <div className="mt-4 text-center">
            <div className="inline-block bg-white p-4 rounded shadow">
              {qrData.qr_image_url ? (
                <img src={qrData.qr_image_url} alt="Restaurant QR" className="w-64 h-64 object-contain" />
              ) : qrData.qr_base64 ? (
                <img src={`data:image/png;base64,${qrData.qr_base64}`} alt="Restaurant QR" className="w-64 h-64 object-contain" />
              ) : (
                <div className="text-sm text-gray-500">QR generated (no image url)</div>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-600 break-all">{qrData.qr_code?.url || qrData.download_url || ''}</div>
          </div>
        )}
      </div>
    </div>
  )
}

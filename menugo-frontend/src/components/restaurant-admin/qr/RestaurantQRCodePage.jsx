import React, { useMemo, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { downloadQRCode, generateRestaurantQRCode } from '../../../services/qrService'
import { getQrTargetUrl, normalizeQrImageSrc } from '../../../utils/qr'
import Button from '../../../common/Button'

const triggerBlobDownload = (blob, fileName) => {
  const link = document.createElement('a')
  const objectUrl = URL.createObjectURL(blob)
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export default function RestaurantQRCodePage() {
  const { user } = useAuthStore()
  const defaultRestaurantId =
    user?.restaurant_id ||
    user?.restaurantId ||
    user?.restaurant?.id ||
    user?.restaurant?.restaurant_id ||
    ''

  const [restaurantId, setRestaurantId] = useState(defaultRestaurantId)
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const qrImageSrc = useMemo(
    () => normalizeQrImageSrc(
      qrData?.qr_image_url ||
      qrData?.qr_data_url ||
      qrData?.qr_base64 ||
      qrData?.qr_code?.qr_image_url
    ),
    [qrData]
  )

  const qrTargetUrl = useMemo(
    () => getQrTargetUrl(qrData) || qrData?.download_url || '',
    [qrData]
  )

  const restaurant = user?.restaurant || user?.restaurant_data || null

  const handleGenerate = async () => {
    if (!restaurantId?.trim()) {
      setError('Restaurant ID is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = await generateRestaurantQRCode(restaurantId.trim(), { route: 'menu' })
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
      const blob = await downloadQRCode(qrData)
      triggerBlobDownload(blob, `restaurant-${restaurantId}-qr.png`)
    } catch (err) {
      try {
        if (!qrImageSrc) throw err

        if (qrImageSrc.startsWith('data:image')) {
          const link = document.createElement('a')
          link.href = qrImageSrc
          link.download = `restaurant-${restaurantId}-qr.png`
          document.body.appendChild(link)
          link.click()
          link.remove()
          return
        }

        const imageResponse = await fetch(qrImageSrc)
        const blob = await imageResponse.blob()
        triggerBlobDownload(blob, `restaurant-${restaurantId}-qr.png`)
      } catch (fallbackError) {
        setError(
          fallbackError?.response?.data?.message ||
          fallbackError?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Download failed'
        )
      }
    }
  }

  const handlePrint = async () => {
    if (!qrData) return

    setError(null)

    const openPrintWindowWithSrc = (imgSrc) => {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setError('Unable to open print window')
        return
      }

      printWindow.document.write('<html><head><title>Print QR</title></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0">')
      printWindow.document.write(`<img src="${imgSrc}" alt="Restaurant QR" style="max-width:80%;height:auto" />`)
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }

    try {
      if (qrImageSrc) {
        openPrintWindowWithSrc(qrImageSrc)
        return
      }

      const blob = await downloadQRCode(qrData)
      const objectUrl = URL.createObjectURL(blob)
      openPrintWindowWithSrc(objectUrl)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Print failed')
    }
  }

  return (
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        {/* <div className="max-w-4xl rounded-none border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"> */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant QR</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Restaurant QR Code</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">
              Generate, preview, download, and print the menu QR code using the same analytics styling.
            </p>
          </div>

          <div className="mt-6 space-y-4 rounded-none border border-slate-200 bg-slate-50 p-4">
            <label className="block text-sm font-medium text-slate-700">Restaurant ID</label>
            <input
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="Enter restaurant ID (or use your account's restaurant)"
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerate} isLoading={loading} className="rounded-none">
                {loading ? 'Generating...' : 'Generate QR'}
              </Button>

              {qrData && (
                <>
                  <Button onClick={handleDownload} variant="secondary" className="rounded-none">
                    Download
                  </Button>
                  <Button onClick={handlePrint} variant="outline" className="rounded-none">
                    Print
                  </Button>
                </>
              )}
            </div>

            {error && <div className="text-sm font-medium text-rose-500">{error}</div>}
          </div>

          {qrData && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[auto,1fr] lg:items-start">
              <div className="inline-flex justify-center rounded-none border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  {restaurant?.logo ? (
                    <img src={restaurant.logo} alt={restaurant.name || 'Restaurant logo'} className="h-20 w-20 rounded-none object-cover shadow-sm" />
                  ) : null}

                  {qrImageSrc ? (
                    <img src={qrImageSrc} alt="Restaurant QR" className="h-56 w-56 object-contain" />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center text-sm text-slate-500">
                      QR generated, but the image preview is unavailable.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">Landing page URL</p>
                  <div className="break-all text-sm text-slate-600">
                    {qrTargetUrl ? (
                      <a href={qrTargetUrl} target="_blank" rel="noreferrer" className="font-medium text-orange-600 hover:text-orange-700">
                        {qrTargetUrl}
                      </a>
                    ) : qrData?.download_url ? (
                      <span className="text-slate-700">{qrData.download_url}</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {qrTargetUrl && (
                    <Button onClick={() => window.open(qrTargetUrl, '_blank')}>
                      Preview Landing Page
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        {/* </div> */}
      </div>
    </div>
  )
}

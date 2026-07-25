import React, { useMemo, useRef, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { generateRestaurantQRCode } from '../../../services/qrService'
import { getQrTargetUrl } from '../../../utils/qr'
import Button from '../../../common/Button'
import QRCode from 'react-qr-code'
import html2canvas from 'html2canvas'

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
  const welcomeCardRef = useRef(null)

  const qrTargetUrl = useMemo(
    () => getQrTargetUrl(qrData) || qrData?.download_url || '',
    [qrData]
  )

  const restaurant = user?.restaurant || user?.restaurant_data || null
  const restaurantName =
    restaurant?.name ||
    restaurant?.restaurant_name ||
    user?.restaurant_name ||
    'Our Restaurant'
  const restaurantLogo =
    restaurant?.logo ||
    restaurant?.logoUrl ||
    restaurant?.logo_url ||
    user?.restaurant_logo ||
    ''

  const renderWelcomeCard = async () => {
    if (!welcomeCardRef.current) throw new Error('Welcome card is not ready')

    return html2canvas(welcomeCardRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    })
  }

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
      const canvas = await renderWelcomeCard()
      const link = document.createElement('a')
      link.download = `restaurant-${restaurantId}-welcome-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      setError(err?.message || 'Download failed')
    }
  }

  const handlePrint = async () => {
    if (!qrData) return

    setError(null)

    try {
      const canvas = await renderWelcomeCard()
      const printWindow = window.open('', '_blank')
      if (!printWindow) throw new Error('Unable to open print window')

      printWindow.document.write('<html><head><title>Restaurant Welcome QR</title><style>@page{margin:0}body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}img{max-width:100%;height:auto}</style></head><body>')
      printWindow.document.write(`<img src="${canvas.toDataURL('image/png')}" alt="${restaurantName} welcome QR" />`)
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      printWindow.focus()
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
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
              Create a ready-to-print welcome sign with your restaurant name, logo, and menu QR code.
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
              <div ref={welcomeCardRef} className="w-full max-w-[390px] border border-slate-300 bg-white p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.1)] sm:p-8">
                <div className="border border-slate-200 p-5 sm:p-7">
                  {restaurantLogo ? (
                    <img src={restaurantLogo} alt={`${restaurantName} logo`} crossOrigin="anonymous" className="mx-auto mb-4 h-20 w-20 object-contain" />
                  ) : null}
                  <h2 className="font-serif text-2xl font-semibold uppercase tracking-[0.18em] text-slate-700">{restaurantName}</h2>
                  <div className="my-4 flex items-center justify-center gap-3 text-slate-400">
                    <span className="h-px w-10 bg-slate-300" />
                    <span className="font-serif text-sm italic">Welcome &amp; Enjoy</span>
                    <span className="h-px w-10 bg-slate-300" />
                  </div>
                  <p className="mb-4 font-serif text-base tracking-[0.12em] text-slate-500">Scan to View Our Menu</p>
                  <div className="mx-auto w-fit border border-slate-200 p-3">
                    {qrTargetUrl ? <QRCode value={qrTargetUrl} size={190} /> : <div className="h-[190px] w-[190px]" />}
                  </div>
                  <p className="mt-5 font-serif text-xs italic tracking-[0.12em] text-slate-400">Fresh · Delicious · Homemade</p>
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

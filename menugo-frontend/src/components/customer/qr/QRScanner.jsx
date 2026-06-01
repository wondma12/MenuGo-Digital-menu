import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Button from '../../common/Button'

const QRScanner = () => {
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    })

    scanner.render(
      (decodedText) => {
        // Try to extract /menu/:identifier and preserve any trailing path/query (e.g. /cart or ?table=)
        const menuMatch = decodedText.match(/\/menu\/([^/?#\s]+)([^\s]*)?/i)
        if (menuMatch && menuMatch[1]) {
          const id = menuMatch[1]
          const suffix = menuMatch[2] || ''
          navigate(`/menu/${id}${suffix}`)
        } else {
          // Fallback: look for ?restaurant=identifier in querystring
          const rootMatch = decodedText.match(/[?&]restaurant=([^&#\s]+)/i)
          if (rootMatch && rootMatch[1]) {
            navigate(`/menu/${rootMatch[1]}`)
          } else {
            setError('Invalid QR code. Please scan a valid restaurant menu QR code.')
          }
        }
        scanner.clear()
        setScanning(false)
      },
      (error) => {
        console.error(error)
      }
    )

    return () => {
      scanner.clear()
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Scan QR Code</h1>
          <p className="text-gray-500 text-center mb-6">Position the QR code in front of the camera</p>
          
          <div id="qr-reader" className="w-full" />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
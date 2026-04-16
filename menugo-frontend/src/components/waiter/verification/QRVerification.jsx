import React, { useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

const QRVerification = ({ onCodeScanned }) => {
  const [scanning, setScanning] = useState(true)
  const scannerRef = useRef(null)

  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    })

    scanner.render(
      (decodedText) => {
        onCodeScanned(decodedText)
        scanner.clear()
        setScanning(false)
      },
      (error) => {
        console.error(error)
      }
    )

    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [onCodeScanned])

  return (
    <div className="space-y-4">
      <div id="qr-reader" className="w-full" />
      {scanning && (
        <p className="text-sm text-gray-500 text-center">
          Position the QR code in front of the camera
        </p>
      )}
    </div>
  )
}

export default QRVerification
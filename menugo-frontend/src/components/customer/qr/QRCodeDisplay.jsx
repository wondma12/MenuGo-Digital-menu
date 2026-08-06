import {useRef} from 'react'
import QRCode from 'react-qr-code'
import Button from '../../common/Button'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import html2canvas from 'html2canvas'

const QRCodeDisplay = ({ value, size = 200 }) => {
  const qrRef = useRef()

  const handleDownload = async () => {
    if (qrRef.current) {
      const canvas = await html2canvas(qrRef.current)
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="text-center">
      <div ref={qrRef} className="inline-block bg-white p-4 rounded-lg shadow-md">
        <QRCode value={value} size={size} />
      </div>
      <div className="mt-4">
        <Button onClick={handleDownload} variant="outline" icon={ArrowDownTrayIcon}>
          Download QR Code
        </Button>
      </div>
    </div>
  )
}

export default QRCodeDisplay

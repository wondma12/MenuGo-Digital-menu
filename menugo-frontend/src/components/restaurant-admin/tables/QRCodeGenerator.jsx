import React, { useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { useMutation } from 'react-query'
import Modal from '../../../common/Modal'
import Button from '../../../common/Button'
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { generateRestaurantQRCode } from '../../../services/qrService'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'

const QRCodeGenerator = ({ isOpen, onClose, table }) => {
  const qrRef = useRef()
  const [qrUrl, setQrUrl] = useState(null)

  const generateMutation = useMutation(generateRestaurantQRCode, {
    onSuccess: (data) => {
      // data expected: { qr_code, qr_image_url, qr_base64 }
      const payload = data || {}
      const qrTarget = payload.qr_code?.url || payload.url || payload.qr_image_url || payload.qr_base64
      setQrUrl(qrTarget)
      toast.success('QR Code generated successfully')
    },
  })

  const handleGenerate = () => {
    const restaurantId = table?.restaurant_id || table?.restaurantId
    if (!restaurantId) return toast.error('Restaurant ID not available')
    generateMutation.mutate(restaurantId)
  }

  const handleDownload = async () => {
    if (qrRef.current) {
      const canvas = await html2canvas(qrRef.current)
      const link = document.createElement('a')
      link.download = `table_${table.tableNumber}_qr.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success('QR Code downloaded')
    }
  }

  const handlePrint = () => {
    ;(async () => {
      if (!qrRef.current) return
      const canvas = await html2canvas(qrRef.current)
      const dataUrl = canvas.toDataURL()
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head><title>QR Code - Table ${table.tableNumber}</title></head>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh">
            <img src="${dataUrl}" />
          </body>
        </html>
      `)
      printWindow.print()
    })()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QR Code - Table ${table?.tableNumber}`} size="sm">
      <div className="text-center space-y-6">
        {!qrUrl ? (
          <div className="py-8">
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400">No QR Code</span>
            </div>
            <Button onClick={handleGenerate} isLoading={generateMutation.isLoading}>
              Generate QR Code
            </Button>
          </div>
        ) : (
          <>
            <div ref={qrRef} className="bg-white p-4 rounded-lg inline-block">
              <QRCode value={qrUrl} size={200} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Scan to view menu</p>
              {table?.tableNumber && (
                <p className="text-xs text-gray-400">Table {table.tableNumber}</p>
              )}
              <div className="flex gap-3 justify-center">
                <Button onClick={handleDownload} variant="outline" icon={ArrowDownTrayIcon}>
                  Download
                </Button>
                <Button onClick={handlePrint} variant="outline" icon={PrinterIcon}>
                  Print
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default QRCodeGenerator

import {useRef, useState} from 'react'
import QRCode from 'react-qr-code'
import { useMutation } from 'react-query'
import Modal from '../../../common/Modal'
import Button from '../../../common/Button'
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { generateTableQRCode } from '../../../services/qrService'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'

const QRCodeGenerator = ({ isOpen, onClose, table }) => {
  const qrRef = useRef()
  const [qrUrl, setQrUrl] = useState(null)

  const generateMutation = useMutation(
    ({ restaurantId, tableId }) => generateTableQRCode(restaurantId, tableId),
    {
    onSuccess: (data) => {
      const payload = data || {}
      const qrTarget = payload.qr_code?.url || payload.url || ''
      if (!qrTarget) {
        toast.error('QR target URL was not returned')
        return
      }
      setQrUrl(qrTarget)
      toast.success('QR Code generated successfully')
    },
    }
  )

  const handleGenerate = () => {
    const restaurantId = table?.restaurant_id || table?.restaurantId
    const tableId = table?.id
    if (!restaurantId) return toast.error('Restaurant ID not available')
    if (!tableId) return toast.error('Table ID not available')
    generateMutation.mutate({ restaurantId, tableId })
  }

  const handleDownload = async () => {
    if (qrRef.current) {
      const canvas = await html2canvas(qrRef.current)
      const link = document.createElement('a')
      link.download = `table_${table?.tableNumber || table?.table_number}_qr.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success('QR Code downloaded')
    }
  }

  const handlePrint = () => {
    (async () => {
      if (!qrRef.current) return
      const canvas = await html2canvas(qrRef.current)
      const dataUrl = canvas.toDataURL()
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head><title>QR Code - Table ${table?.tableNumber || table?.table_number}</title></head>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh">
            <img src="${dataUrl}" />
          </body>
        </html>
      `)
      printWindow.print()
    })()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QR Code - Table ${table?.tableNumber || table?.table_number}`} size="sm">
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
              {(table?.tableNumber || table?.table_number) && (
                <p className="text-xs text-gray-400">Table {table?.tableNumber || table?.table_number}</p>
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

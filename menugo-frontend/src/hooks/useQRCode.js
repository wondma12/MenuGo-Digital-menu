import { useQuery, useMutation } from 'react-query'
import {
  generateQRCode,
  getQRCode,
  downloadQRCode,
  getQRCodeAnalytics,
  regenerateQRCode,
} from '../services/qrService'
import toast from 'react-hot-toast'

export const useQRCode = (restaurantId, tableId) => {
  const { data: qrCode, isLoading } = useQuery(
    ['qr-code', restaurantId, tableId],
    () => getQRCode(restaurantId, tableId),
    { enabled: !!restaurantId }
  )

  const generateMutation = useMutation(
    () => generateQRCode(restaurantId, tableId),
    {
      onSuccess: (data) => {
        toast.success('QR Code generated successfully')
      },
      onError: () => toast.error('Failed to generate QR code'),
    }
  )

  const regenerateMutation = useMutation(
    () => regenerateQRCode(restaurantId, tableId),
    {
      onSuccess: (data) => {
        toast.success('QR Code regenerated successfully')
      },
      onError: () => toast.error('Failed to regenerate QR code'),
    }
  )

  const downloadMutation = useMutation(
    (format) => downloadQRCode(restaurantId, tableId, format),
    {
      onSuccess: () => {
        toast.success('QR Code downloaded')
      },
      onError: () => toast.error('Failed to download QR code'),
    }
  )

  const { data: analytics } = useQuery(
    ['qr-analytics', restaurantId, tableId],
    () => getQRCodeAnalytics(restaurantId, tableId),
    { enabled: !!restaurantId }
  )

  return {
    qrCode,
    analytics,
    isLoading,
    generateQRCode: generateMutation.mutate,
    regenerateQRCode: regenerateMutation.mutate,
    downloadQRCode: downloadMutation.mutate,
    isGenerating: generateMutation.isLoading,
  }
}

export default useQRCode
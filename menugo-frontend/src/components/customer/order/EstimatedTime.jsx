
import { ClockIcon } from '@heroicons/react/24/outline'

const EstimatedTime = ({ status, estimatedTime }) => {
  if (status === 'completed') return null
  if (status === 'served') return <span className="text-sm text-green-600">✓ Served</span>
  if (status === 'ready') return <span className="text-sm text-purple-600">Ready for pickup!</span>
  if (status === 'preparing') {
    return (
      <div className="flex items-center gap-1 text-sm text-orange-600">
        <ClockIcon className="w-4 h-4" />
        <span>~{estimatedTime || 15} min</span>
      </div>
    )
  }
  return <span className="text-sm text-gray-500">Processing...</span>
}

export default EstimatedTime
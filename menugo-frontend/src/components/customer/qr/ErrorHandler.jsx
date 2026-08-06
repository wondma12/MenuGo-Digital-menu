
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const ErrorHandler = ({ error, onRetry }) => {
  return (
    <div className="text-center py-8">
      <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Error</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Try Again
      </button>
    </div>
  )
}

export default ErrorHandler
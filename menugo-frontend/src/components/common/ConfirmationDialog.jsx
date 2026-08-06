
import Modal from './Modal'
import Button from './Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const variants = {
    danger: { color: 'red', bg: 'bg-red-600 hover:bg-red-700' },
    warning: { color: 'yellow', bg: 'bg-yellow-600 hover:bg-yellow-700' },
    info: { color: 'blue', bg: 'bg-blue-600 hover:bg-blue-700' },
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onClose} variant="secondary" size="sm">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationDialog
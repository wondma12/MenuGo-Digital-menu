import {useState} from 'react'
import { TrashIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { bulkUpdateMenuItems, bulkDeleteMenuItems } from '../../../services/menuService'
import toast from 'react-hot-toast'

const BulkActions = ({ selectedCount, onAction, onClear }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleBulkUpdate = async (action) => {
    setIsLoading(true)
    try {
      if (action === 'delete') {
        await bulkDeleteMenuItems()
      } else {
        await bulkUpdateMenuItems({ status: action === 'available' })
      }
      toast.success(`${selectedCount} items ${action === 'delete' ? 'deleted' : 'updated'} successfully`)
      onAction(action)
      onClear()
    } catch (error) {
      toast.error('Failed to perform bulk action')
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between bg-orange-50 p-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-orange-700">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-orange-300" />
          <button onClick={onClear} className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700">
            <XMarkIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => handleBulkUpdate('available')}
            isLoading={isLoading}
            icon={CheckCircleIcon}
          >
            Mark Available
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() => handleBulkUpdate('unavailable')}
            isLoading={isLoading}
            icon={XCircleIcon}
          >
            Mark Unavailable
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
            isLoading={isLoading}
            icon={TrashIcon}
          >
            Delete Selected
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => handleBulkUpdate('delete')}
        title="Delete Multiple Items"
        message={`Are you sure you want to delete ${selectedCount} item${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
      />
    </>
  )
}

export default BulkActions
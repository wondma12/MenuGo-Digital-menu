import {useState} from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  DocumentIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Loading from '../../../common/Loading'
import Badge from '../../../common/Badge'
import Button from '../../../common/Button'
import Modal from '../../../common/Modal'
import FileUpload from '../../../common/FileUpload'
import Alert from '../../../common/Alert'
import { getRestaurantDocuments, uploadDocument, deleteDocument, verifyDocument } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const RestaurantDocuments = ({ restaurantId }) => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const queryClient = useQueryClient()

  const { data: documents, isLoading } = useQuery(
    ['restaurantDocuments', restaurantId],
    () => getRestaurantDocuments(restaurantId)
  )

  const uploadMutation = useMutation(uploadDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries(['restaurantDocuments', restaurantId])
      setShowUploadModal(false)
      toast.success('Document uploaded successfully')
    },
    onError: () => {
      toast.error('Failed to upload document')
    },
  })

  const deleteMutation = useMutation(deleteDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries(['restaurantDocuments', restaurantId])
      toast.success('Document deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete document')
    },
  })

  const verifyMutation = useMutation(verifyDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries(['restaurantDocuments', restaurantId])
      toast.success('Document verified successfully')
    },
    onError: () => {
      toast.error('Failed to verify document')
    },
  })

  const handleUpload = (files) => {
    const formData = new FormData()
    formData.append('document', files[0])
    formData.append('restaurantId', restaurantId)
    uploadMutation.mutate(formData)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" size="sm">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger" size="sm">Rejected</Badge>
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>
      default:
        return <Badge variant="default" size="sm">Unknown</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) return <Loading />

  const documentTypes = {
    business_license: 'Business License',
    tax_id: 'Tax ID Certificate',
    health_certificate: 'Health Certificate',
    id_proof: 'ID Proof',
    bank_statement: 'Bank Statement',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Documents</h3>
          <p className="text-sm text-gray-500">Manage and verify restaurant documents</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} icon={PlusIcon}>
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents?.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getStatusIcon(doc.status)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {documentTypes[doc.type] || doc.type}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedDocument(doc)
                    setShowPreview(true)
                  }}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                  title="Preview"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <a
                  href={doc.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </a>
                {doc.status === 'pending' && (
                  <>
                    <button
                      onClick={() => verifyMutation.mutate({ id: doc.id, status: 'approved' })}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Approve"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => verifyMutation.mutate({ id: doc.id, status: 'rejected' })}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Reject"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this document?')) {
                      deleteMutation.mutate(doc.id)
                    }
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            {doc.rejectionReason && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600">
                  <strong>Rejection reason:</strong> {doc.rejectionReason}
                </p>
              </div>
            )}
            {doc.verifiedAt && (
              <div className="mt-2 text-xs text-gray-400">
                Verified by: {doc.verifiedBy} on {new Date(doc.verifiedAt).toLocaleString()}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {documents?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900">No documents</h4>
          <p className="text-gray-500 mt-1">No documents have been uploaded yet</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="md"
      >
        <div className="space-y-4">
          <Alert
            type="info"
            message="Please upload clear and legible documents. Accepted formats: PDF, JPG, PNG (Max 10MB)"
          />
          <FileUpload
            onFileSelect={handleUpload}
            accept={{
              'application/pdf': ['.pdf'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
            }}
            maxSize={10 * 1024 * 1024}
            label="Select Document"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Document Preview - ${selectedDocument?.type}`}
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            {selectedDocument.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img src={selectedDocument.url} alt={selectedDocument.type} className="w-full rounded-lg" />
            ) : (
              <iframe src={selectedDocument.url} className="w-full h-[500px] rounded-lg" title="Document Preview" />
            )}
            <div className="flex justify-end gap-3">
              <a
                href={selectedDocument.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Download
              </a>
              <Button variant="secondary" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RestaurantDocuments

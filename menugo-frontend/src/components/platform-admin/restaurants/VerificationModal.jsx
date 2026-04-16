import React, { useState } from 'react'
import { DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Textarea from '../../../common/Textarea'

const VerificationModal = ({ restaurant, onVerify, onClose }) => {
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVerify = async (status) => {
    setIsSubmitting(true)
    await onVerify(restaurant.id, status, notes)
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Business Information</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p><span className="text-gray-500">Business Name:</span> {restaurant.name}</p>
          <p><span className="text-gray-500">Email:</span> {restaurant.email}</p>
          <p><span className="text-gray-500">Phone:</span> {restaurant.phone}</p>
          <p><span className="text-gray-500">Address:</span> {restaurant.address}, {restaurant.city}, {restaurant.country}</p>
        </div>
      </div>

      {/* Documents */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Submitted Documents</h4>
        <div className="space-y-2">
          {restaurant.documents?.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DocumentIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{doc.name}</span>
              </div>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm hover:underline">
                View
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Textarea
          label="Verification Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this verification..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => handleVerify('rejected')}
          isLoading={isSubmitting}
        >
          Reject
        </Button>
        <Button
          variant="success"
          onClick={() => handleVerify('approved')}
          isLoading={isSubmitting}
        >
          Approve & Verify
        </Button>
      </div>
    </div>
  )
}

export default VerificationModal
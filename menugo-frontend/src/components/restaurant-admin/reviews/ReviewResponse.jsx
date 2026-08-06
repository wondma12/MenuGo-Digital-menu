import {useState} from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../../common/Modal'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import { respondToReview } from '../../../services/reviewService'
import toast from 'react-hot-toast'

const ReviewResponse = ({ review, onClose, onRefresh }) => {
  const [response, setResponse] = useState(review.replyFromRestaurant || '')
  const queryClient = useQueryClient()

  const mutation = useMutation(respondToReview, {
    onSuccess: () => {
      queryClient.invalidateQueries('reviews')
      toast.success('Response sent successfully')
      onRefresh()
      onClose()
    },
    onError: () => toast.error('Failed to send response'),
  })

  const handleSubmit = () => {
    if (response.trim()) {
      mutation.mutate({ reviewId: review.id, response })
    } else {
      toast.error('Please enter a response')
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Respond to Review" size="md">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium text-slate-900">{review.customerName || review.user?.full_name || 'Anonymous'}</div>
            <div className="text-yellow-500">★</div>
            <div className="text-slate-600">{review.rating}</div>
          </div>
          { (review.customerEmail || review.user?.email) && (
            <div className="text-xs text-slate-500 mb-2">{review.customerEmail || review.user?.email}</div>
          ) }
          <p className="text-slate-700 text-sm">{review.comment}</p>
        </div>

        <Textarea
          label="Your Response"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Thank you for your feedback!..."
          rows={4}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isLoading}>
            {review.replyFromRestaurant ? 'Update Response' : 'Send Response'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ReviewResponse
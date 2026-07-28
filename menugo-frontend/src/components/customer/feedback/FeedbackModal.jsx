import React, { useState } from 'react'
import Button from '../../common/Button'
import { useAuthStore } from '../../../store/authStore'
import { useMutation, useQueryClient } from 'react-query'
import { createReview } from '../../../services/reviewService'
import toast from 'react-hot-toast'

const FeedbackModal = ({ show, onClose, order, restaurantId: propRestaurantId, onSubmitted }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const { user } = useAuthStore()

  // Ensure the modal opens with a clean form (no restaurant info or previous values).
  React.useEffect(() => {
    if (show) {
      setRating(5)
      setComment('')
      setName('')
      setEmail('')
    }
  }, [show])

  const queryClient = useQueryClient()

  const mutation = useMutation(({ restaurantId, payload }) => createReview(restaurantId, payload), {
    onSuccess: (data, variables) => {
      toast.success('Feedback sent to restaurant')
      // Prefer the resolved restaurant_id returned by the API (UUID) so the list invalidation
      // targets the same key used by `useQuery(['restaurantReviews', restaurantId])`.
      const rid = data?.restaurantId || data?.restaurant_id || variables?.restaurantId || propRestaurantId || order?.restaurantId
      if (rid) queryClient.invalidateQueries(['restaurantReviews', rid])
      // reset local form state so reopening shows a clean form
      setRating(5)
      setComment('')
      setName('')
      setEmail('')
      onSubmitted && onSubmitted()
      onClose()
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to send feedback')
    }
  })

  if (!show) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const restaurantId = propRestaurantId || order?.restaurantId
    if (!restaurantId) return toast.error('Invalid restaurant')

    const payload = {
      order_id: order?.id || null,
      rating,
      title: '',
      comment,
      customer_name: name || undefined,
      customer_email: email || undefined,
      images: [],
      is_anonymous: false,
    }

    mutation.mutate({ restaurantId, payload })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-3 text-black">Leave Feedback</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Rating</label>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="mt-1 w-full border rounded px-2 py-2">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Your name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border rounded px-2 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Your email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-1 w-full border rounded px-2 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Comment</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} className="mt-1 w-full border rounded px-2 py-2" rows={4} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isLoading} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">{mutation.isLoading ? 'Sending...' : 'Send Feedback'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackModal

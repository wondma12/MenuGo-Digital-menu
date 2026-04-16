import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Button from '../../common/Button'
import Switch from '../../common/Switch'
import { updateWaiterAvailability } from '../../../services/waiterService'
import toast from 'react-hot-toast'

const AvailabilitySchedule = () => {
  const [availability, setAvailability] = useState({
    monday: { available: true, start: '09:00', end: '17:00' },
    tuesday: { available: true, start: '09:00', end: '17:00' },
    wednesday: { available: true, start: '09:00', end: '17:00' },
    thursday: { available: true, start: '09:00', end: '17:00' },
    friday: { available: true, start: '09:00', end: '21:00' },
    saturday: { available: true, start: '10:00', end: '22:00' },
    sunday: { available: false, start: '10:00', end: '18:00' }
  })

  const queryClient = useQueryClient()
  const mutation = useMutation(updateWaiterAvailability, {
    onSuccess: () => {
      queryClient.invalidateQueries('waiterProfile')
      toast.success('Availability updated')
    }
  })

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  const handleChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const handleSubmit = () => {
    mutation.mutate(availability)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {days.map((day, index) => (
          <div key={day.key} className={`p-4 flex items-center justify-between ${index !== days.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="w-24">
              <span className="font-medium text-gray-900">{day.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={availability[day.key].available}
                onChange={(checked) => handleChange(day.key, 'available', checked)}
                label="Available"
              />
              {availability[day.key].available && (
                <>
                  <input
                    type="time"
                    value={availability[day.key].start}
                    onChange={(e) => handleChange(day.key, 'start', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={availability[day.key].end}
                    onChange={(e) => handleChange(day.key, 'end', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={mutation.isLoading}>Save Availability</Button>
      </div>
    </div>
  )
}

export default AvailabilitySchedule
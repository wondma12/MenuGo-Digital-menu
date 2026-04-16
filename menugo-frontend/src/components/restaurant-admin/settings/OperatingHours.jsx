import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Button from '../../../common/Button'
import Switch from '../../../common/Switch'
import { updateOperatingHours } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const OperatingHours = ({ settings }) => {
  const [hours, setHours] = useState(settings?.operatingHours || {
    monday: { open: '09:00', close: '22:00', isClosed: false },
    tuesday: { open: '09:00', close: '22:00', isClosed: false },
    wednesday: { open: '09:00', close: '22:00', isClosed: false },
    thursday: { open: '09:00', close: '22:00', isClosed: false },
    friday: { open: '09:00', close: '23:00', isClosed: false },
    saturday: { open: '10:00', close: '23:00', isClosed: false },
    sunday: { open: '10:00', close: '21:00', isClosed: false },
  })

  const queryClient = useQueryClient()
  const mutation = useMutation(updateOperatingHours, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Operating hours updated')
    },
    onError: () => toast.error('Failed to update hours'),
  })

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ]

  const handleChange = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleSubmit = () => {
    mutation.mutate(hours)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {days.map((day, index) => (
          <div key={day.key} className={`p-4 flex items-center justify-between ${index !== days.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="w-32">
              <span className="font-medium text-gray-900">{day.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={!hours[day.key].isClosed}
                onChange={(checked) => handleChange(day.key, 'isClosed', !checked)}
                label="Open"
              />
              {!hours[day.key].isClosed && (
                <>
                  <input
                    type="time"
                    value={hours[day.key].open}
                    onChange={(e) => handleChange(day.key, 'open', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={hours[day.key].close}
                    onChange={(e) => handleChange(day.key, 'close', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={mutation.isLoading}>Save Hours</Button>
      </div>
    </div>
  )
}

export default OperatingHours
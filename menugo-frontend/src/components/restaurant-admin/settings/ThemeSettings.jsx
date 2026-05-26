import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Button from '../../../common/Button'
import { updateThemeSettings } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const ThemeSettings = ({ settings }) => {
  const [formData, setFormData] = useState({
    primaryColor: settings?.primaryColor || '#3b82f6',
    secondaryColor: settings?.secondaryColor || '#10b981',
    fontFamily: settings?.fontFamily || 'Inter',
    darkMode: settings?.darkMode || false,
  })

  const queryClient = useQueryClient()
  const mutation = useMutation(updateThemeSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Theme settings updated')
    },
    onError: () => toast.error('Failed to update theme'),
  })

  const handleSubmit = () => {
    mutation.mutate(formData)
  }

  const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat', 'Lato']

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="w-12 h-12 rounded border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="#3b82f6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="w-12 h-12 rounded border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={formData.secondaryColor}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="#10b981"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
          <select
            value={formData.fontFamily}
            onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

          <div className="pt-4 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.darkMode}
              onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-slate-700">Enable Dark Mode (Preview)</span>
          </label>
        </div>

        {/* Preview */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Preview</h4>
          <div className="rounded-lg p-4" style={{ backgroundColor: formData.primaryColor + '20' }}>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: formData.primaryColor }}>
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: formData.secondaryColor }}>
                Secondary Button
              </button>
            </div>
            <p className="mt-3 text-sm" style={{ fontFamily: formData.fontFamily }}>
              This is how your text will look with {formData.fontFamily} font.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={mutation.isLoading}>Save Theme</Button>
      </div>
    </div>
  )
}

export default ThemeSettings
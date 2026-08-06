
import { MapPinIcon } from '@heroicons/react/24/outline'

const TableInput = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Table Number</label>
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your table number"
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 text-slate-900"
          required
        />
      </div>
    </div>
  )
}

export default TableInput
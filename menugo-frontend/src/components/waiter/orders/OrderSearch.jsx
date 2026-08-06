
import { Search, X } from 'lucide-react'

const OrderSearch = ({ value, onChange }) => {
  const handleClear = () => onChange('')

  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by order number or customer..."
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
      />
      {value && (
        <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-700">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default OrderSearch
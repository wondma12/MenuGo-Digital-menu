
import { Clipboard } from 'lucide-react'

const SpecialInstructions = ({ instructions }) => {
  return (
    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Clipboard className="h-3.5 w-3.5 text-yellow-600" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-800">Special Instructions</span>
      </div>
      <p className="text-xs leading-5 text-yellow-700 sm:text-sm">{instructions}</p>
    </div>
  )
}

export default SpecialInstructions
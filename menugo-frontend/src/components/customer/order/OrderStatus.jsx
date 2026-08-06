
import { Clock, Check, Activity, Star, X } from 'lucide-react'

const OrderStatus = ({ status }) => {
  const config = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    verified: { label: 'Verified', color: 'bg-blue-100 text-blue-800', icon: <Check className="w-4 h-4" /> },
    preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: <Activity className="w-4 h-4" /> },
    ready: { label: 'Ready', color: 'bg-purple-100 text-purple-800', icon: <Check className="w-4 h-4" /> },
    served: { label: 'Served', color: 'bg-green-100 text-green-800', icon: <Star className="w-4 h-4" /> },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <Star className="w-4 h-4" /> },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <X className="w-4 h-4" /> }
  }

  const { label, color, icon } = config[status] || config.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${color}`}>
      <span>{icon}</span>
      {label}
    </span>
  )
}

export default OrderStatus


const AvailabilityBadge = ({ status }) => {
  const config = {
    available: { label: 'Available', color: 'bg-green-100 text-green-700' },
    unavailable: { label: 'Unavailable', color: 'bg-red-100 text-red-700' },
    limited: { label: 'Limited Stock', color: 'bg-yellow-100 text-yellow-700' }
  }

  const { label, color } = config[status] || config.unavailable

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    </div>
  )
}

export default AvailabilityBadge
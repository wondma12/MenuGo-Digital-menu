
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

const RatingStars = ({ rating, size = 'md', showValue = false, interactive = false, onChange }) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - Math.ceil(rating)

  const handleStarClick = (starValue) => {
    if (interactive && onChange) {
      onChange(starValue)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon
            key={`full-${i}`}
            className={`${sizes[size]} text-yellow-400 ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => handleStarClick(i + 1)}
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <StarOutlineIcon className={`${sizes[size]} text-yellow-400 absolute`} />
            <StarIcon className={`${sizes[size]} text-yellow-400 clip-half`} />
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarOutlineIcon
            key={`empty-${i}`}
            className={`${sizes[size]} text-gray-300 ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
          />
        ))}
      </div>
      {showValue && <span className="text-sm text-gray-600 ml-1">({rating})</span>}
    </div>
  )
}

export default RatingStars
import React from 'react'

const Skeleton = ({ variant = 'text', count = 1, className = '' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-48',
    avatar: 'w-12 h-12 rounded-full',
    card: 'h-48 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-12 w-full rounded-lg',
    badge: 'h-6 w-16 rounded-full',
  }

  const renderSkeleton = () => (
    <div className={`skeleton ${variants[variant]} ${className}`} />
  )

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{renderSkeleton()}</div>
        ))}
      </div>
    )
  }

  return renderSkeleton()
}

export default Skeleton
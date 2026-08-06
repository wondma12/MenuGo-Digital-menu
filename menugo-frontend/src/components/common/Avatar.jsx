

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`
          rounded-full object-cover
          ${sizes[size]}
          ${className}
        `}
      />
    )
  }

  return (
    <div className={`
      rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700
      ${sizes[size]}
      ${className}
    `}>
      {getInitials(name || 'User')}
    </div>
  )
}

export default Avatar
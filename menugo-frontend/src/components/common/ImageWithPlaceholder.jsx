import {useState} from 'react'

const ImageWithPlaceholder = ({ src, alt = '', className = '', style = {} }) => {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div className={`bg-gray-100 text-gray-400 flex items-center justify-center ${className}`} style={style}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14l2-2 2 2 4-4 4 4" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  )
}

export default ImageWithPlaceholder

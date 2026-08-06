
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className = '',
}) => {
  const range = (start, end) => {
    const length = end - start + 1
    return Array.from({ length }, (_, i) => start + i)
  }

  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 3
    const firstPage = 1
    const lastPage = totalPages

    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSiblingIndex > 2
    const showRightDots = rightSiblingIndex < totalPages - 1

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, 3 + siblingCount * 2)
      return [...leftRange, '...', totalPages]
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = range(totalPages - (3 + siblingCount * 2) + 1, totalPages)
      return [firstPage, '...', ...rightRange]
    }

    if (showLeftDots && showRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPage, '...', ...middleRange, '...', lastPage]
    }
  }

  const pageNumbers = getPageNumbers()

  if (typeof totalPages !== 'number' || totalPages <= 1) return null

  return (
    <nav className={`flex items-center justify-center gap-1 ${className}`}>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">First</span>
          <ChevronLeftIcon className="w-5 h-5" />
          <ChevronLeftIcon className="w-5 h-5 -ml-3" />
        </button>
      )}
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`
            min-w-[36px] h-9 px-2 rounded-lg font-medium transition-colors
            ${currentPage === page
              ? 'bg-primary-600 text-white'
              : page === '...'
                ? 'cursor-default hover:bg-transparent'
                : 'hover:bg-gray-100 text-gray-700'
            }
          `}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Last</span>
          <ChevronRightIcon className="w-5 h-5" />
          <ChevronRightIcon className="w-5 h-5 -ml-3" />
        </button>
      )}
    </nav>
  )
}

export default Pagination
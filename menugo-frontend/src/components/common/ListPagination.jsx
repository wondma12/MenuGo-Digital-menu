import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const ListPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages < 1) return null

  return (
    <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Previous
      </button>
      <span className="text-sm font-semibold text-slate-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

export default ListPagination

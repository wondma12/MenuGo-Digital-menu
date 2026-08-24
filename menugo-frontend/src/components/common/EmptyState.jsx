
import Button from './Button'

const EmptyState = ({ title, description, icon: Icon, actionText, onAction, className = '' }) => {
  return (
    <div className={`mx-auto max-w-2xl rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.14),transparent_30%),linear-gradient(180deg,#fff_0%,#fffaf5_100%)] px-6 py-12 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${className}`}>
      {Icon && (
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 ring-1 ring-orange-200">
          <Icon className="h-10 w-10 text-orange-500" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-black text-slate-900">{title}</h3>
      <p className="mx-auto mb-6 max-w-sm text-slate-500">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-600/20">
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState

import { Bars3Icon } from '@heroicons/react/24/outline'

const TopBar = ({ title, user, actions, onMenuClick, showMenuButton = true }) => {
  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="truncate text-xl font-semibold text-slate-900">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </div>
  )
}

export default TopBar
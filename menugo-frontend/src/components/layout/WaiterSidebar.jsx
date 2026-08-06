
import { NavLink } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { LogOut } from 'lucide-react'

const WaiterSidebar = ({ menuItems = [], user, onLogout, restaurantBrand }) => {
  const restaurantName = restaurantBrand?.name || user?.restaurant?.name || user?.staff?.restaurant_name || 'Restaurant'
  const restaurantLogo = restaurantBrand?.logo || user?.restaurant?.logo_url || user?.restaurant?.logo || null

  return (
    <div className="flex h-full flex-col bg-white/95 text-slate-900">
      {/* Restaurant Branding */}
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          {restaurantLogo ? (
            <img src={restaurantLogo} alt={restaurantName} className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700 ring-1 ring-orange-200">
              {String(restaurantName).charAt(0).toUpperCase() || 'R'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-900">{restaurantName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-blue-50 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'
                    : 'border-transparent text-slate-600 hover:border-orange-200 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section (pinned to bottom-left) */}
      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar name={user?.fullName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{user?.fullName}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default WaiterSidebar

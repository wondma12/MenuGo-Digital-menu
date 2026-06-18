import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import AdminLayout from './components/layout/AdminLayout'
import RestaurantLayout from './components/layout/RestaurantLayout'
import WaiterLayout from './components/layout/WaiterLayout'
import CustomerLayout from './components/layout/CustomerLayout'
import KitchenLayout from './components/layout/KitchenLayout'

// Platform Admin Pages
const PlatformDashboard = React.lazy(() => import('./components/platform-admin/dashboard/PlatformDashboard'))
const RestaurantList = React.lazy(() => import('./components/platform-admin/restaurants/RestaurantList'))
const RestaurantDetails = React.lazy(() => import('./components/platform-admin/restaurants/RestaurantDetails'))
const RestaurantForm = React.lazy(() => import('./components/platform-admin/restaurants/RestaurantForm'))
const UserList = React.lazy(() => import('./components/platform-admin/users/UserList'))
const UserDetails = React.lazy(() => import('./components/platform-admin/users/UserDetails'))
const UserForm = React.lazy(() => import('./components/platform-admin/users/UserForm'))
const SubscriptionPlans = React.lazy(() => import('./components/platform-admin/subscriptions/SubscriptionPlans'))
const PlatformAnalytics = React.lazy(() => import('./components/platform-admin/analytics/PlatformAnalytics'))
const SystemSettings = React.lazy(() => import('./components/platform-admin/system/SystemSettings'))
const SystemHealth = React.lazy(() => import('./components/platform-admin/system/SystemHealth'))
const AuditLogs = React.lazy(() => import('./components/platform-admin/system/AuditLogs'))
const BackupManager = React.lazy(() => import('./components/platform-admin/system/BackupManager'))
const CreateRestaurantForm = React.lazy(() => import('./components/platform-admin/restaurants/CreateRestaurantForm'))

// Restaurant Admin Pages
const RestaurantDashboard = React.lazy(() => import('./components/restaurant-admin/dashboard/RestaurantDashboard'))
const MenuManagement = React.lazy(() => import('./components/restaurant-admin/menu/MenuManagement'))
const CategoryManager = React.lazy(() => import('./components/restaurant-admin/categories/CategoryManager'))
const OrderManagement = React.lazy(() => import('./components/restaurant-admin/orders/OrderManagement'))
// Remove the duplicate KitchenPage import from restaurant-admin
// const KitchenPage = React.lazy(() => import('./components/restaurant-admin/kitchen/KitchenPage'))
const TableManagement = React.lazy(() => import('./components/restaurant-admin/tables/TableManagement'))
const StaffManagement = React.lazy(() => import('./components/restaurant-admin/staff/StaffManagement'))
const InventoryManagement = React.lazy(() => import('./components/restaurant-admin/inventory/InventoryManagement'))
const CouponManagement = React.lazy(() => import('./components/restaurant-admin/promotions/CouponManagement'))
const RestaurantAnalytics = React.lazy(() => import('./components/restaurant-admin/analytics/RestaurantAnalytics'))
const ReviewManagement = React.lazy(() => import('./components/restaurant-admin/reviews/ReviewManagement'))
const RestaurantSettings = React.lazy(() => import('./components/restaurant-admin/settings/RestaurantSettings'))
const RestaurantQRCodePage = React.lazy(() => import('./components/restaurant-admin/qr/RestaurantQRCodePage'))

// Kitchen Pages (Chef)
const KitchenDashboard = React.lazy(() => import('./pages/KitchenPage'))
const KitchenActiveOrders = React.lazy(() => import('./pages/KitchenPage'))
const KitchenCompletedPage = React.lazy(() => import('./pages/KitchenCompletedPage'))
const KitchenOrderDetails = React.lazy(() => import('./components/kitchen/KitchenOrderDetails'))

// Waiter Pages
const WaiterDashboard = React.lazy(() => import('./components/waiter/dashboard/WaiterDashboard'))
const WaiterOrderList = React.lazy(() => import('./components/waiter/orders/WaiterOrderList'))
const WaiterTableMap = React.lazy(() => import('./components/waiter/tables/WaiterTableMap'))
const ReservationList = React.lazy(() => import('./components/waiter/reservations/ReservationList'))
const CallRequests = React.lazy(() => import('./components/waiter/calls/CallRequests'))
const WaiterNotifications = React.lazy(() => import('./components/waiter/notifications/WaiterNotificationList'))
const WaiterProfile = React.lazy(() => import('./components/waiter/profile/WaiterProfile'))

// Customer Pages
const Landing = React.lazy(() => import('./components/customer/landing/Landing'))
const MenuDisplay = React.lazy(() => import('./components/customer/menu/MenuDisplay'))
const MenuItemDetail = React.lazy(() => import('./components/customer/menu/MenuItemDetail'))
const CartPage = React.lazy(() => import('./components/customer/cart/CartPage'))
const OrderConfirmation = React.lazy(() => import('./components/customer/order/OrderConfirmation'))
const OrderTracking = React.lazy(() => import('./components/customer/order/OrderTracker'))
const OrderHistory = React.lazy(() => import('./components/customer/order/OrderHistory'))
const QRScanner = React.lazy(() => import('./components/customer/qr/QRScanner'))

// Auth Pages
const Login = React.lazy(() => import('./components/auth/Login'))
const Register = React.lazy(() => import('./components/auth/Register'))
const ForgotPassword = React.lazy(() => import('./components/auth/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./components/auth/ResetPassword'))
const VerifyEmail = React.lazy(() => import('./components/auth/VerifyEmail'))
const TwoFactorAuth = React.lazy(() => import('./components/auth/TwoFactorAuth'))

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute'
import Loading from './components/common/Loading'
import ErrorBoundary from './components/common/ErrorBoundary'

// Route Configuration
export const routeConfig = {
  public: [
    { path: '/login', element: Login },
    { path: '/auth/login', element: Login },
    { path: '/register', element: Register },
    { path: '/auth/register', element: Register },
    { path: '/forgot-password', element: ForgotPassword },
    { path: '/reset-password/:token', element: ResetPassword },
    { path: '/verify-email/:token', element: VerifyEmail },
    { path: '/2fa', element: TwoFactorAuth },
  ],
  customer: [
    { path: '/menu/:restaurantId/landing', element: Landing, layout: CustomerLayout },
    { path: '/menu/:restaurantId', element: MenuDisplay, layout: CustomerLayout },
    { path: '/menu/:restaurantId/item/:itemId', element: MenuItemDetail, layout: CustomerLayout },
    { path: '/menu/:restaurantId/cart', element: CartPage, layout: CustomerLayout },
    { path: '/order-confirmation/:orderId', element: OrderConfirmation },
    { path: '/order-tracking/:orderId', element: OrderTracking },
    { path: '/order-history', element: OrderHistory },
    { path: '/scan', element: QRScanner },
  ],
  platformAdmin: [
    { path: '/platform/dashboard', element: PlatformDashboard, layout: AdminLayout },
    { path: '/platform/restaurants', element: RestaurantList, layout: AdminLayout },
    { path: '/platform/restaurants/new', element: RestaurantForm, layout: AdminLayout },
    { path: '/platform/restaurants/create', element: CreateRestaurantForm, layout: AdminLayout },
    { path: '/platform/restaurants/:id', element: RestaurantDetails, layout: AdminLayout },
    { path: '/platform/restaurants/:id/edit', element: RestaurantForm, layout: AdminLayout },
    { path: '/platform/users', element: UserList, layout: AdminLayout },
    { path: '/platform/users/new', element: UserForm, layout: AdminLayout },
    { path: '/platform/users/:id', element: UserDetails, layout: AdminLayout },
    { path: '/platform/users/:id/edit', element: UserForm, layout: AdminLayout },
    { path: '/platform/subscriptions', element: SubscriptionPlans, layout: AdminLayout },
    { path: '/platform/analytics', element: PlatformAnalytics, layout: AdminLayout },
    
    { path: '/platform/settings', element: SystemSettings, layout: AdminLayout },
    { path: '/platform/system', element: SystemSettings, layout: AdminLayout },
    { path: '/platform/system/health', element: SystemHealth, layout: AdminLayout },
    { path: '/platform/system/audit-logs', element: AuditLogs, layout: AdminLayout },
    { path: '/platform/system/backup', element: BackupManager, layout: AdminLayout },
  ],
  restaurantAdmin: [
    { path: '/restaurant/dashboard', element: RestaurantDashboard, layout: RestaurantLayout },
    { path: '/admin/dashboard', element: RestaurantDashboard, layout: RestaurantLayout },
    { path: '/restaurant/tables/qr', element: TableManagement, layout: RestaurantLayout },
    { path: '/admin/menu', element: MenuManagement, layout: RestaurantLayout },
    { path: '/admin/categories', element: CategoryManager, layout: RestaurantLayout },
    { path: '/admin/orders', element: OrderManagement, layout: RestaurantLayout },
    { path: '/admin/tables', element: TableManagement, layout: RestaurantLayout },
    { path: '/admin/staff', element: StaffManagement, layout: RestaurantLayout },
    { path: '/admin/inventory', element: InventoryManagement, layout: RestaurantLayout },
    { path: '/admin/promotions', element: CouponManagement, layout: RestaurantLayout },
    { path: '/admin/analytics', element: RestaurantAnalytics, layout: RestaurantLayout },
    { path: '/admin/reviews', element: ReviewManagement, layout: RestaurantLayout },
    { path: '/admin/restaurant/qr', element: RestaurantQRCodePage, layout: RestaurantLayout },
    { path: '/admin/settings', element: RestaurantSettings, layout: RestaurantLayout },
  ],
  // Kitchen Routes (Chef)
  kitchen: [
    { path: '/chef', element: KitchenDashboard, layout: KitchenLayout },
    { path: '/chef/kitchen', element: KitchenDashboard, layout: KitchenLayout },
    { path: '/chef/active', element: KitchenActiveOrders, layout: KitchenLayout },
    { path: '/chef/completed', element: KitchenCompletedPage, layout: KitchenLayout },
    { path: '/chef/orders/:orderId', element: KitchenOrderDetails, layout: KitchenLayout },
    { path: '/kitchen/dashboard', element: KitchenDashboard, layout: KitchenLayout },
    { path: '/kitchen/active', element: KitchenActiveOrders, layout: KitchenLayout },
    { path: '/kitchen/completed', element: KitchenCompletedPage, layout: KitchenLayout },
  ],
  waiter: [
    { path: '/waiter/dashboard', element: WaiterDashboard, layout: WaiterLayout },
    { path: '/waiter/orders', element: WaiterOrderList, layout: WaiterLayout },
    { path: '/waiter/tables', element: WaiterTableMap, layout: WaiterLayout },
    { path: '/waiter/reservations', element: ReservationList, layout: WaiterLayout },
    { path: '/waiter/calls', element: CallRequests, layout: WaiterLayout },
    { path: '/waiter/notifications', element: WaiterNotifications, layout: WaiterLayout },
    { path: '/waiter/profile', element: WaiterProfile, layout: WaiterLayout },
  ],
}

// Role to route mapping
const roleRouteMap = {
  // Platform admins should also be able to view restaurant/kitchen pages for diagnostics
  platform_admin: ['public', 'platformAdmin', 'restaurantAdmin', 'kitchen'],
  // Restaurant owners/admins can view kitchen dashboard as well
  restaurant_admin: ['public', 'restaurantAdmin', 'kitchen'],
  chef: ['public', 'kitchen'],
  waiter: ['public', 'waiter'],
  customer: ['public', 'customer'],
}

// Route Renderer Component
export const AppRoutes = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <Loading fullScreen />
  }

  const getRoleBasedRoutes = () => {
    if (!user) {
        // In development allow quick access to kitchen and platform admin pages without login for preview/debug
        if (process.env.NODE_ENV === 'development') {
          return [...routeConfig.public, ...(routeConfig.kitchen || []), ...(routeConfig.platformAdmin || [])]
        }
        return routeConfig.public
    }
    // Consider both top-level user role and any staff role attached to the user
    const rolesToConsider = [user.role]
    if (user.staff && user.staff.role && !rolesToConsider.includes(user.staff.role)) {
      rolesToConsider.push(user.staff.role)
    }

    // Collect unique route keys for all applicable roles
    const routeKeySet = new Set()
    rolesToConsider.forEach(r => {
      const keys = roleRouteMap[r] || roleRouteMap.customer
      keys.forEach(k => routeKeySet.add(k))
    })

    // Collect all routes based on aggregated keys
    let routes = []
    Array.from(routeKeySet).forEach(key => {
      if (routeConfig[key]) routes = [...routes, ...routeConfig[key]]
    })

    return routes
  }

  const routes = getRoleBasedRoutes()

  // Group routes by layout to avoid nested Route elements inside layout components
  const renderRoutes = () => {
    // Separate routes with and without layout
    const routesWithLayout = routes.filter(route => route.layout)
    const routesWithoutLayout = routes.filter(route => !route.layout)

    return (
      <>
        {/* Routes without layout */}
        {routesWithoutLayout.map((route, index) => {
          const Element = route.element
          return <Route key={`nolayout-${index}`} path={route.path} element={<Element />} />
        })}
        
        {/* Routes with layout - group by layout type.
            Wrap protected layouts with <ProtectedRoute> so their children
            don't mount until authentication is hydrated. This prevents
            race conditions where child components issue protected API
            calls before `checkAuth()` completes and cause 401-driven
            logouts on page refresh. */}
        {[...new Set(routesWithLayout.map(r => r.layout))].map((Layout, layoutIndex) => {
          const layoutRoutes = routesWithLayout.filter(r => r.layout === Layout)

          // Layouts that render admin/waiter/kitchen pages require authentication.
          const protectedLayouts = [AdminLayout, RestaurantLayout, WaiterLayout, KitchenLayout]
          const needsAuth = protectedLayouts.includes(Layout)

          if (needsAuth) {
            return (
              <Route key={`layout-protected-${layoutIndex}`} element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {layoutRoutes.map((route, routeIndex) => {
                    const Element = route.element
                    return (
                      <Route 
                        key={`route-${layoutIndex}-${routeIndex}`} 
                        path={route.path} 
                        element={<Element />} 
                      />
                    )
                  })}
                </Route>
              </Route>
            )
          }

          return (
            <Route key={`layout-${layoutIndex}`} element={<Layout />}>
              {layoutRoutes.map((route, routeIndex) => {
                const Element = route.element
                return (
                  <Route 
                    key={`route-${layoutIndex}-${routeIndex}`} 
                    path={route.path} 
                    element={<Element />} 
                  />
                )
              })}
            </Route>
          )
        })}
      </>
    )
  }

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<Loading fullScreen />}>
        <Routes>
          {renderRoutes()}
          {/* Explicit protected platform system routes so direct URLs work */}
          <Route element={<ProtectedRoute allowedRoles={["platform_admin"]} />}>
            <Route path="/platform/system" element={<SystemSettings />} />
            <Route path="/platform/system/health" element={<SystemHealth />} />
            <Route path="/platform/system/audit-logs" element={<AuditLogs />} />
            <Route path="/platform/system/backup" element={<BackupManager />} />
            
          </Route>
          
          {/* Default redirect based on role */}
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (user.staff && user.staff.role ? user.staff.role : user.role) === 'platform_admin' ? (
                <Navigate to="/platform/dashboard" replace />
              ) : (user.staff && user.staff.role ? user.staff.role : user.role) === 'restaurant_admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (user.staff && user.staff.role ? user.staff.role : user.role) === 'chef' ? (
                <Navigate to="/chef/kitchen" replace />
              ) : (user.staff && user.staff.role ? user.staff.role : user.role) === 'waiter' ? (
                <Navigate to="/waiter/dashboard" replace />
              ) : (
                <Navigate to="/scan" replace />
              )
            }
          />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="mt-6 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go Back Home
        </a>
      </div>
    </div>
  )
}

export default AppRoutes
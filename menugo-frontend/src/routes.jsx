import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import AdminLayout from './components/layout/AdminLayout'
import RestaurantLayout from './components/layout/RestaurantLayout'
import WaiterLayout from './components/layout/WaiterLayout'
import CustomerLayout from './components/layout/CustomerLayout'

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
const TicketList = React.lazy(() => import('./components/platform-admin/support/TicketList'))
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
const TableManagement = React.lazy(() => import('./components/restaurant-admin/tables/TableManagement'))
const StaffManagement = React.lazy(() => import('./components/restaurant-admin/staff/StaffManagement'))
const InventoryManagement = React.lazy(() => import('./components/restaurant-admin/inventory/InventoryManagement'))
const CouponManagement = React.lazy(() => import('./components/restaurant-admin/promotions/CouponManagement'))
const RestaurantAnalytics = React.lazy(() => import('./components/restaurant-admin/analytics/RestaurantAnalytics'))
const ReviewManagement = React.lazy(() => import('./components/restaurant-admin/reviews/ReviewManagement'))
const RestaurantSettings = React.lazy(() => import('./components/restaurant-admin/settings/RestaurantSettings'))
const RestaurantQRCodePage = React.lazy(() => import('./components/restaurant-admin/qr/RestaurantQRCodePage'))

// Waiter Pages
const WaiterDashboard = React.lazy(() => import('./components/waiter/dashboard/WaiterDashboard'))
const WaiterOrderList = React.lazy(() => import('./components/waiter/orders/WaiterOrderList'))
const WaiterTableMap = React.lazy(() => import('./components/waiter/tables/WaiterTableMap'))
const ReservationList = React.lazy(() => import('./components/waiter/reservations/ReservationList'))
const CallRequests = React.lazy(() => import('./components/waiter/calls/CallRequests'))
const WaiterNotifications = React.lazy(() => import('./components/waiter/notifications/WaiterNotificationList'))
const WaiterProfile = React.lazy(() => import('./components/waiter/profile/WaiterProfile'))

// Customer Pages
const MenuDisplay = React.lazy(() => import('./components/customer/menu/MenuDisplay'))
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
    { path: '/register', element: Register },
    { path: '/forgot-password', element: ForgotPassword },
    { path: '/reset-password/:token', element: ResetPassword },
    { path: '/verify-email/:token', element: VerifyEmail },
    { path: '/2fa', element: TwoFactorAuth },
  ],
  customer: [
    { path: '/menu/:restaurantId', element: MenuDisplay, layout: CustomerLayout },
    { path: '/menu/:restaurantId/cart', element: CartPage, layout: CustomerLayout },
    { path: '/order-confirmation/:orderId', element: OrderConfirmation },
    { path: '/order-tracking/:orderId', element: OrderTracking },
    { path: '/order-history', element: OrderHistory },
    { path: '/scan', element: QRScanner },
  ],
  platformAdmin: [
    { path: '/platform/dashboard', element: PlatformDashboard },
    { path: '/platform/restaurants', element: RestaurantList },
    { path: '/platform/restaurants/new', element: RestaurantForm },
    { path: '/platform/restaurants/create', element: CreateRestaurantForm },
    { path: '/platform/restaurants/:id', element: RestaurantDetails },
    { path: '/platform/restaurants/:id/edit', element: RestaurantForm },

    { path: '/platform/users', element: UserList },
    { path: '/platform/users/new', element: UserForm },
    { path: '/platform/users/:id', element: UserDetails },
    { path: '/platform/users/:id/edit', element: UserForm },
    { path: '/platform/subscriptions', element: SubscriptionPlans },
    { path: '/platform/analytics', element: PlatformAnalytics },
    { path: '/platform/support', element: TicketList },
    { path: '/platform/settings', element: SystemSettings },
    { path: '/platform/system/health', element: SystemHealth },
    { path: '/platform/system/audit-logs', element: AuditLogs },
    { path: '/platform/system/backup', element: BackupManager },
  ],
  restaurantAdmin: [
    { path: '/restaurant/dashboard', element: RestaurantDashboard },
    { path: '/admin/dashboard', element: RestaurantDashboard },
    { path: '/restaurant/tables/qr', element: TableManagement },
    { path: '/admin/menu', element: MenuManagement },
    { path: '/admin/categories', element: CategoryManager },
    { path: '/admin/orders', element: OrderManagement },
    { path: '/admin/tables', element: TableManagement },
    { path: '/admin/staff', element: StaffManagement },
    { path: '/admin/inventory', element: InventoryManagement },
    { path: '/admin/promotions', element: CouponManagement },
    { path: '/admin/analytics', element: RestaurantAnalytics },
    { path: '/admin/reviews', element: ReviewManagement },
    { path: '/admin/restaurant/qr', element: RestaurantQRCodePage },
    { path: '/admin/settings', element: RestaurantSettings },
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

// Route Renderer Component
export const AppRoutes = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <Loading fullScreen />
  }

  const getRoleBasedRoutes = () => {
    if (!user) return routeConfig.public
    
    switch (user.role) {
      case 'platform_admin':
        // Platform admins should also be able to view restaurant admin pages
        return [...routeConfig.public, ...routeConfig.platformAdmin, ...routeConfig.restaurantAdmin]
      case 'restaurant_admin':
        return [...routeConfig.public, ...routeConfig.restaurantAdmin]
      case 'waiter':
        return [...routeConfig.public, ...routeConfig.waiter]
      default:
        return [...routeConfig.public, ...routeConfig.customer]
    }
  }

  const routes = getRoleBasedRoutes()

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<Loading fullScreen />}>
        <Routes>
          {routes.map((route, index) => {
            const Element = route.element
            const Layout = route.layout
            const element = Layout ? (
              <Layout>
                <Element />
              </Layout>
            ) : (
              <Element />
            )
            
            return <Route key={index} path={route.path} element={element} />
          })}
          
          {/* Default redirect */}
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : user.role === 'platform_admin' ? (
                <Navigate to="/platform/dashboard" replace />
              ) : user.role === 'restaurant_admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user.role === 'waiter' ? (
                <Navigate to="/waiter/dashboard" replace />
              ) : (
                <Navigate to="/menu" replace />
              )
            }
          />
          
          {/* 404 */}
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
          className="mt-6 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go Back Home
        </a>
      </div>
    </div>
  )
}

export default AppRoutes
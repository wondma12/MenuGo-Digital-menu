import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useAuthStore } from './store/authStore'
import { useUiStore } from './store/uiStore'
import { preloadAllSounds } from './utils/audioUtils'
import { initWebSocket } from './services/webSocketService'

// Layouts
import AdminLayout from './components/layout/AdminLayout'
import RestaurantLayout from './components/layout/RestaurantLayout'
import WaiterLayout from './components/layout/WaiterLayout'
import CustomerLayout from './components/layout/CustomerLayout'
import KitchenLayout from './components/layout/KitchenLayout'

// Platform Admin Pages
import PlatformDashboard from './components/platform-admin/dashboard/PlatformDashboard'
import RestaurantList from './components/platform-admin/restaurants/RestaurantList'
import RestaurantDetails from './components/platform-admin/restaurants/RestaurantDetails'
import RestaurantForm from './components/platform-admin/restaurants/RestaurantForm'
import VerificationQueue from './components/platform-admin/restaurants/VerificationQueue'
import UserList from './components/platform-admin/users/UserList'
import UserDetails from './components/platform-admin/users/UserDetails'
import UserForm from './components/platform-admin/users/UserForm'
import RoleManagement from './components/platform-admin/users/RoleManagement'
import SubscriptionPlans from './components/platform-admin/subscriptions/SubscriptionPlans'
import SubscriptionList from './components/platform-admin/subscriptions/SubscriptionList'
import InvoiceList from './components/platform-admin/subscriptions/InvoiceList'
import RevenueReport from './components/platform-admin/subscriptions/RevenueReport'
import PlatformAnalytics from './components/platform-admin/analytics/PlatformAnalytics'
import ContactMessages from './components/platform-admin/messages/Messages'
import RevenueAnalytics from './components/platform-admin/analytics/RevenueAnalytics'
import UserAnalytics from './components/platform-admin/analytics/UserAnalytics'
import PlatformProfile from './components/platform-admin/profile/PlatformProfile'
// Support module removed
import SystemSettings from './components/platform-admin/system/SystemSettings'
import EmailSettings from './components/platform-admin/system/EmailSettings'
import SecuritySettings from './components/platform-admin/system/SecuritySettings'
import AuditLogs from './components/platform-admin/system/AuditLogs'
import SystemHealth from './components/platform-admin/system/SystemHealth'
import BackupManager from './components/platform-admin/system/BackupManager'

// Restaurant Admin Pages
import RestaurantDashboard from './components/restaurant-admin/dashboard/RestaurantDashboard'
import MenuManagement from './components/restaurant-admin/menu/MenuManagement'
import CategoryManager from './components/restaurant-admin/categories/CategoryManager'
import OrderManagement from './components/restaurant-admin/orders/OrderManagement'
import TableManagement from './components/restaurant-admin/tables/TableManagement'
import StaffManagement from './components/restaurant-admin/staff/StaffManagement'
import InventoryManagement from './components/restaurant-admin/inventory/InventoryManagement'
import CouponManagement from './components/restaurant-admin/promotions/CouponManagement'
import RestaurantAnalytics from './components/restaurant-admin/analytics/RestaurantAnalytics'
import SalesReport from './components/restaurant-admin/analytics/SalesReport'
import OrderReport from './components/restaurant-admin/analytics/OrderReport'
import MenuPerformance from './components/restaurant-admin/analytics/MenuPerformance'
import CustomerReport from './components/restaurant-admin/analytics/CustomerReport'
import ReviewManagement from './components/restaurant-admin/reviews/ReviewManagement'
import RestaurantSettings from './components/restaurant-admin/settings/RestaurantSettings'
import RestaurantProfilePage from './components/restaurant-admin/settings/RestaurantProfilePage'
import RestaurantQRCodePage from './components/restaurant-admin/qr/RestaurantQRCodePage'
// Remove duplicate KitchenPage import from restaurant-admin/kitchen
// import KitchenPage from './components/restaurant-admin/kitchen/KitchenPage'

// Waiter Pages
import WaiterDashboard from './components/waiter/dashboard/WaiterDashboard'
import WaiterOrderList from './components/waiter/orders/WaiterOrderList'
import WaiterTableMap from './components/waiter/tables/WaiterTableMap'
import ReservationList from './components/waiter/reservations/ReservationList'
import CallRequests from './components/waiter/calls/CallRequests'
import WaiterProfile from './components/waiter/profile/WaiterProfile'
import WaiterNotifications from './components/waiter/notifications/WaiterNotificationList'

// Kitchen Pages
import KitchenPage from './pages/KitchenPage'

// Customer Pages
import MenuDisplay from './components/customer/menu/MenuDisplay'
import MenuItemDetail from './components/customer/menu/MenuItemDetail'
import CartPage from './components/customer/cart/CartPage'
import OrderConfirmation from './components/customer/order/OrderConfirmation'
import OrderTracking from './components/customer/order/OrderTracker'
import OrderHistory from './components/customer/order/OrderHistory'
import QRScanner from './components/customer/qr/QRScanner'
import FavoritesPage from './components/customer/favorites/FavoritesPage'

// Auth Pages
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import VerifyEmail from './components/auth/VerifyEmail'
import TwoFactorAuth from './components/auth/TwoFactorAuth'
import WelcomeLanding from './components/auth/WelcomeLanding'

// Public Pages
// import Landing from "./components/Landing";
import Home from './components/public/Home'
import About from './components/public/About'
import Services from './components/public/Services'
import Contact from './components/public/Contact'
import Faq from './components/public/Faq'
import Privacy from './components/public/Privacy'
import Terms from './components/public/Terms'
import Security from './components/public/Security'

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import Loading from './components/common/Loading'
import { getEffectiveRole, getRoleHomePath } from './utils/authRouting'
import ProfileRedirect from './components/common/ProfileRedirect'

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
})

function App() {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore()
  const { theme, setTheme } = useUiStore()

  // Component used for root-level role-based redirects
  const RootRedirect = () => {
    try {
      const params = new URLSearchParams(window.location.search)
      const restaurantParam = params.get('restaurant')
      if (restaurantParam) return <Navigate to={`/menu/${restaurantParam}`} replace />
    } catch (err) {
      // ignore
    }
    // If auth is loading or we have a persisted token but no user yet,
    // render Loading so we don't redirect to the wrong root while
    // `checkAuth()` hydrates the full user profile.
    try {
      const sessionToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
      if (isLoading) return <Loading fullScreen />
      if (sessionToken && !user) return <Loading fullScreen />
    } catch (e) {
      // ignore storage access
    }

    if (!isAuthenticated) {
      return <Navigate to="/home" replace />
    }
    if (user?.role === 'restaurant_admin' && (!user?.is_active || !user?.is_verified)) {
      return <Navigate to="/login" replace />
    }
    return <Navigate to={getRoleHomePath(getEffectiveRole(user))} replace />
  }

  // Run one-time bootstrap work on initial mount.
  useEffect(() => {
    // Hydrate token from session storage into the store so axios
    // request interceptor can attach it immediately on first requests.
    try {
      const sessionToken = window.sessionStorage.getItem('token')
      const sessionRefresh = window.sessionStorage.getItem('refreshToken')
      if (sessionToken && !useAuthStore.getState().token) {
        useAuthStore.setState({ token: sessionToken, refreshToken: sessionRefresh || null })
      }
    } catch (e) {
      // ignore storage errors
    }

    checkAuth()
    preloadAllSounds()

    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [checkAuth, setTheme])

  // Suppress noisy unhandled promise rejections caused by browser extensions
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      try {
        const reason = event?.reason
        const message = (reason && (reason.message || reason.toString())) || ''
        // Suppress noisy extension/runtime messages and audio AbortError play/pause races
        if (typeof message === 'string') {
          const ignorePatterns = [
            'A listener indicated an asynchronous response by returning true',
            'The play() request was interrupted by a call to pause',
            'The play() request was interrupted',
          ]
          const shouldIgnore = ignorePatterns.some(p => message.includes(p)) || (event?.reason && event.reason.name === 'AbortError')
          if (shouldIgnore) {
            event.preventDefault()
            console.warn('Ignored extension/runtime audio error:', message)
          }
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [])

  // Only connect sockets after authentication is established.
  useEffect(() => {
    if (!isAuthenticated) return
    initWebSocket()
  }, [isAuthenticated])

  if (isLoading) {
    return <Loading fullScreen text="Loading MenuGo..." />
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {/* react-toastify handles global toasts via ToastContainer */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
          


          
          <Routes>
            {/* Root Route with Role-Based Redirection */}
            {/* <Route path="/" element={<Landing />} /> */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/service" element={<Navigate to="/services" replace />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/security" element={<Security />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/welcome" element={<WelcomeLanding />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
            <Route path="/profile" element={<ProfileRedirect />} />
            
            {/* Customer Routes - No Auth Required */}
            <Route path="/menu/:restaurantId" element={<CustomerLayout />}>
              <Route index element={<MenuDisplay />} />
              <Route path="item/:itemId" element={<MenuItemDetail />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="order/:orderId" element={<OrderTracking />} />
              <Route path="history" element={<OrderHistory />} />
            </Route>
            
            {/* Backwards-compatible customer path */}
            <Route path="/customer" element={<Navigate to="/scan" replace />} />
            <Route path="/customer/:restaurantId" element={<CustomerLayout />}>
              <Route index element={<MenuDisplay />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="order/:orderId" element={<OrderTracking />} />
              <Route path="history" element={<OrderHistory />} />
            </Route>
            
            <Route path="/scan" element={<QRScanner />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            
            {/* Platform Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['platform_admin']} />}>
              <Route path="/platform" element={<AdminLayout />}>
                <Route index element={<Navigate to="/platform/dashboard" />} />
                <Route path="dashboard" element={<PlatformDashboard />} />
                <Route path="profile" element={<PlatformProfile />} />
                <Route path="restaurants" element={<RestaurantList />} />
                <Route path="restaurants/new" element={<RestaurantForm />} />
                <Route path="restaurants/:id" element={<RestaurantDetails />} />
                <Route path="restaurants/:id/edit" element={<RestaurantForm />} />
                <Route path="verification" element={<VerificationQueue />} />
                <Route path="users" element={<UserList />} />
                <Route path="users/new" element={<UserForm />} />
                <Route path="users/:id" element={<UserDetails />} />
                <Route path="users/:id/edit" element={<UserForm />} />
                <Route path="roles" element={<RoleManagement />} />
                <Route path="subscriptions" element={<SubscriptionPlans />} />
                <Route path="subscriptions/list" element={<SubscriptionList />} />
                <Route path="subscriptions/invoices" element={<InvoiceList />} />
                <Route path="subscriptions/revenue" element={<RevenueReport />} />
                <Route path="analytics" element={<PlatformAnalytics />} />
                <Route path="analytics/revenue" element={<RevenueAnalytics />} />
                <Route path="analytics/users" element={<UserAnalytics />} />
                <Route path="contact-messages" element={<ContactMessages />} />
                
                
                {/* Knowledge Base route remains if needed */}
                <Route path="settings" element={<PlatformProfile />} />
                {/* Backwards-compatible system route aliases */}
                <Route path="system" element={<Navigate to="system/settings" replace />} />
                {/* Support legacy URLs under /platform/system/... */}
                <Route path="system/settings" element={<SystemSettings />} />
                <Route path="system/health" element={<SystemHealth />} />
                <Route path="system/audit-logs" element={<AuditLogs />} />
                <Route path="system/backups" element={<BackupManager />} />
                <Route path="settings/health" element={<SystemHealth />} />
                <Route path="settings/audit-logs" element={<AuditLogs />} />
                <Route path="settings/backups" element={<BackupManager />} />
                <Route path="settings/email" element={<Navigate to="/platform/system/settings" replace />} />
                <Route path="settings/security" element={<Navigate to="/platform/system/settings" replace />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="health" element={<SystemHealth />} />
                <Route path="backups" element={<BackupManager />} />
              </Route>
            </Route>
            
            {/* Restaurant Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['restaurant_admin']} />}>
              {/* <Route path="/restaurant" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/restaurant/dashboard" element={<Navigate to="/admin/dashboard" replace />} /> */}
              <Route path="/admin" element={<RestaurantLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" />} />
                <Route path="dashboard" element={<RestaurantDashboard />} />
                <Route path="profile" element={<RestaurantProfilePage />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="categories" element={<CategoryManager />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="tables" element={<TableManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="promotions" element={<CouponManagement />} />
                <Route path="analytics" element={<RestaurantAnalytics />} />
                <Route path="analytics/sales" element={<SalesReport />} />
                <Route path="analytics/orders" element={<OrderReport />} />
                <Route path="analytics/menu" element={<MenuPerformance />} />
                <Route path="analytics/customers" element={<CustomerReport />} />
                <Route path="reviews" element={<ReviewManagement />} />
                <Route path="restaurant/qr" element={<RestaurantQRCodePage />} />
                <Route path="settings" element={<RestaurantSettings />} />
              </Route>
            </Route>
            
            {/* Chef/Kitchen Routes */}
            <Route element={<ProtectedRoute allowedRoles={['chef', 'restaurant_admin', 'manager']} />}>
              <Route path="/chef" element={<KitchenLayout />}>
                <Route index element={<Navigate to="/chef/kitchen" />} />
                  <Route path="kitchen" element={<KitchenPage />} />
                  <Route path="kitchen/completed" element={<KitchenPage />} />
                  <Route path="kitchen/active" element={<KitchenPage />} />
                  <Route path="completed" element={<KitchenPage />} />
                  <Route path="active" element={<KitchenPage />} />
              </Route>
            </Route>
            
            {/* Waiter Routes */}
            <Route element={<ProtectedRoute allowedRoles={['waiter']} />}>
              <Route path="/waiter" element={<WaiterLayout />}>
                <Route index element={<Navigate to="/waiter/dashboard" />} />
                <Route path="dashboard" element={<WaiterDashboard />} />
                <Route path="orders" element={<WaiterOrderList />} />
                <Route path="tables" element={<WaiterTableMap />} />
                <Route path="reservations" element={<ReservationList />} />
                <Route path="calls" element={<CallRequests />} />
                <Route path="notifications" element={<WaiterNotifications />} />
                <Route path="profile" element={<WaiterProfile />} />
              </Route>
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </QueryClientProvider>
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

export default App
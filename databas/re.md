menugo-frontend/src/
├── components/
│   └── kitchen/
│       ├── KitchenDashboard.jsx
│       ├── KitchenOrderCard.jsx
│       ├── KitchenOrderList.jsx
│       ├── KitchenStats.jsx
│       ├── KitchenTimer.jsx
│       ├── KitchenStatusBadge.jsx
│       ├── KitchenOrderDetails.jsx
│       ├── KitchenFilters.jsx
│       ├── KitchenHeader.jsx
│       ├── KitchenLineDisplay.jsx
│       ├── KitchenCompletedOrders.jsx
│       ├── KitchenInventoryAlert.jsx
│       └── KitchenSoundNotification.jsx
├── hooks/
│   └── useKitchen.js
├── services/
│   └── kitchenService.js
├── pages/
│   └── KitchenPage.jsx
└── styles/
    └── kitchen.css


menugo-frontend/
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   ├── manifest.json
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── placeholder-food.jpg
│   ├── placeholder-avatar.png
│   └── sounds/
│       ├── new-order.mp3
│       ├── order-confirmed.mp3
│       ├── order-ready.mp3
│       └── notification.mp3
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   │   └── inter/
│   │   ├── images/
│   │   │   ├── empty-states/
│   │   │   │   ├── no-orders.svg
│   │   │   │   ├── no-items.svg
│   │   │   │   ├── no-data.svg
│   │   │   │   └── no-notifications.svg
│   │   │   ├── illustrations/
│   │   │   │   ├── welcome.svg
│   │   │   │   ├── analytics.svg
│   │   │   │   └── qr-code.svg
│   │   │   └── flags/
│   │   │       ├── us.svg
│   │   │       └── global.svg
│   │   └── icons/
│   │       ├── categories/
│   │       ├── status/
│   │       └── dietary/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   ├── Radio.jsx
│   │   │   ├── Switch.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   ├── TimePicker.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ConfirmationDialog.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── CountdownTimer.jsx
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── RestaurantLayout.jsx
│   │   │   ├── WaiterLayout.jsx
│   │   │   ├── CustomerLayout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MobileNav.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── UserMenu.jsx
│   │   ├── platform-admin/
│   │   │   ├── dashboard/
│   │   │   │   ├── PlatformDashboard.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── RestaurantGrowthChart.jsx
│   │   │   │   ├── RecentRestaurants.jsx
│   │   │   │   ├── RecentOrders.jsx
│   │   │   │   ├── PlatformMetrics.jsx
│   │   │   │   ├── SystemHealth.jsx
│   │   │   │   └── QuickActions.jsx
│   │   │   ├── restaurants/
│   │   │   │   ├── RestaurantList.jsx
│   │   │   │   ├── RestaurantCard.jsx
│   │   │   │   ├── RestaurantDetails.jsx
│   │   │   │   ├── RestaurantForm.jsx
│   │   │   │   ├── RestaurantFilters.jsx
│   │   │   │   ├── VerificationQueue.jsx
│   │   │   │   ├── VerificationModal.jsx
│   │   │   │   ├── RestaurantAnalytics.jsx
│   │   │   │   └── RestaurantDocuments.jsx
│   │   │   ├── users/
│   │   │   │   ├── UserList.jsx
│   │   │   │   ├── UserDetails.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   ├── UserFilters.jsx
│   │   │   │   └── RoleManagement.jsx
│   │   │   ├── subscriptions/
│   │   │   │   ├── SubscriptionPlans.jsx
│   │   │   │   ├── PlanCard.jsx
│   │   │   │   ├── PlanForm.jsx
│   │   │   │   ├── SubscriptionList.jsx
│   │   │   │   ├── InvoiceList.jsx
│   │   │   │   └── RevenueReport.jsx
│   │   │   ├── analytics/
│   │   │   │   ├── PlatformAnalytics.jsx
│   │   │   │   ├── RevenueAnalytics.jsx
│   │   │   │   ├── UserAnalytics.jsx
│   │   │   │   ├── DateRangePicker.jsx
│   │   │   │   └── ExportReport.jsx
│   │   │   ├── support/
│   │   │   │   ├── TicketList.jsx
│   │   │   │   ├── TicketDetails.jsx
│   │   │   │   ├── TicketForm.jsx
│   │   │   │   ├── TicketFilters.jsx
│   │   │   │   ├── TicketMessages.jsx
│   │   │   │   └── KnowledgeBase.jsx
│   │   │   └── system/
│   │   │       ├── SystemSettings.jsx
│   │   │       ├── EmailSettings.jsx
│   │   │       ├── SecuritySettings.jsx
│   │   │       ├── AuditLogs.jsx
│   │   │       ├── SystemHealth.jsx
│   │   │       └── BackupManager.jsx
│   │   ├── restaurant-admin/
│   │   │   ├── dashboard/
│   │   │   │   ├── RestaurantDashboard.jsx
│   │   │   │   ├── DashboardMetrics.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── OrdersChart.jsx
│   │   │   │   ├── PopularItemsChart.jsx
│   │   │   │   ├── RecentOrdersTable.jsx
│   │   │   │   ├── QuickActions.jsx
│   │   │   │   ├── TodaySchedule.jsx
│   │   │   │   ├── LowStockAlert.jsx
│   │   │   │   └── CustomerInsights.jsx
│   │   │   ├── menu/
│   │   │   │   ├── MenuManagement.jsx
│   │   │   │   ├── MenuList.jsx
│   │   │   │   ├── MenuGrid.jsx
│   │   │   │   ├── MenuItemCard.jsx
│   │   │   │   ├── MenuItemForm.jsx
│   │   │   │   ├── MenuItemModal.jsx
│   │   │   │   ├── MenuFilters.jsx
│   │   │   │   ├── MenuSearch.jsx
│   │   │   │   ├── BulkActions.jsx
│   │   │   │   └── MenuImportExport.jsx
│   │   │   ├── categories/
│   │   │   │   ├── CategoryManager.jsx
│   │   │   │   ├── CategoryList.jsx
│   │   │   │   ├── CategoryCard.jsx
│   │   │   │   ├── CategoryForm.jsx
│   │   │   │   ├── CategoryModal.jsx
│   │   │   │   ├── DragDropCategories.jsx
│   │   │   │   └── CategoryFilter.jsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderManagement.jsx
│   │   │   │   ├── OrderList.jsx
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   ├── OrderTable.jsx
│   │   │   │   ├── OrderFilters.jsx
│   │   │   │   ├── OrderDetailsModal.jsx
│   │   │   │   ├── OrderItemsList.jsx
│   │   │   │   ├── OrderStatusBadge.jsx
│   │   │   │   ├── OrderTimeline.jsx
│   │   │   │   └── KitchenDisplay.jsx
│   │   │   ├── tables/
│   │   │   │   ├── TableManagement.jsx
│   │   │   │   ├── TableGrid.jsx
│   │   │   │   ├── TableCard.jsx
│   │   │   │   ├── TableMap.jsx
│   │   │   │   ├── TableForm.jsx
│   │   │   │   ├── TableModal.jsx
│   │   │   │   ├── TableFilters.jsx
│   │   │   │   ├── ReservationsList.jsx
│   │   │   │   ├── ReservationForm.jsx
│   │   │   │   ├── ReservationCalendar.jsx
│   │   │   │   └── QRCodeGenerator.jsx
│   │   │   ├── staff/
│   │   │   │   ├── StaffManagement.jsx
│   │   │   │   ├── StaffList.jsx
│   │   │   │   ├── StaffCard.jsx
│   │   │   │   ├── StaffForm.jsx
│   │   │   │   ├── StaffModal.jsx
│   │   │   │   ├── StaffFilters.jsx
│   │   │   │   ├── RoleManagement.jsx
│   │   │   │   ├── PermissionManager.jsx
│   │   │   │   └── StaffSchedule.jsx
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryManagement.jsx
│   │   │   │   ├── InventoryList.jsx
│   │   │   │   ├── InventoryItemCard.jsx
│   │   │   │   ├── InventoryForm.jsx
│   │   │   │   ├── LowStockAlert.jsx
│   │   │   │   ├── StockAdjustment.jsx
│   │   │   │   └── InventoryTransactions.jsx
│   │   │   ├── promotions/
│   │   │   │   ├── CouponManagement.jsx
│   │   │   │   ├── CouponList.jsx
│   │   │   │   ├── CouponCard.jsx
│   │   │   │   ├── CouponForm.jsx
│   │   │   │   └── CouponAnalytics.jsx
│   │   │   ├── analytics/
│   │   │   │   ├── RestaurantAnalytics.jsx
│   │   │   │   ├── SalesReport.jsx
│   │   │   │   ├── OrderReport.jsx
│   │   │   │   ├── MenuPerformance.jsx
│   │   │   │   ├── CustomerReport.jsx
│   │   │   │   ├── DateRangePicker.jsx
│   │   │   │   ├── ExportReport.jsx
│   │   │   │   └── ReportFilters.jsx
│   │   │   ├── reviews/
│   │   │   │   ├── ReviewManagement.jsx
│   │   │   │   ├── ReviewList.jsx
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── ReviewFilters.jsx
│   │   │   │   ├── ReviewResponse.jsx
│   │   │   │   └── RatingStars.jsx
│   │   │   └── settings/
│   │   │       ├── RestaurantSettings.jsx
│   │   │       ├── RestaurantProfile.jsx
│   │   │       ├── OperatingHours.jsx
│   │   │       ├── DeliverySettings.jsx
│   │   │       ├── PaymentSettings.jsx
│   │   │       ├── NotificationSettings.jsx
│   │   │       ├── TaxSettings.jsx
│   │   │       ├── ThemeSettings.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── ChangePassword.jsx
│   │   │       └── SubscriptionPlan.jsx
│   │   ├── waiter/
│   │   │   ├── dashboard/
│   │   │   │   ├── WaiterDashboard.jsx
│   │   │   │   ├── WaiterStats.jsx
│   │   │   │   ├── TodayMetrics.jsx
│   │   │   │   ├── PerformanceChart.jsx
│   │   │   │   └── RecentActivity.jsx
│   │   │   ├── orders/
│   │   │   │   ├── WaiterOrderList.jsx
│   │   │   │   ├── WaiterOrderCard.jsx
│   │   │   │   ├── OrderGrid.jsx
│   │   │   │   ├── OrderFilters.jsx
│   │   │   │   ├── OrderSearch.jsx
│   │   │   │   ├── OrderStatusBadge.jsx
│   │   │   │   └── OrderPriorityBadge.jsx
│   │   │   ├── order-details/
│   │   │   │   ├── OrderDetailsModal.jsx
│   │   │   │   ├── OrderItemsList.jsx
│   │   │   │   ├── OrderSummary.jsx
│   │   │   │   ├── CustomerInfo.jsx
│   │   │   │   ├── TableInfo.jsx
│   │   │   │   ├── SpecialInstructions.jsx
│   │   │   │   └── OrderActions.jsx
│   │   │   ├── verification/
│   │   │   │   ├── VerifyOrderModal.jsx
│   │   │   │   ├── RejectOrderModal.jsx
│   │   │   │   ├── VerificationCode.jsx
│   │   │   │   ├── QRVerification.jsx
│   │   │   │   └── ManualVerification.jsx
│   │   │   ├── tables/
│   │   │   │   ├── WaiterTableMap.jsx
│   │   │   │   ├── WaiterTableCard.jsx
│   │   │   │   ├── TableGrid.jsx
│   │   │   │   ├── TableStatusBadge.jsx
│   │   │   │   ├── TableAssignment.jsx
│   │   │   │   └── TableTransfer.jsx
│   │   │   ├── reservations/
│   │   │   │   ├── ReservationList.jsx
│   │   │   │   ├── ReservationCard.jsx
│   │   │   │   ├── ReservationCalendar.jsx
│   │   │   │   └── SeatReservation.jsx
│   │   │   ├── calls/
│   │   │   │   ├── CallRequests.jsx
│   │   │   │   ├── CallCard.jsx
│   │   │   │   ├── CallDetails.jsx
│   │   │   │   └── AcknowledgeCall.jsx
│   │   │   ├── notifications/
│   │   │   │   ├── WaiterNotificationList.jsx
│   │   │   │   ├── WaiterNotificationItem.jsx
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   └── SoundNotification.jsx
│   │   │   └── profile/
│   │   │       ├── WaiterProfile.jsx
│   │   │       ├── ProfileForm.jsx
│   │   │       ├── ChangePassword.jsx
│   │   │       ├── AvailabilitySchedule.jsx
│   │   │       └── PerformanceStats.jsx
│   │   ├── customer/
│   │   │   ├── menu/
│   │   │   │   ├── MenuDisplay.jsx
│   │   │   │   ├── RestaurantHeader.jsx
│   │   │   │   ├── CategoryTabs.jsx
│   │   │   │   ├── MenuGridView.jsx
│   │   │   │   ├── MenuListView.jsx
│   │   │   │   ├── MenuItemCard.jsx
│   │   │   │   ├── MenuItemModal.jsx
│   │   │   │   ├── DietaryIcons.jsx
│   │   │   │   ├── AvailabilityBadge.jsx
│   │   │   │   ├── SpiceLevel.jsx
│   │   │   │   ├── ItemOptions.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── FilterDrawer.jsx
│   │   │   ├── cart/
│   │   │   │   ├── CartDrawer.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   ├── TableInput.jsx
│   │   │   │   ├── SpecialInstructions.jsx
│   │   │   │   └── OrderButton.jsx
│   │   │   ├── order/
│   │   │   │   ├── OrderConfirmation.jsx
│   │   │   │   ├── OrderStatus.jsx
│   │   │   │   ├── OrderTracker.jsx
│   │   │   │   ├── OrderHistory.jsx
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   └── EstimatedTime.jsx
│   │   │   └── qr/
│   │   │       ├── QRScanner.jsx
│   │   │       ├── QRCodeDisplay.jsx
│   │   │       ├── CameraView.jsx
│   │   │       └── ErrorHandler.jsx
│   │   └── auth/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── ForgotPassword.jsx
│   │       ├── ResetPassword.jsx
│   │       ├── VerifyEmail.jsx
│   │       ├── TwoFactorAuth.jsx
│   │       └── SocialLogin.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useRestaurant.js
│   │   ├── useMenu.js
│   │   ├── useOrders.js
│   │   ├── useTables.js
│   │   ├── useWaiters.js
│   │   ├── useQRCode.js
│   │   ├── useAnalytics.js
│   │   ├── useInventory.js
│   │   ├── useNotifications.js
│   │   ├── useWebSocket.js
│   │   ├── useAudio.js
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   ├── useWindowSize.js
│   │   ├── useClickOutside.js
│   │   ├── useSwipe.js
│   │   └── usePermissions.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── restaurantService.js
│   │   ├── menuService.js
│   │   ├── categoryService.js
│   │   ├── orderService.js
│   │   ├── tableService.js
│   │   ├── reservationService.js
│   │   ├── waiterService.js
│   │   ├── qrService.js
│   │   ├── analyticsService.js
│   │   ├── inventoryService.js
│   │   ├── promotionService.js
│   │   ├── reviewService.js
│   │   ├── notificationService.js
│   │   ├── uploadService.js
│   │   ├── reportService.js
│   │   ├── subscriptionService.js
│   │   └── webSocketService.js
│   ├── store/
│   │   ├── authStore.js
│   │   ├── restaurantStore.js
│   │   ├── menuStore.js
│   │   ├── orderStore.js
│   │   ├── tableStore.js
│   │   ├── reservationStore.js
│   │   ├── waiterStore.js
│   │   ├── cartStore.js
│   │   ├── analyticsStore.js
│   │   ├── notificationStore.js
│   │   └── uiStore.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── dateUtils.js
│   │   ├── currency.js
│   │   ├── errorHandler.js
│   │   ├── permissions.js
│   │   ├── exportUtils.js
│   │   ├── chartConfig.js
│   │   ├── socketUtils.js
│   │   ├── audioUtils.js
│   │   └── localStorage.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── dashboard.css
│   │   └── mobile.css
│   ├── types/
│   │   ├── user.types.js
│   │   ├── restaurant.types.js
│   │   ├── menu.types.js
│   │   ├── order.types.js
│   │   ├── table.types.js
│   │   ├── waiter.types.js
│   │   ├── analytics.types.js
│   │   └── api.types.js
│   ├── config/
│   │   ├── api.config.js
│   │   ├── routes.config.js
│   │   ├── theme.config.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
├── .env
├── .env.example
├── .gitignore
├── .eslintrc.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md 
-- ============================================
-- MenuGo Digital Menu SaaS Platform
-- COMPLETE UNIFIED DATABASE SCHEMA
-- Version: 4.0 (Full Integration)
-- Includes: Core Platform, Restaurant Management, Waiter Dashboard
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS & AUTHENTICATION TABLES
-- ============================================

-- Users table (base user accounts)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'waiter', 'restaurant_admin', 'platform_admin', 'support_agent')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    preferences JSONB DEFAULT '{"language": "en", "theme": "light", "notifications": true}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL,
    refresh_token VARCHAR(512),
    device_info JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- ============================================
-- 2. RESTAURANT MANAGEMENT TABLES
-- ============================================

-- Restaurants table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    cover_image_url TEXT,
    cuisine_type VARCHAR(100),
    cuisine_types TEXT[],
    operating_hours JSONB,
    delivery_radius_km DECIMAL(5,2),
    minimum_order_amount DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    service_charge DECIMAL(5,2) DEFAULT 0,
    delivery_fee DECIMAL(5,2) DEFAULT 0,
    qr_code_url TEXT,
    qr_code_identifier VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
    subscription_start_date DATE,
    subscription_end_date DATE,
    subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
    max_menu_items INT DEFAULT 50,
    max_users INT DEFAULT 5,
    max_orders_per_day INT DEFAULT 100,
    features JSONB,
    settings JSONB DEFAULT '{
        "auto_accept_orders": false,
        "allow_online_payment": true,
        "allow_cash_payment": true,
        "enable_delivery": false,
        "enable_takeaway": true,
        "table_management": true,
        "order_notifications": true,
        "email_notifications": true,
        "sms_notifications": false,
        "loyalty_program": false,
        "happy_hour": false
    }'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INT DEFAULT 1,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Restaurant settings table (detailed settings)
CREATE TABLE restaurant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    setting_type VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, setting_key)
);

-- Restaurant staff/employees table
CREATE TABLE restaurant_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'waiter', 'chef', 'cashier', 'delivery')),
    permissions JSONB,
    assigned_tables TEXT[],
    is_active BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, user_id)
);

-- Staff activity logs
CREATE TABLE staff_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES restaurant_staff(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. WAITER MANAGEMENT TABLES
-- ============================================

-- Waiters table (extends restaurant_staff)
CREATE TABLE waiters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES restaurant_staff(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    shift_start TIME,
    shift_end TIME,
    assigned_sections TEXT[],
    assigned_tables UUID[],
    max_tables INT DEFAULT 5,
    is_on_duty BOOLEAN DEFAULT false,
    current_shift_start TIMESTAMP,
    current_shift_end TIMESTAMP,
    rating DECIMAL(3,2) DEFAULT 0,
    total_orders_served INT DEFAULT 0,
    total_tips DECIMAL(10,2) DEFAULT 0,
    total_revenue_generated DECIMAL(10,2) DEFAULT 0,
    preferred_language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{
        "sound_enabled": true,
        "vibration_enabled": true,
        "new_order_notification": true,
        "order_ready_notification": true,
        "push_notifications": true
    }'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Waiter shift logs
CREATE TABLE waiter_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'absent', 'late', 'break')),
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    break_duration INT DEFAULT 0,
    total_hours DECIMAL(5,2),
    orders_served INT DEFAULT 0,
    tips_earned DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waiter performance metrics
CREATE TABLE waiter_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    orders_served INT DEFAULT 0,
    tables_served INT DEFAULT 0,
    average_response_time INT,
    average_preparation_time INT,
    customer_satisfaction DECIMAL(3,2),
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_tips DECIMAL(10,2) DEFAULT 0,
    upsell_count INT DEFAULT 0,
    upsell_revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(waiter_id, date)
);

-- Waiter real-time status
CREATE TABLE waiter_realtime_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('online', 'offline', 'busy', 'break', 'away')),
    current_location JSONB,
    current_table_id UUID,
    last_activity TIMESTAMP,
    battery_level INT,
    app_version VARCHAR(50),
    device_info JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waiter activity log
CREATE TABLE waiter_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    device_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. MENU MANAGEMENT TABLES
-- ============================================

-- Menu categories table
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, name)
);

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    image_url TEXT,
    image_public_id VARCHAR(255),
    thumbnail_url TEXT,
    video_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_recommended BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_halal BOOLEAN DEFAULT false,
    spice_level INT DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 5),
    preparation_time INT,
    calories INT,
    serving_size VARCHAR(50),
    allergens TEXT[],
    tags TEXT[],
    display_order INT DEFAULT 0,
    stock_quantity INT,
    low_stock_threshold INT,
    sales_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Menu item options groups
CREATE TABLE menu_item_option_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    is_required BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu item options
CREATE TABLE menu_item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    option_group_id UUID REFERENCES menu_item_option_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu item modifiers (add-ons)
CREATE TABLE menu_item_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu item modifier assignments
CREATE TABLE menu_item_modifier_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_id UUID REFERENCES menu_item_modifiers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. TABLE MANAGEMENT TABLES
-- ============================================

-- Restaurant tables
CREATE TABLE restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    capacity INT DEFAULT 4,
    qr_code_id UUID,
    qr_code_url TEXT,
    section VARCHAR(100),
    x_position INT,
    y_position INT,
    shape VARCHAR(20) DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'square')),
    width INT,
    height INT,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'maintenance')),
    current_order_id UUID,
    current_waiter_id UUID REFERENCES waiters(id),
    current_customer_name VARCHAR(255),
    occupied_since TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, table_number)
);

-- Table assignments history
CREATE TABLE table_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table status history
CREATE TABLE table_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Table reservations
CREATE TABLE table_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    party_size INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INT DEFAULT 120,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'seated', 'cancelled', 'no_show', 'completed')),
    special_requests TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. ORDER MANAGEMENT TABLES
-- ============================================

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    waiter_id UUID REFERENCES waiters(id),
    table_id UUID REFERENCES restaurant_tables(id),
    table_number VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    service_charge DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'rejected')),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed', 'partial')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'online', 'mobile_money')),
    payment_intent_id VARCHAR(255),
    order_type VARCHAR(50) DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    delivery_address TEXT,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    special_instructions TEXT,
    verified_by UUID REFERENCES users(id),
    verified_by_waiter BOOLEAN DEFAULT false,
    verification_code VARCHAR(10),
    verification_code_expires TIMESTAMP,
    verified_at TIMESTAMP,
    prepared_by UUID REFERENCES users(id),
    prepared_at TIMESTAMP,
    preparation_started_at TIMESTAMP,
    preparation_completed_at TIMESTAMP,
    ready_at TIMESTAMP,
    served_by UUID REFERENCES users(id),
    served_at TIMESTAMP,
    delivered_by UUID REFERENCES users(id),
    delivered_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    rejected_reason TEXT,
    estimated_preparation_time INT,
    actual_preparation_time INT,
    source VARCHAR(50) DEFAULT 'qr_code' CHECK (source IN ('qr_code', 'waiter', 'online', 'pos')),
    coupon_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order item options (selected choices)
CREATE TABLE order_item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    option_name VARCHAR(100) NOT NULL,
    choice_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0
);

-- Order item modifiers
CREATE TABLE order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0
);

-- Order status history
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order verification attempts
CREATE TABLE order_verification_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES waiters(id),
    verification_method VARCHAR(50) CHECK (verification_method IN ('qr_code', 'manual', 'table_check')),
    verification_code_entered VARCHAR(10),
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info JSONB
);

-- Order rejection reasons
CREATE TABLE order_rejection_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reason_code VARCHAR(50) UNIQUE NOT NULL,
    reason_text VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default rejection reasons
INSERT INTO order_rejection_reasons (reason_code, reason_text) VALUES
('INVALID_TABLE', 'Invalid table number or table not found'),
('DUPLICATE_ORDER', 'Duplicate order detected'),
('CUSTOMER_CANCELLED', 'Customer cancelled the order'),
('ITEM_UNAVAILABLE', 'Ordered items are not available'),
('PAYMENT_ISSUE', 'Payment verification failed'),
('SUSPICIOUS_ACTIVITY', 'Suspicious order activity detected'),
('TECHNICAL_ISSUE', 'Technical issue with order processing');

-- ============================================
-- 7. QR CODE & SCANNING TABLES
-- ============================================

-- QR codes table
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    identifier VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    qr_image_url TEXT,
    table_id UUID REFERENCES restaurant_tables(id),
    table_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    scan_count INT DEFAULT 0,
    last_scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR code scan logs
CREATE TABLE qr_code_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    location JSONB
);

-- ============================================
-- 8. WAITER NOTIFICATIONS & ALERTS
-- ============================================

-- Waiter notifications
CREATE TABLE waiter_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) CHECK (notification_type IN ('new_order', 'order_verified', 'order_ready', 'order_served', 'table_assigned', 'table_released', 'customer_call', 'system_alert')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    action_url TEXT,
    action_required BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waiter call requests (customer calls waiter)
CREATE TABLE waiter_call_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES waiters(id),
    call_type VARCHAR(50) CHECK (call_type IN ('service', 'bill', 'help', 'food_issue', 'other')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'cancelled')),
    customer_name VARCHAR(255),
    notes TEXT,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. CUSTOMER FEEDBACK & REVIEWS
-- ============================================

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reported')),
    reply_from_restaurant TEXT,
    reply_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waiter specific feedback
CREATE TABLE waiter_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    response_time_rating INT CHECK (response_time_rating BETWEEN 1 AND 5),
    service_quality_rating INT CHECK (service_quality_rating BETWEEN 1 AND 5),
    helpfulness_rating INT CHECK (helpfulness_rating BETWEEN 1 AND 5),
    tags TEXT[],
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. WAITER TIPS & COMMISSION
-- ============================================

-- Tips tracking
CREATE TABLE waiter_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    tip_type VARCHAR(50) CHECK (tip_type IN ('cash', 'card', 'digital')),
    transaction_id VARCHAR(255),
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commission tracking for upsells
CREATE TABLE waiter_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 11. ANALYTICS & REPORTING TABLES
-- ============================================

-- Daily sales summary
CREATE TABLE daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_tax DECIMAL(10,2) DEFAULT 0,
    total_service_charge DECIMAL(10,2) DEFAULT 0,
    total_delivery_fee DECIMAL(10,2) DEFAULT 0,
    total_discount DECIMAL(10,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    dine_in_orders INT DEFAULT 0,
    dine_in_revenue DECIMAL(10,2) DEFAULT 0,
    takeaway_orders INT DEFAULT 0,
    takeaway_revenue DECIMAL(10,2) DEFAULT 0,
    delivery_orders INT DEFAULT 0,
    delivery_revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, date)
);

-- Menu item analytics
CREATE TABLE menu_item_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    view_count INT DEFAULT 0,
    add_to_cart_count INT DEFAULT 0,
    order_count INT DEFAULT 0,
    quantity_sold INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, menu_item_id, date)
);

-- Hourly analytics
CREATE TABLE hourly_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hour INT NOT NULL,
    orders_count INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, date, hour)
);

-- ============================================
-- 12. PROMOTIONS & COUPONS
-- ============================================

-- Coupons table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_one_get_one')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    applicable_items TEXT[],
    applicable_categories TEXT[],
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon usage
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. INVENTORY MANAGEMENT
-- ============================================

-- Inventory items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    quantity DECIMAL(10,2) DEFAULT 0,
    reorder_level DECIMAL(10,2),
    reorder_quantity DECIMAL(10,2),
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('purchase', 'usage', 'waste', 'adjustment')),
    quantity DECIMAL(10,2) NOT NULL,
    previous_quantity DECIMAL(10,2),
    new_quantity DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================

-- General notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('new_order', 'order_verified', 'order_preparing', 'order_ready', 'order_served', 'order_cancelled', 'order_completed', 'low_stock', 'new_review', 'promotion', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Push notification tokens
CREATE TABLE push_notification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL,
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES (Performance Optimization)
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Restaurants indexes
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_restaurants_subscription ON restaurants(subscription_end_date);
CREATE INDEX idx_restaurants_city ON restaurants(city);

-- Waiters indexes
CREATE INDEX idx_waiters_user ON waiters(user_id);
CREATE INDEX idx_waiters_restaurant ON waiters(restaurant_id);
CREATE INDEX idx_waiters_is_on_duty ON waiters(is_on_duty);
CREATE INDEX idx_waiters_employee ON waiters(employee_id);

-- Menu indexes
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);

-- Orders indexes
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_waiter ON orders(waiter_id);
CREATE INDEX idx_orders_waiter_status ON orders(waiter_id, status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table ON orders(restaurant_id, table_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_verification_code ON orders(verification_code) WHERE verification_code IS NOT NULL;

-- Tables indexes
CREATE INDEX idx_restaurant_tables_restaurant ON restaurant_tables(restaurant_id);
CREATE INDEX idx_restaurant_tables_status ON restaurant_tables(status);
CREATE INDEX idx_table_assignments_waiter ON table_assignments(waiter_id, unassigned_at);
CREATE INDEX idx_table_reservations_date ON table_reservations(reservation_date, reservation_time);

-- QR code indexes
CREATE INDEX idx_qr_codes_restaurant ON qr_codes(restaurant_id);
CREATE INDEX idx_qr_codes_identifier ON qr_codes(identifier);

-- Waiter notifications indexes
CREATE INDEX idx_waiter_notifications_waiter ON waiter_notifications(waiter_id, is_read);
CREATE INDEX idx_waiter_calls_waiter ON waiter_call_requests(waiter_id, status);

-- Performance indexes
CREATE INDEX idx_waiter_performance_waiter_date ON waiter_performance(waiter_id, date);
CREATE INDEX idx_waiter_shifts_waiter_date ON waiter_shifts(waiter_id, shift_date);

-- Analytics indexes
CREATE INDEX idx_daily_sales_restaurant_date ON daily_sales_summary(restaurant_id, date);
CREATE INDEX idx_menu_item_analytics_restaurant_date ON menu_item_analytics(restaurant_id, date);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    month_part VARCHAR(2);
    day_part VARCHAR(2);
    seq_part VARCHAR(6);
BEGIN
    year_part := TO_CHAR(NEW.created_at, 'YYYY');
    month_part := TO_CHAR(NEW.created_at, 'MM');
    day_part := TO_CHAR(NEW.created_at, 'DD');
    
    SELECT LPAD(COUNT(*)::TEXT, 6, '0') INTO seq_part
    FROM orders
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NEW.created_at)
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NEW.created_at)
      AND EXTRACT(DAY FROM created_at) = EXTRACT(DAY FROM NEW.created_at);
    
    NEW.order_number := year_part || month_part || day_part || '-' || seq_part;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update waiter performance on order completion
CREATE OR REPLACE FUNCTION update_waiter_performance_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_waiter_id UUID;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SELECT id INTO v_waiter_id FROM waiters WHERE user_id = NEW.served_by;
        
        IF v_waiter_id IS NOT NULL THEN
            INSERT INTO waiter_performance (waiter_id, date, orders_served, total_revenue)
            VALUES (v_waiter_id, CURRENT_DATE, 1, NEW.total_amount)
            ON CONFLICT (waiter_id, date)
            DO UPDATE SET 
                orders_served = waiter_performance.orders_served + 1,
                total_revenue = waiter_performance.total_revenue + NEW.total_amount;
            
            UPDATE waiters 
            SET 
                total_orders_served = total_orders_served + 1,
                total_revenue_generated = total_revenue_generated + NEW.total_amount
            WHERE id = v_waiter_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waiters_updated_at BEFORE UPDATE ON waiters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_generate_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();
CREATE TRIGGER trigger_update_waiter_performance AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_waiter_performance_on_order();

-- ============================================
-- VIEWS
-- ============================================

-- Restaurant dashboard view
CREATE VIEW restaurant_dashboard_view AS
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.logo_url,
    COUNT(DISTINCT mi.id) as total_menu_items,
    COUNT(DISTINCT mc.id) as total_categories,
    COUNT(DISTINCT o.id) FILTER (WHERE o.created_at::date = CURRENT_DATE) as orders_today,
    COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE THEN o.total_amount ELSE 0 END), 0) as revenue_today,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'preparing') as preparing_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'ready') as ready_orders,
    COUNT(DISTINCT rt.id) FILTER (WHERE rt.status = 'occupied') as occupied_tables,
    COUNT(DISTINCT rt.id) as total_tables,
    COALESCE(AVG(rv.rating), 0) as average_rating
FROM restaurants r
LEFT JOIN menu_items mi ON mi.restaurant_id = r.id AND mi.deleted_at IS NULL
LEFT JOIN menu_categories mc ON mc.restaurant_id = r.id
LEFT JOIN orders o ON o.restaurant_id = r.id
LEFT JOIN restaurant_tables rt ON rt.restaurant_id = r.id
LEFT JOIN reviews rv ON rv.restaurant_id = r.id AND rv.status = 'approved'
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, r.logo_url;

-- Waiter active orders view
CREATE VIEW waiter_active_orders_view AS
SELECT 
    o.id,
    o.order_number,
    o.table_number,
    o.customer_name,
    o.total_amount,
    o.status,
    o.created_at,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_items,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - o.created_at)) / 60 as minutes_waiting
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.status NOT IN ('completed', 'cancelled', 'rejected')
GROUP BY o.id;

-- Table occupancy view
CREATE VIEW table_occupancy_view AS
SELECT 
    rt.id,
    rt.table_number,
    rt.table_name,
    rt.capacity,
    rt.section,
    rt.status,
    rt.current_customer_name,
    rt.occupied_since,
    o.id as order_id,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - rt.occupied_since)) / 60 as occupied_minutes
FROM restaurant_tables rt
LEFT JOIN orders o ON o.id = rt.current_order_id
WHERE rt.status = 'occupied';

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Get waiter dashboard data
CREATE OR REPLACE FUNCTION get_waiter_dashboard(p_waiter_id UUID)
RETURNS TABLE (
    active_orders_count BIGINT,
    active_tables_count BIGINT,
    today_orders_count BIGINT,
    today_revenue DECIMAL,
    today_tips DECIMAL,
    pending_calls_count BIGINT,
    pending_notifications_count BIGINT,
    current_shift_status VARCHAR,
    performance_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM orders WHERE waiter_id = p_waiter_id AND status IN ('pending', 'verified', 'preparing', 'ready')) as active_orders_count,
        (SELECT COUNT(*) FROM restaurant_tables WHERE current_waiter_id = p_waiter_id AND status = 'occupied') as active_tables_count,
        (SELECT COUNT(*) FROM orders WHERE waiter_id = p_waiter_id AND created_at::date = CURRENT_DATE) as today_orders_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE waiter_id = p_waiter_id AND created_at::date = CURRENT_DATE AND status = 'completed') as today_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM waiter_tips WHERE waiter_id = p_waiter_id AND created_at::date = CURRENT_DATE) as today_tips,
        (SELECT COUNT(*) FROM waiter_call_requests WHERE waiter_id = p_waiter_id AND status = 'pending') as pending_calls_count,
        (SELECT COUNT(*) FROM waiter_notifications WHERE waiter_id = p_waiter_id AND is_read = false) as pending_notifications_count,
        (SELECT status FROM waiter_shifts WHERE waiter_id = p_waiter_id AND shift_date = CURRENT_DATE ORDER BY created_at DESC LIMIT 1) as current_shift_status,
        (SELECT rating FROM waiters WHERE id = p_waiter_id) as performance_rating;
END;
$$ LANGUAGE plpgsql;

-- Verify order procedure
CREATE OR REPLACE FUNCTION verify_order(
    p_order_id UUID,
    p_waiter_id UUID,
    p_verification_code VARCHAR DEFAULT NULL,
    p_verification_method VARCHAR DEFAULT 'manual'
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    order_status VARCHAR
) AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_verification_valid BOOLEAN := false;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Order not found', NULL::VARCHAR;
        RETURN;
    END IF;
    
    IF v_order.status != 'pending' THEN
        RETURN QUERY SELECT false, 'Order already processed', v_order.status;
        RETURN;
    END IF;
    
    IF p_verification_method = 'qr_code' THEN
        IF v_order.verification_code = p_verification_code 
           AND v_order.verification_code_expires > CURRENT_TIMESTAMP THEN
            v_verification_valid := true;
        END IF;
    ELSIF p_verification_method IN ('manual', 'table_check') THEN
        v_verification_valid := true;
    END IF;
    
    INSERT INTO order_verification_attempts (order_id, waiter_id, verification_method, verification_code_entered, success)
    VALUES (p_order_id, p_waiter_id, p_verification_method, p_verification_code, v_verification_valid);
    
    IF v_verification_valid THEN
        UPDATE orders SET 
            status = 'verified',
            verified_by = (SELECT user_id FROM waiters WHERE id = p_waiter_id),
            verified_by_waiter = true,
            verified_at = CURRENT_TIMESTAMP
        WHERE id = p_order_id;
        
        RETURN QUERY SELECT true, 'Order verified successfully', 'verified';
    ELSE
        RETURN QUERY SELECT false, 'Verification failed', v_order.status;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample users
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_verified, email_verified) VALUES 
('11111111-1111-1111-1111-111111111111', 'restaurant.owner@menugo.com', crypt('Owner@123', gen_salt('bf')), 'John Owner', '+1234567890', 'restaurant_admin', true, true),
('22222222-2222-2222-2222-222222222222', 'waiter1@menugo.com', crypt('Waiter@123', gen_salt('bf')), 'Mike Waiter', '+1234567891', 'waiter', true, true),
('33333333-3333-3333-3333-333333333333', 'chef1@menugo.com', crypt('Chef@123', gen_salt('bf')), 'Chef Gordon', '+1234567892', 'waiter', true, true),
('44444444-4444-4444-4444-444444444444', 'customer@example.com', crypt('Customer@123', gen_salt('bf')), 'Sarah Customer', '+1234567893', 'customer', true, true);

-- Insert sample restaurant
INSERT INTO restaurants (id, owner_id, name, description, address, city, country, phone, email, cuisine_type, operating_hours, qr_code_identifier, subscription_tier, is_active, is_verified, latitude, longitude) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Gourmet Bistro', 'Fine dining experience with international cuisine', '123 Main Street', 'New York', 'USA', '+1234567890', 'contact@gourmetbistro.com', 'Fusion', 
 '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "21:00"}}',
 'gourmet-bistro-nyc-12345', 'premium', true, true, 40.7128, -74.0060);

-- Insert sample restaurant staff
INSERT INTO restaurant_staff (id, restaurant_id, user_id, role, permissions, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'waiter', 
 '{"can_view_orders": true, "can_update_order_status": true, "can_verify_orders": true, "can_view_tables": true}', true),
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'chef',
 '{"can_view_orders": true, "can_update_order_status": true, "can_view_menu": true}', true);

-- Insert sample waiters
INSERT INTO waiters (id, staff_id, user_id, restaurant_id, employee_id, hire_date, hourly_rate, shift_start, shift_end, assigned_sections, max_tables) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'WTR001', '2024-01-15', 15.00, '09:00', '17:00', ARRAY['Main Hall', 'Window'], 5),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'WTR002', '2024-02-01', 15.50, '14:00', '22:00', ARRAY['Patio', 'Bar'], 4);

-- Insert sample tables
INSERT INTO restaurant_tables (id, restaurant_id, table_number, table_name, capacity, section, status) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1', 'Window Table 1', 4, 'Window', 'available'),
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2', 'Window Table 2', 4, 'Window', 'available'),
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '3', 'Center Table', 6, 'Main Hall', 'occupied');

-- Insert sample orders
INSERT INTO orders (id, order_number, restaurant_id, waiter_id, table_id, table_number, customer_name, subtotal, tax_amount, total_amount, status, payment_status, order_type, source, created_at) VALUES
('11111111-aaaa-bbbb-cccc-dddddddddddd', NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '3', 'John Doe', 55.97, 5.60, 61.57, 'pending', 'unpaid', 'dine_in', 'qr_code', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- ============================================
-- END OF COMPLETE DATABASE SCHEMA
-- ============================================
 ...based on the above  frontend and and database   please give me  the complate  backend folder and file structure??/ in  node and express? rewrite again ????
menugo-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── socket.js
│   │   ├── multer.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── restaurantController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── tableController.js
│   │   ├── waiterController.js
│   │   ├── qrController.js
│   │   ├── analyticsController.js
│   │   ├── reviewController.js
│   │   ├── couponController.js
│   │   ├── inventoryController.js
│   │   ├── notificationController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── rateLimitMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Waiter.js
│   │   ├── MenuCategory.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Table.js
│   │   ├── Reservation.js
│   │   ├── QRCode.js
│   │   ├── Review.js
│   │   ├── Coupon.js
│   │   ├── Inventory.js
│   │   ├── Notification.js
│   │   └── Analytics.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── tableRoutes.js
│   │   ├── waiterRoutes.js
│   │   ├── qrRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── paymentService.js
│   │   ├── qrService.js
│   │   ├── socketService.js
│   │   ├── redisService.js
│   │   └── reportService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   ├── generateQR.js
│   │   ├── generateInvoice.js
│   │   ├── logger.js
│   │   └── seedData.js
│   ├── sockets/
│   │   ├── orderSocket.js
│   │   ├── notificationSocket.js
│   │   └── waiterSocket.js
│   ├── validations/
│   │   ├── authValidation.js
│   │   ├── restaurantValidation.js
│   │   ├── menuValidation.js
│   │   ├── orderValidation.js
│   │   └── waiterValidation.js
│   ├── app.js
│   └── server.js
├── uploads/
│   ├── menus/
│   ├── qrcodes/
│   └── avatars/
├── logs/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── ecosystem.config.js
└── README.md
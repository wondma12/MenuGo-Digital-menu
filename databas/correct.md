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

  
menugo-backend-
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── socket.js
│   │   ├── multer.js
│   │   ├── cloudinary.js
│   │   ├── stripe.js
│   │   ├── email.js
│   │   └── passport.js
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
│   │   ├── reportController.js
│   │   ├── subscriptionController.js
│   │   ├── dashboardController.js
│   │   └── platformController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── cacheMiddleware.js
│   │   ├── loggingMiddleware.js
│   │   └── securityMiddleware.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── UserSession.js
│   │   ├── Restaurant.js
│   │   ├── RestaurantSetting.js
│   │   ├── RestaurantStaff.js
│   │   ├── Waiter.js
│   │   ├── WaiterShift.js
│   │   ├── WaiterPerformance.js
│   │   ├── WaiterRealtimeStatus.js
│   │   ├── WaiterActivityLog.js
│   │   ├── MenuCategory.js
│   │   ├── MenuItem.js
│   │   ├── MenuItemOptionGroup.js
│   │   ├── MenuItemOption.js
│   │   ├── MenuItemModifier.js
│   │   ├── MenuItemModifierAssignment.js
│   │   ├── Table.js
│   │   ├── TableAssignment.js
│   │   ├── TableStatusHistory.js
│   │   ├── TableReservation.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── OrderItemOption.js
│   │   ├── OrderItemModifier.js
│   │   ├── OrderStatusHistory.js
│   │   ├── OrderVerificationAttempt.js
│   │   ├── OrderRejectionReason.js
│   │   ├── QRCode.js
│   │   ├── QRCodeScan.js
│   │   ├── Review.js
│   │   ├── WaiterFeedback.js
│   │   ├── Coupon.js
│   │   ├── CouponUsage.js
│   │   ├── InventoryItem.js
│   │   ├── InventoryTransaction.js
│   │   ├── Notification.js
│   │   ├── WaiterNotification.js
│   │   ├── WaiterCallRequest.js
│   │   ├── WaiterTip.js
│   │   ├── WaiterCommission.js
│   │   ├── PushNotificationToken.js
│   │   ├── DailySalesSummary.js
│   │   ├── MenuItemAnalytics.js
│   │   ├── HourlyAnalytics.js
│   │   └── StaffActivityLog.js
│   ├── routes/
│   │   ├── index.js
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
│   │   ├── reportRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── platformRoutes.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── paymentService.js
│   │   ├── qrService.js
│   │   ├── socketService.js
│   │   ├── redisService.js
│   │   ├── reportService.js
│   │   ├── exportService.js
│   │   ├── notificationService.js
│   │   ├── analyticsService.js
│   │   ├── cacheService.js
│   │   ├── tokenService.js
│   │   └── webhookService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   ├── generateQR.js
│   │   ├── generateInvoice.js
│   │   ├── logger.js
│   │   ├── seedData.js
│   │   ├── apiResponse.js
│   │   ├── apiError.js
│   │   ├── catchAsync.js
│   │   ├── dateUtils.js
│   │   ├── formatters.js
│   │   ├── encryption.js
│   │   └── permissions.js
│   ├── sockets/
│   │   ├── index.js
│   │   ├── orderSocket.js
│   │   ├── notificationSocket.js
│   │   ├── waiterSocket.js
│   │   ├── tableSocket.js
│   │   └── analyticsSocket.js
│   ├── validations/
│   │   ├── authValidation.js
│   │   ├── restaurantValidation.js
│   │   ├── menuValidation.js
│   │   ├── orderValidation.js
│   │   ├── waiterValidation.js
│   │   ├── tableValidation.js
│   │   ├── reviewValidation.js
│   │   ├── couponValidation.js
│   │   └── reportValidation.js
│   ├── jobs/
│   │   ├── cronJobs.js
│   │   ├── dailyReportJob.js
│   │   ├── analyticsJob.js
│   │   ├── subscriptionJob.js
│   │   └── cleanupJob.js
│   ├── templates/
│   │   ├── email/
│   │   │   ├── welcome.hbs
│   │   │   ├── resetPassword.hbs
│   │   │   ├── orderConfirmation.hbs
│   │   │   ├── invoice.hbs
│   │   │   └── dailyReport.hbs
│   │   └── invoice/
│   │       └── invoiceTemplate.html
│   ├── app.js
│   └── server.js
├── uploads/
│   ├── menus/
│   ├── qrcodes/
│   ├── avatars/
│   ├── invoices/
│   └── temp/
├── logs/
│   ├── combined.log
│   ├── error.log
│   └── request.log
├── scripts/
│   ├── seedDatabase.js
│   ├── migrateDatabase.js
│   └── backupDatabase.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── database.sql
├── .env
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── package-lock.json
├── ecosystem.config.js
├── nginx.conf
└── README.md
-- ============================================
-- MenuGo Digital Menu SaaS Platform
-- COMPLETE MYSQL DATABASE SCHEMA
-- Version: 4.0 (MySQL Edition)
-- Includes: Core Platform, Restaurant Management, Waiter Dashboard
-- ============================================

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS menugo_db;
CREATE DATABASE menugo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE menugo_db;

-- ============================================
-- 1. USERS & AUTHENTICATION TABLES
-- ============================================

-- Users table (base user accounts)
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
    email_verification_expires TIMESTAMP NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    preferences JSON DEFAULT '{"language": "en", "theme": "light", "notifications": true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
);

-- User sessions table
CREATE TABLE user_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    token VARCHAR(512) NOT NULL,
    refresh_token VARCHAR(512),
    device_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user (user_id),
    INDEX idx_user_sessions_token (token(255)),
    INDEX idx_user_sessions_expires (expires_at)
);

-- ============================================
-- 2. RESTAURANT MANAGEMENT TABLES
-- ============================================

-- Restaurants table
CREATE TABLE restaurants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id CHAR(36),
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
    cuisine_types JSON,
    operating_hours JSON,
    delivery_radius_km DECIMAL(5,2),
    minimum_order_amount DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    service_charge DECIMAL(5,2) DEFAULT 0,
    delivery_fee DECIMAL(5,2) DEFAULT 0,
    qr_code_url TEXT,
    qr_code_identifier VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP NULL,
    verified_by CHAR(36),
    rejection_reason TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
    subscription_start_date DATE,
    subscription_end_date DATE,
    subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
    max_menu_items INT DEFAULT 50,
    max_users INT DEFAULT 5,
    max_orders_per_day INT DEFAULT 100,
    features JSON,
    settings JSON DEFAULT '{
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
    }',
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INT DEFAULT 1,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_restaurants_owner (owner_id),
    INDEX idx_restaurants_is_active (is_active),
    INDEX idx_restaurants_subscription (subscription_end_date),
    INDEX idx_restaurants_city (city)
);

-- Restaurant settings table (detailed settings)
CREATE TABLE restaurant_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSON,
    setting_type VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_restaurant_setting (restaurant_id, setting_key),
    INDEX idx_restaurant_settings_key (setting_key)
);

-- Restaurant staff/employees table
CREATE TABLE restaurant_staff (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    user_id CHAR(36),
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'waiter', 'chef', 'cashier', 'delivery')),
    permissions JSON,
    assigned_tables JSON,
    is_active BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_restaurant_staff (restaurant_id, user_id),
    INDEX idx_restaurant_staff_role (role),
    INDEX idx_restaurant_staff_active (is_active)
);

-- Staff activity logs
CREATE TABLE staff_activity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    staff_id CHAR(36),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id CHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES restaurant_staff(id) ON DELETE CASCADE,
    INDEX idx_staff_activity_staff (staff_id),
    INDEX idx_staff_activity_created (created_at)
);

-- ============================================
-- 3. WAITER MANAGEMENT TABLES
-- ============================================

-- Waiters table (extends restaurant_staff)
CREATE TABLE waiters (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    staff_id CHAR(36),
    user_id CHAR(36),
    restaurant_id CHAR(36),
    employee_id VARCHAR(50) UNIQUE,
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    shift_start TIME,
    shift_end TIME,
    assigned_sections JSON,
    assigned_tables JSON,
    max_tables INT DEFAULT 5,
    is_on_duty BOOLEAN DEFAULT false,
    current_shift_start TIMESTAMP NULL,
    current_shift_end TIMESTAMP NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    total_orders_served INT DEFAULT 0,
    total_tips DECIMAL(10,2) DEFAULT 0,
    total_revenue_generated DECIMAL(10,2) DEFAULT 0,
    preferred_language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSON DEFAULT '{
        "sound_enabled": true,
        "vibration_enabled": true,
        "new_order_notification": true,
        "order_ready_notification": true,
        "push_notifications": true
    }',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (staff_id) REFERENCES restaurant_staff(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_waiters_user (user_id),
    INDEX idx_waiters_restaurant (restaurant_id),
    INDEX idx_waiters_is_on_duty (is_on_duty),
    INDEX idx_waiters_employee (employee_id)
);

-- Waiter shift logs
CREATE TABLE waiter_shifts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36),
    shift_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    actual_start TIMESTAMP NULL,
    actual_end TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'absent', 'late', 'break')),
    break_start TIMESTAMP NULL,
    break_end TIMESTAMP NULL,
    break_duration INT DEFAULT 0,
    total_hours DECIMAL(5,2),
    orders_served INT DEFAULT 0,
    tips_earned DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    INDEX idx_waiter_shifts_waiter (waiter_id),
    INDEX idx_waiter_shifts_date (shift_date),
    INDEX idx_waiter_shifts_status (status)
);

-- Waiter performance metrics
CREATE TABLE waiter_performance (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36),
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_waiter_performance (waiter_id, date),
    INDEX idx_waiter_performance_waiter (waiter_id),
    INDEX idx_waiter_performance_date (date)
);

-- Waiter real-time status
CREATE TABLE waiter_realtime_status (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36),
    status VARCHAR(50) CHECK (status IN ('online', 'offline', 'busy', 'break', 'away')),
    current_location JSON,
    current_table_id CHAR(36),
    last_activity TIMESTAMP,
    battery_level INT,
    app_version VARCHAR(50),
    device_info JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_waiter_status (waiter_id),
    INDEX idx_waiter_status_status (status)
);

-- Waiter activity log
CREATE TABLE waiter_activity_log (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id CHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    device_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    INDEX idx_waiter_activity_waiter (waiter_id),
    INDEX idx_waiter_activity_created (created_at),
    INDEX idx_waiter_activity_action (action)
);

-- ============================================
-- 4. MENU MANAGEMENT TABLES
-- ============================================

-- Menu categories table
CREATE TABLE menu_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_restaurant_category (restaurant_id, name),
    INDEX idx_menu_categories_restaurant (restaurant_id),
    INDEX idx_menu_categories_active (is_active)
);

-- Menu items table
CREATE TABLE menu_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    category_id CHAR(36),
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
    allergens JSON,
    tags JSON,
    display_order INT DEFAULT 0,
    stock_quantity INT,
    low_stock_threshold INT,
    sales_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL,
    INDEX idx_menu_items_restaurant (restaurant_id),
    INDEX idx_menu_items_category (category_id),
    INDEX idx_menu_items_is_available (is_available),
    INDEX idx_menu_items_price (price),
    INDEX idx_menu_items_rating (rating)
);

-- Menu item options groups
CREATE TABLE menu_item_option_groups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    is_required BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_option_groups_restaurant (restaurant_id)
);

-- Menu item options
CREATE TABLE menu_item_options (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    menu_item_id CHAR(36),
    option_group_id CHAR(36),
    name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (option_group_id) REFERENCES menu_item_option_groups(id) ON DELETE CASCADE,
    INDEX idx_menu_item_options_item (menu_item_id),
    INDEX idx_menu_item_options_group (option_group_id)
);

-- Menu item modifiers (add-ons)
CREATE TABLE menu_item_modifiers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_modifiers_restaurant (restaurant_id),
    INDEX idx_modifiers_active (is_active)
);

-- Menu item modifier assignments
CREATE TABLE menu_item_modifier_assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    menu_item_id CHAR(36),
    modifier_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (modifier_id) REFERENCES menu_item_modifiers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_item_modifier (menu_item_id, modifier_id)
);

-- ============================================
-- 5. TABLE MANAGEMENT TABLES
-- ============================================

-- Restaurant tables
CREATE TABLE restaurant_tables (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    table_number VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    capacity INT DEFAULT 4,
    qr_code_id CHAR(36),
    qr_code_url TEXT,
    section VARCHAR(100),
    x_position INT,
    y_position INT,
    shape VARCHAR(20) DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'square')),
    width INT,
    height INT,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'maintenance')),
    current_order_id CHAR(36),
    current_waiter_id CHAR(36),
    current_customer_name VARCHAR(255),
    occupied_since TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (current_waiter_id) REFERENCES waiters(id),
    UNIQUE KEY unique_restaurant_table (restaurant_id, table_number),
    INDEX idx_restaurant_tables_restaurant (restaurant_id),
    INDEX idx_restaurant_tables_status (status),
    INDEX idx_restaurant_tables_section (section)
);

-- Table assignments history
CREATE TABLE table_assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    table_id CHAR(36),
    waiter_id CHAR(36),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    INDEX idx_table_assignments_waiter (waiter_id, unassigned_at),
    INDEX idx_table_assignments_table (table_id)
);

-- Table status history
CREATE TABLE table_status_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    table_id CHAR(36),
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by CHAR(36),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_table_status_history_table (table_id),
    INDEX idx_table_status_history_changed (changed_at)
);

-- Table reservations
CREATE TABLE table_reservations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    table_id CHAR(36),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    party_size INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INT DEFAULT 120,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'seated', 'cancelled', 'no_show', 'completed')),
    special_requests TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_table_reservations_date (reservation_date, reservation_time),
    INDEX idx_table_reservations_restaurant (restaurant_id),
    INDEX idx_table_reservations_status (status)
);

-- ============================================
-- 6. ORDER MANAGEMENT TABLES
-- ============================================

-- Orders table
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_number VARCHAR(50) UNIQUE,
    restaurant_id CHAR(36),
    user_id CHAR(36),
    waiter_id CHAR(36),
    table_id CHAR(36),
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
    verified_by CHAR(36),
    verified_by_waiter BOOLEAN DEFAULT false,
    verification_code VARCHAR(10),
    verification_code_expires TIMESTAMP NULL,
    verified_at TIMESTAMP NULL,
    prepared_by CHAR(36),
    prepared_at TIMESTAMP NULL,
    preparation_started_at TIMESTAMP NULL,
    preparation_completed_at TIMESTAMP NULL,
    ready_at TIMESTAMP NULL,
    served_by CHAR(36),
    served_at TIMESTAMP NULL,
    delivered_by CHAR(36),
    delivered_at TIMESTAMP NULL,
    cancelled_by CHAR(36),
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    rejected_reason TEXT,
    estimated_preparation_time INT,
    actual_preparation_time INT,
    source VARCHAR(50) DEFAULT 'qr_code' CHECK (source IN ('qr_code', 'waiter', 'online', 'pos')),
    coupon_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id),
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (prepared_by) REFERENCES users(id),
    FOREIGN KEY (served_by) REFERENCES users(id),
    FOREIGN KEY (delivered_by) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id),
    INDEX idx_orders_restaurant (restaurant_id),
    INDEX idx_orders_waiter (waiter_id),
    INDEX idx_orders_waiter_status (waiter_id, status),
    INDEX idx_orders_status (status),
    INDEX idx_orders_table (restaurant_id, table_number),
    INDEX idx_orders_created_at (created_at),
    INDEX idx_orders_verification_code (verification_code),
    INDEX idx_orders_order_number (order_number)
);

-- Order items table
CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36),
    menu_item_id CHAR(36),
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_menu (menu_item_id),
    INDEX idx_order_items_status (status)
);

-- Order item options (selected choices)
CREATE TABLE order_item_options (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_item_id CHAR(36),
    option_name VARCHAR(100) NOT NULL,
    choice_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    INDEX idx_order_item_options_item (order_item_id)
);

-- Order item modifiers
CREATE TABLE order_item_modifiers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_item_id CHAR(36),
    modifier_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    INDEX idx_order_item_modifiers_item (order_item_id)
);

-- Order status history
CREATE TABLE order_status_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36),
    status VARCHAR(50) NOT NULL,
    changed_by CHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_order_status_history_order (order_id),
    INDEX idx_order_status_history_created (created_at)
);

-- Order verification attempts
CREATE TABLE order_verification_attempts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36),
    waiter_id CHAR(36),
    verification_method VARCHAR(50) CHECK (verification_method IN ('qr_code', 'manual', 'table_check')),
    verification_code_entered VARCHAR(10),
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id),
    INDEX idx_verification_attempts_order (order_id),
    INDEX idx_verification_attempts_waiter (waiter_id)
);

-- Order rejection reasons
CREATE TABLE order_rejection_reasons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reason_code VARCHAR(50) UNIQUE NOT NULL,
    reason_text VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rejection_reasons_code (reason_code)
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
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    identifier VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    qr_image_url TEXT,
    table_id CHAR(36),
    table_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    scan_count INT DEFAULT 0,
    last_scanned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    INDEX idx_qr_codes_restaurant (restaurant_id),
    INDEX idx_qr_codes_identifier (identifier),
    INDEX idx_qr_codes_active (is_active)
);

-- QR code scan logs
CREATE TABLE qr_code_scans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    qr_code_id CHAR(36),
    restaurant_id CHAR(36),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    location JSON,
    FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_qr_scans_code (qr_code_id),
    INDEX idx_qr_scans_scanned (scanned_at)
);

-- ============================================
-- 8. WAITER NOTIFICATIONS & ALERTS
-- ============================================

-- Waiter notifications
CREATE TABLE waiter_notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36),
    restaurant_id CHAR(36),
    order_id CHAR(36),
    notification_type VARCHAR(50) CHECK (notification_type IN ('new_order', 'order_verified', 'order_ready', 'order_served', 'table_assigned', 'table_released', 'customer_call', 'system_alert')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    action_url TEXT,
    action_required BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_waiter_notifications_waiter (waiter_id, is_read),
    INDEX idx_waiter_notifications_created (created_at),
    INDEX idx_waiter_notifications_type (notification_type)
);

-- Waiter call requests (customer calls waiter)
CREATE TABLE waiter_call_requests (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    table_id CHAR(36),
    waiter_id CHAR(36),
    call_type VARCHAR(50) CHECK (call_type IN ('service', 'bill', 'help', 'food_issue', 'other')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'cancelled')),
    customer_name VARCHAR(255),
    notes TEXT,
    acknowledged_by CHAR(36),
    acknowledged_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id),
    INDEX idx_waiter_calls_waiter (waiter_id, status),
    INDEX idx_waiter_calls_restaurant (restaurant_id),
    INDEX idx_waiter_calls_created (created_at)
);

-- ============================================
-- 9. CUSTOMER FEEDBACK & REVIEWS
-- ============================================

-- Reviews table
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    user_id CHAR(36),
    order_id CHAR(36),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    images JSON,
    is_verified_purchase BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reported')),
    reply_from_restaurant TEXT,
    reply_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_reviews_restaurant (restaurant_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_status (status),
    INDEX idx_reviews_created (created_at)
);

-- Waiter specific feedback
CREATE TABLE waiter_feedback (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    waiter_id CHAR(36),
    order_id CHAR(36),
    customer_name VARCHAR(255),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    response_time_rating INT CHECK (response_time_rating BETWEEN 1 AND 5),
    service_quality_rating INT CHECK (service_quality_rating BETWEEN 1 AND 5),
    helpfulness_rating INT CHECK (helpfulness_rating BETWEEN 1 AND 5),
    tags JSON,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_waiter_feedback_waiter (waiter_id),
    INDEX idx_waiter_feedback_rating (rating),
    INDEX idx_waiter_feedback_created (created_at)
);

-- ============================================
-- 10. WAITER TIPS & COMMISSION
-- ============================================

-- Tips tracking
CREATE TABLE waiter_tips (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36),
    order_id CHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    tip_type VARCHAR(50) CHECK (tip_type IN ('cash', 'card', 'digital')),
    transaction_id VARCHAR(255),
    recorded_by CHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_waiter_tips_waiter (waiter_id),
    INDEX idx_waiter_tips_order (order_id),
    INDEX idx_waiter_tips_created (created_at)
);

-- Commission tracking for upsells
CREATE TABLE waiter_commissions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36),
    order_item_id CHAR(36),
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    INDEX idx_waiter_commissions_waiter (waiter_id),
    INDEX idx_waiter_commissions_status (status)
);

-- ============================================
-- 11. ANALYTICS & REPORTING TABLES
-- ============================================

-- Daily sales summary
CREATE TABLE daily_sales_summary (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_sales (restaurant_id, date),
    INDEX idx_daily_sales_restaurant_date (restaurant_id, date)
);

-- Menu item analytics
CREATE TABLE menu_item_analytics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    menu_item_id CHAR(36),
    date DATE NOT NULL,
    view_count INT DEFAULT 0,
    add_to_cart_count INT DEFAULT 0,
    order_count INT DEFAULT 0,
    quantity_sold INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_menu_item_analytics (restaurant_id, menu_item_id, date),
    INDEX idx_menu_item_analytics_restaurant_date (restaurant_id, date)
);

-- Hourly analytics
CREATE TABLE hourly_analytics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    date DATE NOT NULL,
    hour INT NOT NULL,
    orders_count INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_hourly_analytics (restaurant_id, date, hour),
    INDEX idx_hourly_analytics_restaurant (restaurant_id),
    INDEX idx_hourly_analytics_date (date)
);

-- ============================================
-- 12. PROMOTIONS & COUPONS
-- ============================================

-- Coupons table
CREATE TABLE coupons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_one_get_one')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    applicable_items JSON,
    applicable_categories JSON,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_restaurant (restaurant_id),
    INDEX idx_coupons_active (is_active),
    INDEX idx_coupons_dates (start_date, end_date)
);

-- Coupon usage
CREATE TABLE coupon_usage (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    coupon_id CHAR(36),
    order_id CHAR(36),
    user_id CHAR(36),
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_coupon_usage_coupon (coupon_id),
    INDEX idx_coupon_usage_user (user_id),
    INDEX idx_coupon_usage_order (order_id)
);

-- ============================================
-- 13. INVENTORY MANAGEMENT
-- ============================================

-- Inventory items
CREATE TABLE inventory_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    quantity DECIMAL(10,2) DEFAULT 0,
    reorder_level DECIMAL(10,2),
    reorder_quantity DECIMAL(10,2),
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_inventory_items_restaurant (restaurant_id),
    INDEX idx_inventory_items_name (name),
    INDEX idx_inventory_items_low_stock (reorder_level, quantity)
);

-- Inventory transactions
CREATE TABLE inventory_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    inventory_item_id CHAR(36),
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('purchase', 'usage', 'waste', 'adjustment')),
    quantity DECIMAL(10,2) NOT NULL,
    previous_quantity DECIMAL(10,2),
    new_quantity DECIMAL(10,2),
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_inventory_transactions_item (inventory_item_id),
    INDEX idx_inventory_transactions_type (transaction_type),
    INDEX idx_inventory_transactions_created (created_at)
);

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================

-- General notifications
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    user_id CHAR(36),
    order_id CHAR(36),
    type VARCHAR(50) CHECK (type IN ('new_order', 'order_verified', 'order_preparing', 'order_ready', 'order_served', 'order_cancelled', 'order_completed', 'low_stock', 'new_review', 'promotion', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, is_read),
    INDEX idx_notifications_restaurant (restaurant_id),
    INDEX idx_notifications_created (created_at)
);

-- Push notification tokens
CREATE TABLE push_notification_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    token VARCHAR(512) NOT NULL,
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_device (user_id, device_id),
    INDEX idx_push_tokens_user (user_id),
    INDEX idx_push_tokens_token (token(255))
);

-- ============================================
-- CREATE VIEWS
-- ============================================

-- Restaurant dashboard view
CREATE OR REPLACE VIEW restaurant_dashboard_view AS
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.logo_url,
    COUNT(DISTINCT mi.id) as total_menu_items,
    COUNT(DISTINCT mc.id) as total_categories,
    SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN 1 ELSE 0 END) as orders_today,
    COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN o.total_amount ELSE 0 END), 0) as revenue_today,
    SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
    SUM(CASE WHEN o.status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
    SUM(CASE WHEN o.status = 'ready' THEN 1 ELSE 0 END) as ready_orders,
    SUM(CASE WHEN rt.status = 'occupied' THEN 1 ELSE 0 END) as occupied_tables,
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
CREATE OR REPLACE VIEW waiter_active_orders_view AS
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
    TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as minutes_waiting
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.status NOT IN ('completed', 'cancelled', 'rejected')
GROUP BY o.id;

-- Table occupancy view
CREATE OR REPLACE VIEW table_occupancy_view AS
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
    TIMESTAMPDIFF(MINUTE, rt.occupied_since, NOW()) as occupied_minutes
FROM restaurant_tables rt
LEFT JOIN orders o ON o.id = rt.current_order_id
WHERE rt.status = 'occupied';

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Get waiter dashboard data
CREATE PROCEDURE get_waiter_dashboard(
    IN p_waiter_id CHAR(36)
)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM orders WHERE waiter_id = p_waiter_id AND status IN ('pending', 'verified', 'preparing', 'ready')) as active_orders_count,
        (SELECT COUNT(*) FROM restaurant_tables WHERE current_waiter_id = p_waiter_id AND status = 'occupied') as active_tables_count,
        (SELECT COUNT(*) FROM orders WHERE waiter_id = p_waiter_id AND DATE(created_at) = CURDATE()) as today_orders_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE waiter_id = p_waiter_id AND DATE(created_at) = CURDATE() AND status = 'completed') as today_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM waiter_tips WHERE waiter_id = p_waiter_id AND DATE(created_at) = CURDATE()) as today_tips,
        (SELECT COUNT(*) FROM waiter_call_requests WHERE waiter_id = p_waiter_id AND status = 'pending') as pending_calls_count,
        (SELECT COUNT(*) FROM waiter_notifications WHERE waiter_id = p_waiter_id AND is_read = false) as pending_notifications_count,
        (SELECT status FROM waiter_shifts WHERE waiter_id = p_waiter_id AND shift_date = CURDATE() ORDER BY created_at DESC LIMIT 1) as current_shift_status,
        (SELECT rating FROM waiters WHERE id = p_waiter_id) as performance_rating;
END //

-- Verify order procedure
CREATE PROCEDURE verify_order(
    IN p_order_id CHAR(36),
    IN p_waiter_id CHAR(36),
    IN p_verification_code VARCHAR(10),
    IN p_verification_method VARCHAR(50)
)
BEGIN
    DECLARE v_order_status VARCHAR(50);
    DECLARE v_verification_valid BOOLEAN DEFAULT FALSE;
    DECLARE v_waiter_user_id CHAR(36);
    
    -- Get order status
    SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
    
    -- Get waiter user_id
    SELECT user_id INTO v_waiter_user_id FROM waiters WHERE id = p_waiter_id;
    
    IF v_order_status IS NULL THEN
        SELECT FALSE as success, 'Order not found' as message, NULL as order_status;
    ELSEIF v_order_status != 'pending' THEN
        SELECT FALSE as success, 'Order already processed' as message, v_order_status as order_status;
    ELSE
        -- Check verification
        IF p_verification_method = 'qr_code' THEN
            SELECT COUNT(*) > 0 INTO v_verification_valid
            FROM orders 
            WHERE id = p_order_id 
            AND verification_code = p_verification_code 
            AND verification_code_expires > NOW();
        ELSEIF p_verification_method IN ('manual', 'table_check') THEN
            SET v_verification_valid = TRUE;
        END IF;
        
        -- Log verification attempt
        INSERT INTO order_verification_attempts (order_id, waiter_id, verification_method, verification_code_entered, success)
        VALUES (p_order_id, p_waiter_id, p_verification_method, p_verification_code, v_verification_valid);
        
        IF v_verification_valid THEN
            UPDATE orders SET 
                status = 'verified',
                verified_by = v_waiter_user_id,
                verified_by_waiter = TRUE,
                verified_at = NOW()
            WHERE id = p_order_id;
            
            SELECT TRUE as success, 'Order verified successfully' as message, 'verified' as order_status;
        ELSE
            SELECT FALSE as success, 'Verification failed' as message, v_order_status as order_status;
        END IF;
    END IF;
END //

DELIMITER ;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Note: For MySQL, you need to use a proper password hashing
-- In production, use appropriate hashing method

-- Insert sample users (using SHA2 for demo, use bcrypt in production)
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_verified, email_verified) VALUES 
(UUID_TO_BIN(UUID()), 'restaurant.owner@menugo.com', SHA2('Owner@123', 256), 'John Owner', '+1234567890', 'restaurant_admin', true, true),
(UUID_TO_BIN(UUID()), 'waiter1@menugo.com', SHA2('Waiter@123', 256), 'Mike Waiter', '+1234567891', 'waiter', true, true),
(UUID_TO_BIN(UUID()), 'chef1@menugo.com', SHA2('Chef@123', 256), 'Chef Gordon', '+1234567892', 'waiter', true, true),
(UUID_TO_BIN(UUID()), 'customer@example.com', SHA2('Customer@123', 256), 'Sarah Customer', '+1234567893', 'customer', true, true);

-- Insert sample restaurant
INSERT INTO restaurants (id, owner_id, name, description, address, city, country, phone, email, cuisine_type, operating_hours, qr_code_identifier, subscription_tier, is_active, is_verified, latitude, longitude) VALUES 
(UUID_TO_BIN(UUID()), (SELECT id FROM users WHERE email = 'restaurant.owner@menugo.com'), 'Gourmet Bistro', 'Fine dining experience with international cuisine', '123 Main Street', 'New York', 'USA', '+1234567890', 'contact@gourmetbistro.com', 'Fusion', 
 '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "21:00"}}',
 'gourmet-bistro-nyc-12345', 'premium', true, true, 40.7128, -74.0060);

-- ============================================
-- END OF MYSQL DATABASE SCHEMA
-- ============================================


-- ============================================
-- MenuGo Digital Menu SaaS Platform
-- COMPLETE UNIFIED DATABASE SCHEMA (MySQL)
-- Version: 4.0 (Full Integration)
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
    role ENUM('customer', 'waiter', 'restaurant_admin', 'platform_admin', 'support_agent') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
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
    user_id CHAR(36) NOT NULL,
    token VARCHAR(512) NOT NULL,
    refresh_token VARCHAR(512),
    device_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_token (token),
    INDEX idx_user_sessions_user (user_id)
);

-- ============================================
-- 2. RESTAURANT MANAGEMENT TABLES
-- ============================================

-- Restaurants table
CREATE TABLE restaurants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id CHAR(36) NOT NULL,
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
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP NULL,
    verified_by CHAR(36),
    rejection_reason TEXT,
    subscription_tier ENUM('monthly', 'six_month', 'yearly') DEFAULT 'monthly',
    subscription_start_date DATE,
    subscription_end_date DATE,
    subscription_status ENUM('trial', 'active', 'past_due', 'cancelled', 'expired') DEFAULT 'trial',
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
    onboarding_completed BOOLEAN DEFAULT FALSE,
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
    restaurant_id CHAR(36) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSON,
    setting_type VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_restaurant_setting (restaurant_id, setting_key)
);

-- Restaurant staff/employees table
CREATE TABLE restaurant_staff (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('admin', 'manager', 'waiter', 'chef', 'cashier', 'delivery') NOT NULL,
    permissions JSON,
    assigned_tables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_restaurant_staff (restaurant_id, user_id),
    INDEX idx_restaurant_staff_user (user_id),
    INDEX idx_restaurant_staff_restaurant (restaurant_id)
);

-- Staff activity logs
CREATE TABLE staff_activity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    staff_id CHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id CHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES restaurant_staff(id) ON DELETE CASCADE,
    INDEX idx_staff_activity_logs_staff (staff_id),
    INDEX idx_staff_activity_logs_created (created_at)
);

-- ============================================
-- 3. WAITER MANAGEMENT TABLES
-- ============================================

-- Waiters table (extends restaurant_staff)
CREATE TABLE waiters (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    staff_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    shift_start TIME,
    shift_end TIME,
    assigned_sections JSON,
    assigned_tables JSON,
    max_tables INT DEFAULT 5,
    is_on_duty BOOLEAN DEFAULT FALSE,
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
    waiter_id CHAR(36) NOT NULL,
    shift_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    actual_start TIMESTAMP NULL,
    actual_end TIMESTAMP NULL,
    status ENUM('scheduled', 'active', 'completed', 'absent', 'late', 'break') DEFAULT 'scheduled',
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
    INDEX idx_waiter_shifts_date (shift_date)
);

-- Waiter performance metrics
CREATE TABLE waiter_performance (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    orders_served INT DEFAULT 0,
    tables_served INT DEFAULT 0,
    average_response_time INT COMMENT 'in seconds',
    average_preparation_time INT COMMENT 'in seconds',
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
    waiter_id CHAR(36) NOT NULL,
    status ENUM('online', 'offline', 'busy', 'break', 'away') NOT NULL,
    current_location JSON,
    current_table_id CHAR(36),
    last_activity TIMESTAMP,
    battery_level INT,
    app_version VARCHAR(50),
    device_info JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_waiter_realtime (waiter_id)
);

-- Waiter activity log
CREATE TABLE waiter_activity_log (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id CHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    device_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    INDEX idx_waiter_activity_log_waiter (waiter_id),
    INDEX idx_waiter_activity_log_created (created_at)
);

-- ============================================
-- 4. MENU MANAGEMENT TABLES
-- ============================================

-- Menu categories table
CREATE TABLE menu_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_menu_category (restaurant_id, name),
    INDEX idx_menu_categories_restaurant (restaurant_id)
);

-- Menu items table
CREATE TABLE menu_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
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
    is_available BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_halal BOOLEAN DEFAULT FALSE,
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
    INDEX idx_menu_items_name (name)
);

-- Menu item options groups
CREATE TABLE menu_item_option_groups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_option_groups_restaurant (restaurant_id)
);

-- Menu item options
CREATE TABLE menu_item_options (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    menu_item_id CHAR(36) NOT NULL,
    option_group_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
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
    restaurant_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_modifiers_restaurant (restaurant_id)
);

-- Menu item modifier assignments
CREATE TABLE menu_item_modifier_assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    menu_item_id CHAR(36) NOT NULL,
    modifier_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (modifier_id) REFERENCES menu_item_modifiers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_modifier_assignment (menu_item_id, modifier_id)
);

-- ============================================
-- 5. TABLE MANAGEMENT TABLES
-- ============================================

-- Restaurant tables
CREATE TABLE restaurant_tables (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    capacity INT DEFAULT 4,
    qr_code_id CHAR(36),
    qr_code_url TEXT,
    section VARCHAR(100),
    x_position INT,
    y_position INT,
    shape ENUM('rectangle', 'circle', 'square') DEFAULT 'rectangle',
    width INT,
    height INT,
    status ENUM('available', 'occupied', 'reserved', 'cleaning', 'maintenance') DEFAULT 'available',
    current_order_id CHAR(36),
    current_waiter_id CHAR(36),
    current_customer_name VARCHAR(255),
    occupied_since TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (current_waiter_id) REFERENCES waiters(id),
    UNIQUE KEY unique_restaurant_table (restaurant_id, table_number),
    INDEX idx_tables_restaurant (restaurant_id),
    INDEX idx_tables_status (status)
);

-- Table assignments history
CREATE TABLE table_assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    table_id CHAR(36) NOT NULL,
    waiter_id CHAR(36) NOT NULL,
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
    table_id CHAR(36) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
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
    restaurant_id CHAR(36) NOT NULL,
    table_id CHAR(36),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    party_size INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INT DEFAULT 120,
    status ENUM('confirmed', 'seated', 'cancelled', 'no_show', 'completed') DEFAULT 'confirmed',
    special_requests TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_reservations_date (reservation_date, reservation_time),
    INDEX idx_reservations_restaurant (restaurant_id)
);

-- ============================================
-- 6. ORDER MANAGEMENT TABLES
-- ============================================

-- Orders table
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_number VARCHAR(50) UNIQUE,
    restaurant_id CHAR(36) NOT NULL,
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
    status ENUM('pending', 'verified', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded', 'failed', 'partial') DEFAULT 'unpaid',
    payment_method ENUM('cash', 'card', 'online', 'mobile_money'),
    payment_intent_id VARCHAR(255),
    order_type ENUM('dine_in', 'takeaway', 'delivery') DEFAULT 'dine_in',
    delivery_address TEXT,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    special_instructions TEXT,
    verified_by CHAR(36),
    verified_by_waiter BOOLEAN DEFAULT FALSE,
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
    source ENUM('qr_code', 'waiter', 'online', 'pos') DEFAULT 'qr_code',
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
    INDEX idx_orders_status (status),
    INDEX idx_orders_table (restaurant_id, table_number),
    INDEX idx_orders_created_at (created_at),
    INDEX idx_orders_verification_code (verification_code)
);

-- Order items table
CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36),
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_menu_item (menu_item_id)
);

-- Order item options (selected choices)
CREATE TABLE order_item_options (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_item_id CHAR(36) NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    choice_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- Order item modifiers
CREATE TABLE order_item_modifiers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_item_id CHAR(36) NOT NULL,
    modifier_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- Order status history
CREATE TABLE order_status_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
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
    order_id CHAR(36) NOT NULL,
    waiter_id CHAR(36),
    verification_method ENUM('qr_code', 'manual', 'table_check') NOT NULL,
    verification_code_entered VARCHAR(10),
    success BOOLEAN DEFAULT FALSE,
    failure_reason TEXT,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id),
    INDEX idx_verification_attempts_order (order_id)
);

-- Order rejection reasons
CREATE TABLE order_rejection_reasons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reason_code VARCHAR(50) UNIQUE NOT NULL,
    reason_text VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
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
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    identifier VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    qr_image_url TEXT,
    table_id CHAR(36),
    table_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    scan_count INT DEFAULT 0,
    last_scanned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    INDEX idx_qr_codes_restaurant (restaurant_id),
    INDEX idx_qr_codes_identifier (identifier)
);

-- QR code scan logs
CREATE TABLE qr_code_scans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    qr_code_id CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    location JSON,
    FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_qr_code_scans_qr (qr_code_id),
    INDEX idx_qr_code_scans_restaurant (restaurant_id),
    INDEX idx_qr_code_scans_scanned (scanned_at)
);

-- ============================================
-- 8. WAITER NOTIFICATIONS & ALERTS
-- ============================================

-- Waiter notifications
CREATE TABLE waiter_notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    order_id CHAR(36),
    notification_type ENUM('new_order', 'order_verified', 'order_ready', 'order_served', 'table_assigned', 'table_released', 'customer_call', 'system_alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    action_url TEXT,
    action_required BOOLEAN DEFAULT FALSE,
    action_taken BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_waiter_notifications_waiter (waiter_id, is_read),
    INDEX idx_waiter_notifications_type (notification_type),
    INDEX idx_waiter_notifications_created (created_at)
);

-- Waiter call requests (customer calls waiter)
CREATE TABLE waiter_call_requests (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    table_id CHAR(36) NOT NULL,
    waiter_id CHAR(36),
    call_type ENUM('service', 'bill', 'help', 'food_issue', 'other') NOT NULL,
    status ENUM('pending', 'acknowledged', 'resolved', 'cancelled') DEFAULT 'pending',
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
    INDEX idx_waiter_calls_table (table_id),
    INDEX idx_waiter_calls_created (created_at)
);

-- ============================================
-- 9. CUSTOMER FEEDBACK & REVIEWS
-- ============================================

-- Reviews table
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    order_id CHAR(36),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    images JSON,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected', 'reported') DEFAULT 'pending',
    reply_from_restaurant TEXT,
    reply_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_reviews_restaurant (restaurant_id, rating),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_status (status)
);

-- Waiter specific feedback
CREATE TABLE waiter_feedback (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    waiter_id CHAR(36) NOT NULL,
    order_id CHAR(36),
    customer_name VARCHAR(255),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    response_time_rating INT CHECK (response_time_rating BETWEEN 1 AND 5),
    service_quality_rating INT CHECK (service_quality_rating BETWEEN 1 AND 5),
    helpfulness_rating INT CHECK (helpfulness_rating BETWEEN 1 AND 5),
    tags JSON,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_waiter_feedback_waiter (waiter_id),
    INDEX idx_waiter_feedback_rating (rating)
);

-- ============================================
-- 10. WAITER TIPS & COMMISSION
-- ============================================

-- Tips tracking
CREATE TABLE waiter_tips (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tip_type ENUM('cash', 'card', 'digital') NOT NULL,
    transaction_id VARCHAR(255),
    recorded_by CHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_waiter_tips_waiter (waiter_id),
    INDEX idx_waiter_tips_order (order_id)
);

-- Commission tracking for upsells
CREATE TABLE waiter_commissions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    waiter_id CHAR(36) NOT NULL,
    order_item_id CHAR(36) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waiter_id) REFERENCES waiters(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    INDEX idx_waiter_commissions_waiter (waiter_id, status)
);

-- ============================================
-- 11. ANALYTICS & REPORTING TABLES
-- ============================================

-- Daily sales summary
CREATE TABLE daily_sales_summary (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
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
    restaurant_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
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
    UNIQUE KEY unique_menu_analytics (restaurant_id, menu_item_id, date),
    INDEX idx_menu_analytics_restaurant_date (restaurant_id, date)
);

-- Hourly analytics
CREATE TABLE hourly_analytics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    hour INT NOT NULL,
    orders_count INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_hourly_analytics (restaurant_id, date, hour),
    INDEX idx_hourly_analytics_restaurant_date (restaurant_id, date)
);

-- ============================================
-- 12. PROMOTIONS & COUPONS
-- ============================================

-- Coupons table
CREATE TABLE coupons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount', 'buy_one_get_one') NOT NULL,
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_coupons_restaurant (restaurant_id),
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_dates (start_date, end_date)
);

-- Coupon usage
CREATE TABLE coupon_usage (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    coupon_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_coupon_usage_coupon (coupon_id),
    INDEX idx_coupon_usage_order (order_id),
    INDEX idx_coupon_usage_user (user_id)
);

-- ============================================
-- 13. INVENTORY MANAGEMENT
-- ============================================

-- Inventory items
CREATE TABLE inventory_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
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
    INDEX idx_inventory_items_low_stock (quantity, reorder_level)
);

-- Inventory transactions
CREATE TABLE inventory_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    inventory_item_id CHAR(36) NOT NULL,
    transaction_type ENUM('purchase', 'usage', 'waste', 'adjustment') NOT NULL,
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
    INDEX idx_inventory_transactions_created (created_at)
);

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================

-- General notifications
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    order_id CHAR(36),
    type ENUM('new_order', 'order_verified', 'order_preparing', 'order_ready', 'order_served', 'order_cancelled', 'order_completed', 'low_stock', 'new_review', 'promotion', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, is_read),
    INDEX idx_notifications_restaurant (restaurant_id, created_at)
);

-- Push notification tokens
CREATE TABLE push_notification_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token VARCHAR(512) NOT NULL,
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_token (user_id, token),
    INDEX idx_push_tokens_user (user_id),
    INDEX idx_push_tokens_token (token)
);

-- 
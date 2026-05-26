const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

// Models
const User = require('../src/models/User');
const UserSession = require('../src/models/UserSession');
const Restaurant = require('../src/models/Restaurant');
const RestaurantSetting = require('../src/models/RestaurantSetting');
const RestaurantStaff = require('../src/models/RestaurantStaff');
const Waiter = require('../src/models/Waiter');
const WaiterShift = require('../src/models/WaiterShift');
const WaiterPerformance = require('../src/models/WaiterPerformance');
const WaiterRealtimeStatus = require('../src/models/WaiterRealtimeStatus');
// eslint-disable-next-line no-unused-vars
const WaiterActivityLog = require('../src/models/WaiterActivityLog');
const MenuCategory = require('../src/models/MenuCategory');
const MenuItem = require('../src/models/MenuItem');
const MenuItemOptionGroup = require('../src/models/MenuItemOptionGroup');
const MenuItemOption = require('../src/models/MenuItemOption');
const MenuItemModifier = require('../src/models/MenuItemModifier');
const MenuItemModifierAssignment = require('../src/models/MenuItemModifierAssignment');
const Table = require('../src/models/Table');
const TableAssignment = require('../src/models/TableAssignment');
const TableStatusHistory = require('../src/models/TableStatusHistory');
const TableReservation = require('../src/models/TableReservation');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');
const OrderItemOption = require('../src/models/OrderItemOption');
const OrderItemModifier = require('../src/models/OrderItemModifier');
const OrderStatusHistory = require('../src/models/OrderStatusHistory');
// eslint-disable-next-line no-unused-vars
const OrderVerificationAttempt = require('../src/models/OrderVerificationAttempt');
const OrderRejectionReason = require('../src/models/OrderRejectionReason');
const QRCode = require('../src/models/QRCode');
const QRCodeScan = require('../src/models/QRCodeScan');
const Review = require('../src/models/Review');
const WaiterFeedback = require('../src/models/WaiterFeedback');
const Coupon = require('../src/models/Coupon');
const CouponUsage = require('../src/models/CouponUsage');
const InventoryItem = require('../src/models/InventoryItem');
const InventoryTransaction = require('../src/models/InventoryTransaction');
const Notification = require('../src/models/Notification');
const WaiterNotification = require('../src/models/WaiterNotification');
const WaiterCallRequest = require('../src/models/WaiterCallRequest');
const WaiterTip = require('../src/models/WaiterTip');
const WaiterCommission = require('../src/models/WaiterCommission');
const PushNotificationToken = require('../src/models/PushNotificationToken');
const DailySalesSummary = require('../src/models/DailySalesSummary');
const MenuItemAnalytics = require('../src/models/MenuItemAnalytics');
const HourlyAnalytics = require('../src/models/HourlyAnalytics');
const StaffActivityLog = require('../src/models/StaffActivityLog');
const SubscriptionPlan = require('../src/models/SubscriptionPlan');
const Subscription = require('../src/models/Subscription');
const Invoice = require('../src/models/Invoice');

// Constants
const USER_ROLES = {
  CUSTOMER: 'customer',
  WAITER: 'waiter',
  RESTAURANT_ADMIN: 'restaurant_admin',
  PLATFORM_ADMIN: 'platform_admin',
  SUPPORT_AGENT: 'support_agent',
};

const ORDER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// ============================================
// 1. SEED USERS
// ============================================
const seedUsers = async () => {
  console.log('Seeding users...');
  
  const seedUsersData = [
    {
      id: uuidv4(),
      email: 'admin@menugo.com',
      full_name: 'Platform Admin',
      phone: '+1234567890',
      role: USER_ROLES.PLATFORM_ADMIN,
      is_active: true,
      is_verified: true,
      email_verified: true,
      password: 'Admin@123',
    },
    
  ];

  const users = [];

  for (const user of seedUsersData) {
    const existing = await User.findOne({ where: { email: user.email } });
    const password_hash = await hashPassword(user.password);
    if (!existing) {
      const { password, ...userData } = user;
      const createdUser = await User.create({
        ...userData,
        password_hash,
      });
      users.push(createdUser.get({ plain: true }));
      console.log(`✓ Created user: ${user.email}`);
    } else {
      await existing.update({
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: true,
        is_verified: true,
        email_verified: true,
        password_hash,
      });
      users.push(existing.get({ plain: true }));
      console.log(`⚠ User already exists: ${user.email}`);
    }
  }
  
  return users;
};

// ============================================
// 2. SEED USER SESSIONS
// ============================================
const seedUserSessions = async (users) => {
  console.log('Seeding user sessions...');
  
  const admin = users.find(u => u.email === 'admin@menugo.com');
  
  if (!admin) return;

  const sessionData = {
    id: uuidv4(),
    user_id: admin.id,
    token: `sample_token_${  uuidv4()}`,
    refresh_token: `sample_refresh_${  uuidv4()}`,
    device_info: JSON.stringify({ browser: 'Chrome', os: 'Windows', device: 'Desktop' }),
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const existing = await UserSession.findOne({ where: { user_id: admin.id } });
  if (!existing) {
    await UserSession.create(sessionData);
    console.log('✓ Created user session');
  } else {
    console.log('⚠ User session already exists');
  }
};

// ============================================
// 3. SEED RESTAURANT
// ============================================
const seedRestaurant = async (users) => {
  console.log('Seeding restaurant...');
  
  const owner = users.find(u => u.email === 'restaurant.owner@menugo.com');
  if (!owner) {
    console.log('✗ Restaurant owner not found');
    return null;
  }

  const restaurantData = {
    id: uuidv4(),
    owner_id: owner.id,
    name: 'Gourmet Bistro',
    description: 'Fine dining experience with international cuisine',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postal_code: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
    phone: '+1234567890',
    email: 'contact@gourmetbistro.com',
    cuisine_type: 'Fusion',
    cuisine_types: JSON.stringify(['Italian', 'French', 'American']),
    operating_hours: JSON.stringify({
      monday: { open: '11:00', close: '22:00', is_closed: false },
      tuesday: { open: '11:00', close: '22:00', is_closed: false },
      wednesday: { open: '11:00', close: '22:00', is_closed: false },
      thursday: { open: '11:00', close: '22:00', is_closed: false },
      friday: { open: '11:00', close: '23:00', is_closed: false },
      saturday: { open: '10:00', close: '23:00', is_closed: false },
      sunday: { open: '10:00', close: '21:00', is_closed: false },
    }),
    delivery_radius_km: 10.5,
    minimum_order_amount: 15.00,
    tax_rate: 8.875,
    service_charge: 10.00,
    delivery_fee: 3.99,
    qr_code_identifier: 'gourmet-bistro-nyc-12345',
    subscription_tier: 'premium',
    is_active: true,
    is_verified: true,
    verification_date: new Date(),
    onboarding_completed: true,
    onboarding_step: 5,
    average_rating: 4.7,
    total_reviews: 128,
  };

  const existing = await Restaurant.findOne({ where: { name: restaurantData.name } });
  if (!existing) {
    const restaurant = await Restaurant.create(restaurantData);
    console.log('✓ Created restaurant: Gourmet Bistro');
    return restaurant;
  } else {
    console.log('⚠ Restaurant already exists');
    return existing;
  }
};

// ============================================
// 4. SEED RESTAURANT SETTINGS
// ============================================
const seedRestaurantSettings = async (restaurant) => {
  console.log('Seeding restaurant settings...');
  
  if (!restaurant) {
    return;
  }

  const settings = [
    {
      setting_key: 'auto_accept_orders',
      setting_value: JSON.stringify({ value: false }),
      setting_type: 'boolean',
      is_public: false,
    },
    {
      setting_key: 'allow_online_payment',
      setting_value: JSON.stringify({ value: true }),
      setting_type: 'boolean',
      is_public: true,
    },
    {
      setting_key: 'allow_cash_payment',
      setting_value: JSON.stringify({ value: true }),
      setting_type: 'boolean',
      is_public: true,
    },
    {
      setting_key: 'enable_delivery',
      setting_value: JSON.stringify({ value: true }),
      setting_type: 'boolean',
      is_public: true,
    },
    {
      setting_key: 'enable_takeaway',
      setting_value: JSON.stringify({ value: true }),
      setting_type: 'boolean',
      is_public: true,
    },
    {
      setting_key: 'table_management',
      setting_value: JSON.stringify({ value: true }),
      setting_type: 'boolean',
      is_public: false,
    },
  ];

  for (const setting of settings) {
    const existing = await RestaurantSetting.findOne({
      where: { restaurant_id: restaurant.id, setting_key: setting.setting_key },
    });
    if (!existing) {
      await RestaurantSetting.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        ...setting,
      });
      console.log(`✓ Created setting: ${setting.setting_key}`);
    }
  }
};

// ============================================
// 5. SEED RESTAURANT STAFF
// ============================================
const seedRestaurantStaff = async (restaurant, users) => {
  console.log('Seeding restaurant staff...');
  
  const waiter1 = users.find(u => u.email === 'waiter1@menugo.com');
  const waiter2 = users.find(u => u.email === 'waiter2@menugo.com');
  
  if (!restaurant || !waiter1) {
    console.log('✗ Restaurant or waiter not found');
    return [];
  }

  const staffList = [
    {
      user: waiter1,
      role: 'waiter',
      permissions: {
        can_view_orders: true,
        can_update_order_status: true,
        can_verify_orders: true,
        can_view_tables: true,
        can_assign_tables: true,
        can_process_payments: true,
      },
      hourly_rate: 15.00,
    },
    {
      user: waiter2,
      role: 'waiter',
      permissions: {
        can_view_orders: true,
        can_update_order_status: true,
        can_verify_orders: true,
        can_view_tables: true,
        can_assign_tables: true,
        can_process_payments: true,
      },
      hourly_rate: 15.00,
    },
  ];

  const createdStaff = [];

  for (const staff of staffList) {
    const existing = await RestaurantStaff.findOne({
      where: { restaurant_id: restaurant.id, user_id: staff.user.id },
    });
    if (!existing) {
      const newStaff = await RestaurantStaff.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        user_id: staff.user.id,
        role: staff.role,
        permissions: JSON.stringify(staff.permissions),
        is_active: true,
        hourly_rate: staff.hourly_rate,
      });
      createdStaff.push(newStaff);
      console.log(`✓ Created staff: ${staff.user.email}`);
    } else {
      createdStaff.push(existing);
      console.log(`⚠ Staff already exists: ${staff.user.email}`);
    }
  }
  
  return createdStaff;
};

// ============================================
// 6. SEED WAITERS
// ============================================
const seedWaiters = async (restaurant, staff, users) => {
  console.log('Seeding waiters...');
  
  const waiterUser1 = users.find(u => u.email === 'waiter1@menugo.com');
  const waiterUser2 = users.find(u => u.email === 'waiter2@menugo.com');
  const waiterStaff1 = staff.find(s => s.user_id === waiterUser1?.id);
  const waiterStaff2 = staff.find(s => s.user_id === waiterUser2?.id);
  
  if (!restaurant || !waiterStaff1) {
    console.log('✗ Required data not found for waiter');
    return [];
  }

  const waiterData = [
    {
      staff_id: waiterStaff1.id,
      user_id: waiterUser1.id,
      employee_id: 'WTR001',
      hire_date: new Date('2024-01-15'),
      hourly_rate: 15.00,
      shift_start: '09:00:00',
      shift_end: '17:00:00',
      assigned_sections: JSON.stringify(['Main Hall', 'Window']),
      assigned_tables: JSON.stringify([]),
      max_tables: 5,
      rating: 4.8,
      total_orders_served: 150,
      total_tips: 450.50,
      total_revenue_generated: 12500.00,
    },
    {
      staff_id: waiterStaff2.id,
      user_id: waiterUser2.id,
      employee_id: 'WTR002',
      hire_date: new Date('2024-02-01'),
      hourly_rate: 15.00,
      shift_start: '14:00:00',
      shift_end: '22:00:00',
      assigned_sections: JSON.stringify(['Patio', 'Bar']),
      assigned_tables: JSON.stringify([]),
      max_tables: 4,
      rating: 4.9,
      total_orders_served: 120,
      total_tips: 380.75,
      total_revenue_generated: 9800.00,
    },
  ];

  const createdWaiters = [];

  for (const waiter of waiterData) {
    const existing = await Waiter.findOne({ where: { employee_id: waiter.employee_id } });
    if (!existing) {
      const newWaiter = await Waiter.create({
        id: uuidv4(),
        ...waiter,
        restaurant_id: restaurant.id,
      });
      createdWaiters.push(newWaiter);
      console.log(`✓ Created waiter: ${waiter.employee_id}`);
    } else {
      createdWaiters.push(existing);
      console.log(`⚠ Waiter already exists: ${waiter.employee_id}`);
    }
  }
  
  return createdWaiters;
};

// ============================================
// 7. SEED WAITER SHIFTS
// ============================================
const seedWaiterShifts = async (waiters) => {
  console.log('Seeding waiter shifts...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const waiter of waiters) {
    const existing = await WaiterShift.findOne({
      where: { waiter_id: waiter.id, shift_date: today },
    });
    if (!existing) {
      await WaiterShift.create({
        id: uuidv4(),
        waiter_id: waiter.id,
        shift_date: today,
        shift_start: waiter.shift_start,
        shift_end: waiter.shift_end,
        status: 'scheduled',
      });
      console.log(`✓ Created shift for waiter: ${waiter.employee_id}`);
    }
  }
};

// ============================================
// 8. SEED WAITER PERFORMANCE
// ============================================
const seedWaiterPerformance = async (waiters) => {
  console.log('Seeding waiter performance...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const waiter of waiters) {
    const existing = await WaiterPerformance.findOne({
      where: { waiter_id: waiter.id, date: today },
    });
    if (!existing) {
      await WaiterPerformance.create({
        id: uuidv4(),
        waiter_id: waiter.id,
        date: today,
        orders_served: 12,
        tables_served: 8,
        average_response_time: 3.5,
        customer_satisfaction: 4.8,
        total_revenue: 450.00,
        total_tips: 45.00,
      });
      console.log(`✓ Created performance record for waiter: ${waiter.employee_id}`);
    }
  }
};

// ============================================
// 9. SEED WAITER REAL-TIME STATUS
// ============================================
const seedWaiterRealtimeStatus = async (waiters) => {
  console.log('Seeding waiter real-time status...');
  
  for (const waiter of waiters) {
    const existing = await WaiterRealtimeStatus.findOne({
      where: { waiter_id: waiter.id },
    });
    if (!existing) {
      await WaiterRealtimeStatus.create({
        id: uuidv4(),
        waiter_id: waiter.id,
        status: 'online',
        last_activity: new Date(),
        app_version: '1.0.0',
        device_info: JSON.stringify({ platform: 'web', browser: 'Chrome' }),
      });
      console.log(`✓ Created real-time status for waiter: ${waiter.employee_id}`);
    }
  }
};

// ============================================
// 10. SEED MENU CATEGORIES
// ============================================
const seedMenuCategories = async (restaurant) => {
  console.log('Seeding menu categories...');
  
  if (!restaurant) {
    console.log('✗ Restaurant not found');
    return [];
  }

  const categories = [
    { name: 'Appetizers', description: 'Start your meal with these delicious options', display_order: 1 },
    { name: 'Soups & Salads', description: 'Fresh and healthy choices', display_order: 2 },
    { name: 'Main Courses', description: 'Our signature main dishes', display_order: 3 },
    { name: 'Pasta & Risotto', description: 'Authentic Italian favorites', display_order: 4 },
    { name: 'Seafood Specialties', description: 'Fresh catch of the day', display_order: 5 },
    { name: 'Desserts', description: 'Sweet treats to end your meal', display_order: 6 },
    { name: 'Beverages', description: 'Refreshing drinks', display_order: 7 },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const existing = await MenuCategory.findOne({
      where: { restaurant_id: restaurant.id, name: category.name },
    });
    if (!existing) {
      const newCategory = await MenuCategory.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        ...category,
        is_active: true,
      });
      createdCategories.push(newCategory);
      console.log(`✓ Created category: ${category.name}`);
    } else {
      createdCategories.push(existing);
      console.log(`⚠ Category already exists: ${category.name}`);
    }
  }
  
  return createdCategories;
};

// ============================================
// 11. SEED MENU ITEMS
// ============================================
const seedMenuItems = async (restaurant, categories) => {
  console.log('Seeding menu items...');
  
  if (!restaurant || !categories) {
    console.log('✗ Restaurant or categories not found');
    return;
  }

  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.name] = c.id;
  });

  const items = [
    {
      name: 'Bruschetta',
      description: 'Grilled bread topped with fresh tomatoes, garlic, and basil',
      price: 12.99,
      cost: 4.50,
      category: 'Appetizers',
      is_available: true,
      is_recommended: true,
      is_popular: true,
      is_vegetarian: true,
      preparation_time: 10,
      calories: 320,
      allergens: JSON.stringify(['gluten']),
      tags: JSON.stringify(['popular', 'vegetarian']),
    },
    {
      name: 'Calamari Fritti',
      description: 'Lightly fried calamari served with marinara sauce',
      price: 14.99,
      cost: 5.50,
      category: 'Appetizers',
      is_available: true,
      is_recommended: true,
      preparation_time: 12,
      calories: 450,
      allergens: JSON.stringify(['shellfish', 'gluten']),
    },
    {
      name: 'Caesar Salad',
      description: 'Romaine lettuce, croutons, parmesan with Caesar dressing',
      price: 10.99,
      cost: 3.50,
      category: 'Soups & Salads',
      is_available: true,
      is_vegetarian: true,
      preparation_time: 8,
      calories: 380,
    },
    {
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce',
      price: 28.99,
      cost: 12.50,
      category: 'Seafood Specialties',
      is_available: true,
      is_recommended: true,
      is_popular: true,
      is_gluten_free: true,
      preparation_time: 20,
      calories: 550,
      tags: JSON.stringify(['healthy', 'popular']),
    },
    {
      name: 'Ribeye Steak',
      description: '12oz prime ribeye with garlic mashed potatoes',
      price: 42.99,
      cost: 18.00,
      category: 'Main Courses',
      is_available: true,
      is_recommended: true,
      is_popular: true,
      spice_level: 2,
      preparation_time: 25,
      calories: 980,
    },
    {
      name: 'Fettuccine Alfredo',
      description: 'Creamy parmesan sauce with fettuccine',
      price: 18.99,
      cost: 6.00,
      category: 'Pasta & Risotto',
      is_available: true,
      is_vegetarian: true,
      preparation_time: 15,
      calories: 850,
    },
    {
      name: 'Tiramisu',
      description: 'Classic Italian dessert with mascarpone',
      price: 9.99,
      cost: 3.00,
      category: 'Desserts',
      is_available: true,
      is_recommended: true,
      is_popular: true,
      is_vegetarian: true,
      preparation_time: 5,
      calories: 380,
    },
    {
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center',
      price: 8.99,
      cost: 2.50,
      category: 'Desserts',
      is_available: true,
      is_vegetarian: true,
      preparation_time: 10,
      calories: 520,
    },
    {
      name: 'Fresh Lemonade',
      description: 'House-made lemonade with mint',
      price: 5.99,
      cost: 1.00,
      category: 'Beverages',
      is_available: true,
      is_vegetarian: true,
      is_vegan: true,
      preparation_time: 2,
      calories: 120,
    },
    {
      name: 'Espresso',
      description: 'Rich Italian espresso',
      price: 3.50,
      cost: 0.75,
      category: 'Beverages',
      is_available: true,
      is_vegetarian: true,
      is_vegan: true,
      preparation_time: 3,
      calories: 5,
    },
  ];

  for (const item of items) {
    const existing = await MenuItem.findOne({
      where: { restaurant_id: restaurant.id, name: item.name },
    });
    if (!existing) {
      await MenuItem.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        category_id: categoryMap[item.category],
        name: item.name,
        description: item.description,
        price: item.price,
        cost: item.cost,
        is_available: item.is_available,
        is_recommended: item.is_recommended || false,
        is_popular: item.is_popular || false,
        is_vegetarian: item.is_vegetarian || false,
        is_vegan: item.is_vegan || false,
        is_gluten_free: item.is_gluten_free || false,
        spice_level: item.spice_level || 0,
        preparation_time: item.preparation_time || 0,
        calories: item.calories || 0,
        allergens: item.allergens,
        tags: item.tags,
        stock_quantity: 100,
        low_stock_threshold: 10,
      });
      console.log(`✓ Created menu item: ${item.name}`);
    } else {
      console.log(`⚠ Menu item already exists: ${item.name}`);
    }
  }
};

// ============================================
// 12. SEED MENU ITEM OPTIONS & MODIFIERS
// ============================================
const seedMenuItemOptionsAndModifiers = async (restaurant) => {
  console.log('Seeding menu item options and modifiers...');
  
  if (!restaurant) return;

  const salmonItem = await MenuItem.findOne({
    where: { restaurant_id: restaurant.id, name: 'Grilled Salmon' },
  });

  if (salmonItem) {
    // Create option group
    const optionGroup = await MenuItemOptionGroup.create({
      id: uuidv4(),
      restaurant_id: restaurant.id,
      name: 'Cooking Style',
      description: 'Choose how you want your salmon cooked',
      min_selection: 1,
      max_selection: 1,
      is_required: true,
      display_order: 1,
    });

    const existingOptions = await MenuItemOption.findOne({
      where: { menu_item_id: salmonItem.id },
    });

    if (!existingOptions) {
      // Create options
      await MenuItemOption.create({
        id: uuidv4(),
        menu_item_id: salmonItem.id,
        option_group_id: optionGroup.id,
        name: 'Grilled',
        price_adjustment: 0,
        is_default: true,
        display_order: 1,
      });

      await MenuItemOption.create({
        id: uuidv4(),
        menu_item_id: salmonItem.id,
        option_group_id: optionGroup.id,
        name: 'Blackened',
        price_adjustment: 0,
        is_default: false,
        display_order: 2,
      });

      console.log('✓ Created menu item options for Salmon');
    }
  }

  // Create modifiers
  const modifier = await MenuItemModifier.findOne({
    where: { restaurant_id: restaurant.id, name: 'Extra Sauce' },
  });

  if (!modifier) {
    await MenuItemModifier.create({
      id: uuidv4(),
      restaurant_id: restaurant.id,
      name: 'Extra Sauce',
      description: 'Add extra sauce to your dish',
      price_adjustment: 1.50,
      is_active: true,
    });
    console.log('✓ Created modifier: Extra Sauce');
  }
};

// ============================================
// 13. SEED TABLES
// ============================================
const seedTables = async (restaurant) => {
  console.log('Seeding tables...');
  
  if (!restaurant) {
    console.log('✗ Restaurant not found');
    return [];
  }

  const tables = [
    { table_number: '1', table_name: 'Window Table 1', capacity: 4, section: 'Window', status: 'available', shape: 'rectangle', width: 36, height: 36 },
    { table_number: '2', table_name: 'Window Table 2', capacity: 4, section: 'Window', status: 'available', shape: 'rectangle', width: 36, height: 36 },
    { table_number: '3', table_name: 'Center Table', capacity: 6, section: 'Main Hall', status: 'available', shape: 'rectangle', width: 48, height: 48 },
    { table_number: '4', table_name: 'Private Booth', capacity: 2, section: 'Booth', status: 'available', shape: 'square', width: 30, height: 30 },
    { table_number: '5', table_name: 'Garden Table', capacity: 4, section: 'Patio', status: 'available', shape: 'circle', width: 48, height: 48 },
    { table_number: '6', table_name: 'VIP Table', capacity: 8, section: 'VIP Room', status: 'available', shape: 'rectangle', width: 60, height: 60 },
  ];

  const createdTables = [];

  for (const table of tables) {
    const existing = await Table.findOne({
      where: { restaurant_id: restaurant.id, table_number: table.table_number },
    });
    if (!existing) {
      const newTable = await Table.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        ...table,
      });
      createdTables.push(newTable);
      console.log(`✓ Created table: ${table.table_number}`);
    } else {
      createdTables.push(existing);
      console.log(`⚠ Table already exists: ${table.table_number}`);
    }
  }
  
  return createdTables;
};

// ============================================
// 14. SEED TABLE ASSIGNMENTS
// ============================================
const seedTableAssignments = async (restaurant, tables, waiters) => {
  console.log('Seeding table assignments...');
  
  if (!restaurant || !tables.length || !waiters.length) return;

  const waiter = waiters[0];
  const table = tables[2]; // Center Table

  const existing = await TableAssignment.findOne({
    where: { table_id: table.id, unassigned_at: null },
  });

  if (!existing) {
    await TableAssignment.create({
      id: uuidv4(),
      restaurant_id: restaurant.id,
      table_id: table.id,
      waiter_id: waiter.id,
      assigned_at: new Date(),
    });
    console.log('✓ Created table assignment');
  }
};

// ============================================
// 15. SEED TABLE RESERVATIONS
// ============================================
const seedTableReservations = async (restaurant, tables) => {
  console.log('Seeding table reservations...');
  
  if (!restaurant || !tables.length) return;

  const table = tables[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await TableReservation.findOne({
    where: { table_id: table.id, reservation_date: tomorrow },
  });

  if (!existing) {
    await TableReservation.create({
      id: uuidv4(),
      restaurant_id: restaurant.id,
      table_id: table.id,
      customer_name: 'Jane Smith',
      customer_phone: '+1234567899',
      party_size: 4,
      reservation_date: tomorrow,
      reservation_time: '19:00:00',
      duration_minutes: 120,
      status: 'confirmed',
      special_requests: 'Window seat preferred',
    });
    console.log('✓ Created table reservation');
  }
};

// ============================================
// 16. SEED QR CODES
// ============================================
const seedQRCodes = async (restaurant, tables) => {
  console.log('Seeding QR codes...');
  
  if (!restaurant) {
    console.log('✗ Restaurant not found');
    return;
  }

  const qrData = [
    { identifier: 'gourmet-bistro-table-1', table_number: '1' },
    { identifier: 'gourmet-bistro-table-2', table_number: '2' },
    { identifier: 'gourmet-bistro-table-3', table_number: '3' },
    { identifier: 'gourmet-bistro-table-4', table_number: '4' },
    { identifier: 'gourmet-bistro-table-5', table_number: '5' },
  ];

  for (const qr of qrData) {
    const table = tables.find(t => t.table_number === qr.table_number);
    const existing = await QRCode.findOne({ where: { identifier: qr.identifier } });
    if (!existing) {
      await QRCode.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        identifier: qr.identifier,
        url: `https://menugo.com/menu/${restaurant.qr_code_identifier}?table=${qr.table_number}`,
        table_id: table ? table.id : null,
        table_number: qr.table_number,
        is_active: true,
      });
      console.log(`✓ Created QR code for table ${qr.table_number}`);
    } else {
      console.log(`⚠ QR code already exists for table ${qr.table_number}`);
    }
  }
};

// ============================================
// 17. SEED SAMPLE ORDER
// ============================================
const seedSampleOrder = async (restaurant, waiters, tables) => {
  console.log('Seeding sample order...');
  
  if (!restaurant || !waiters || !tables) {
    console.log('✗ Required data not found for sample order');
    return;
  }

  const waiter = waiters[0];
  const table = tables.find(t => t.table_number === '3') || tables[0];
  const salmonItem = await MenuItem.findOne({ where: { name: 'Grilled Salmon' } });
  const caesarItem = await MenuItem.findOne({ where: { name: 'Caesar Salad' } });
  const tiramisuItem = await MenuItem.findOne({ where: { name: 'Tiramisu' } });

  if (!salmonItem || !caesarItem || !tiramisuItem) {
    console.log('✗ Menu items not found for sample order');
    return;
  }

  const orderData = {
    id: uuidv4(),
    restaurant_id: restaurant.id,
    waiter_id: waiter.id,
    table_id: table.id,
    table_number: table.table_number,
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    subtotal: 55.97,
    tax_amount: 4.90,
    service_charge: 5.60,
    total_amount: 66.47,
    status: ORDER_STATUS.PENDING,
    payment_status: 'unpaid',
    order_type: 'dine_in',
    source: 'qr_code',
    created_at: new Date(Date.now() - 30 * 60 * 1000),
  };

  const existing = await Order.findOne({ where: { customer_name: 'John Doe', table_number: '3' } });
  if (!existing) {
    const order = await Order.create(orderData);
    
    // Create order items
    await OrderItem.create({
      id: uuidv4(),
      order_id: order.id,
      menu_item_id: salmonItem.id,
      item_name: salmonItem.name,
      quantity: 1,
      unit_price: salmonItem.price,
      subtotal: salmonItem.price,
    });
    
    await OrderItem.create({
      id: uuidv4(),
      order_id: order.id,
      menu_item_id: caesarItem.id,
      item_name: caesarItem.name,
      quantity: 1,
      unit_price: caesarItem.price,
      subtotal: caesarItem.price,
    });
    
    await OrderItem.create({
      id: uuidv4(),
      order_id: order.id,
      menu_item_id: tiramisuItem.id,
      item_name: tiramisuItem.name,
      quantity: 1,
      unit_price: tiramisuItem.price,
      subtotal: tiramisuItem.price,
    });
    
    console.log('✓ Created sample order');
  } else {
    console.log('⚠ Sample order already exists');
  }
};

// ============================================
// 18. SEED ORDER STATUS HISTORY
// ============================================
const seedOrderStatusHistory = async () => {
  console.log('Seeding order status history...');
  
  const order = await Order.findOne({ where: { customer_name: 'John Doe' } });
  if (order) {
    const existing = await OrderStatusHistory.findOne({ where: { order_id: order.id } });
    if (!existing) {
      await OrderStatusHistory.create({
        id: uuidv4(),
        order_id: order.id,
        status: ORDER_STATUS.PENDING,
        notes: 'Order placed via QR code',
      });
      console.log('✓ Created order status history');
    }
  }
};

// ============================================
// 19. SEED ORDER REJECTION REASONS
// ============================================
const seedOrderRejectionReasons = async () => {
  console.log('Seeding order rejection reasons...');
  
  const reasons = [
    { reason_code: 'INVALID_TABLE', reason_text: 'Invalid table number or table not found' },
    { reason_code: 'DUPLICATE_ORDER', reason_text: 'Duplicate order detected' },
    { reason_code: 'CUSTOMER_CANCELLED', reason_text: 'Customer cancelled the order' },
    { reason_code: 'ITEM_UNAVAILABLE', reason_text: 'Ordered items are not available' },
    { reason_code: 'PAYMENT_ISSUE', reason_text: 'Payment verification failed' },
    { reason_code: 'SUSPICIOUS_ACTIVITY', reason_text: 'Suspicious order activity detected' },
    { reason_code: 'TECHNICAL_ISSUE', reason_text: 'Technical issue with order processing' },
    { reason_code: 'RESTAURANT_CLOSED', reason_text: 'Restaurant is currently closed' },
  ];

  for (const reason of reasons) {
    const existing = await OrderRejectionReason.findOne({
      where: { reason_code: reason.reason_code },
    });
    if (!existing) {
      await OrderRejectionReason.create({
        id: uuidv4(),
        ...reason,
        is_active: true,
      });
      console.log(`✓ Created rejection reason: ${reason.reason_code}`);
    }
  }
};

// ============================================
// 20. SEED COUPONS
// ============================================
const seedCoupons = async (restaurant) => {
  console.log('Seeding coupons...');
  
  if (!restaurant) {
    console.log('✗ Restaurant not found');
    return;
  }

  const coupons = [
    {
      code: 'WELCOME10',
      description: '10% off your first order',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order_amount: 20,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      is_active: true,
    },
    {
      code: 'HAPPYHOUR',
      description: '$5 off on beverages',
      discount_type: 'fixed_amount',
      discount_value: 5,
      minimum_order_amount: 15,
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      is_active: true,
    },
    {
      code: 'SAVE20',
      description: '$20 off on orders over $100',
      discount_type: 'fixed_amount',
      discount_value: 20,
      minimum_order_amount: 100,
      usage_limit: 50,
      start_date: new Date(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      is_active: true,
    },
  ];

  for (const coupon of coupons) {
    const existing = await Coupon.findOne({ where: { code: coupon.code } });
    if (!existing) {
      await Coupon.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        ...coupon,
      });
      console.log(`✓ Created coupon: ${coupon.code}`);
    } else {
      console.log(`⚠ Coupon already exists: ${coupon.code}`);
    }
  }
};

// ============================================
// 21. SEED INVENTORY
// ============================================
const seedInventory = async (restaurant) => {
  console.log('Seeding inventory...');
  
  if (!restaurant) {
    console.log('✗ Restaurant not found');
    return;
  }

  const inventoryItems = [
    {
      name: 'Salmon Fillet',
      unit: 'kg',
      quantity: 25.5,
      reorder_level: 10,
      reorder_quantity: 20,
      cost_per_unit: 18.99,
      supplier: 'Atlantic Seafood',
    },
    {
      name: 'Ribeye Steak',
      unit: 'kg',
      quantity: 15.2,
      reorder_level: 8,
      reorder_quantity: 15,
      cost_per_unit: 32.50,
      supplier: 'Prime Meats Inc.',
    },
    {
      name: 'Arborio Rice',
      unit: 'kg',
      quantity: 8.5,
      reorder_level: 3,
      reorder_quantity: 10,
      cost_per_unit: 4.99,
      supplier: 'Italian Imports',
    },
    {
      name: 'Tomatoes',
      unit: 'kg',
      quantity: 12.0,
      reorder_level: 5,
      reorder_quantity: 10,
      cost_per_unit: 3.50,
      supplier: 'Local Farms',
    },
    {
      name: 'Parmesan Cheese',
      unit: 'kg',
      quantity: 5.2,
      reorder_level: 2,
      reorder_quantity: 5,
      cost_per_unit: 15.99,
      supplier: 'Italian Imports',
    },
  ];

  for (const item of inventoryItems) {
    const existing = await InventoryItem.findOne({
      where: { name: item.name, restaurant_id: restaurant.id },
    });
    if (!existing) {
      await InventoryItem.create({
        id: uuidv4(),
        restaurant_id: restaurant.id,
        ...item,
      });
      console.log(`✓ Created inventory item: ${item.name}`);
    } else {
      console.log(`⚠ Inventory item already exists: ${item.name}`);
    }
  }
};

// ============================================
// 22. SEED REVIEWS
// ============================================
const seedReviews = async (restaurant, users) => {
  console.log('Seeding reviews...');
  
  if (!restaurant) return;

  const customer = users.find(u => u.email === 'customer@example.com');
  const order = await Order.findOne();

  const existing = await Review.findOne({
    where: { restaurant_id: restaurant.id, user_id: customer?.id },
  });

  if (!existing && customer && order) {
    await Review.create({
      id: uuidv4(),
      restaurant_id: restaurant.id,
      user_id: customer.id,
      order_id: order.id,
      rating: 5,
      title: 'Amazing experience!',
      comment: 'The food was delicious and service was excellent. Highly recommend!',
      status: 'approved',
      is_verified_purchase: true,
    });
    console.log('✓ Created review');
  }
};

// ============================================
// 23. SEED SUBSCRIPTION PLANS
// ============================================
const seedSubscriptionPlans = async () => {
  console.log('Seeding subscription plans...');
  
  const plans = [
    {
      name: 'Basic Plan',
      tier: 'basic',
      description: 'Essential features for small restaurants',
      price_monthly: 0,
      price_yearly: 0,
      features: JSON.stringify([
        'Digital menu',
        'QR code ordering',
        'Basic analytics',
        'Up to 50 menu items',
        '5 staff accounts',
      ]),
      limits: JSON.stringify({
        menu_items: 50,
        staff_accounts: 5,
        orders_per_day: 100,
      }),
      is_active: true,
    },
    {
      name: 'Premium Plan',
      tier: 'premium',
      description: 'Advanced tools for growing businesses',
      price_monthly: 29.99,
      price_yearly: 299.99,
      features: JSON.stringify([
        'Everything in Basic',
        'Priority support',
        'Inventory tracking',
        'Advanced analytics',
        'Up to 200 menu items',
        '15 staff accounts',
      ]),
      limits: JSON.stringify({
        menu_items: 200,
        staff_accounts: 15,
        orders_per_day: 500,
      }),
      is_active: true,
    },
    {
      name: 'Enterprise Plan',
      tier: 'enterprise',
      description: 'Full platform access and customization',
      price_monthly: 99.99,
      price_yearly: 999.99,
      features: JSON.stringify([
        'Everything in Premium',
        'Dedicated support',
        'Custom integrations',
        'Unlimited menu items',
        'Unlimited staff',
        'API access',
      ]),
      limits: JSON.stringify({
        menu_items: -1,
        staff_accounts: -1,
        orders_per_day: -1,
      }),
      is_active: true,
    },
  ];

  for (const plan of plans) {
    const existing = await SubscriptionPlan.findOne({ where: { tier: plan.tier } });
    if (!existing) {
      await SubscriptionPlan.create({
        id: uuidv4(),
        ...plan,
      });
      console.log(`✓ Created subscription plan: ${plan.name}`);
    } else {
      console.log(`⚠ Subscription plan already exists: ${plan.name}`);
    }
  }
};

// ============================================
// 24. SEED SUBSCRIPTION
// ============================================
const seedSubscription = async (restaurant) => {
  console.log('Seeding subscription...');
  
  if (!restaurant) return;

  const plan = await SubscriptionPlan.findOne({ where: { tier: 'premium' } });
  if (!plan) return;

  const existing = await Subscription.findOne({
    where: { restaurant_id: restaurant.id, status: 'active' },
  });

  if (!existing) {
    await Subscription.create({
      id: uuidv4(),
      restaurant_id: restaurant.id,
      plan_id: plan.id,
      tier: 'premium',
      amount: 29.99,
      billing_interval: 'monthly',
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    console.log('✓ Created subscription');
  }
};

// ============================================
// 25. SEED WAITER NOTIFICATIONS
// ============================================
const seedWaiterNotifications = async (waiters, order) => {
  console.log('Seeding waiter notifications...');
  
  if (!waiters.length || !order) return;

  const waiter = waiters[0];

  const existing = await WaiterNotification.findOne({
    where: { waiter_id: waiter.id, order_id: order.id },
  });

  if (!existing) {
    await WaiterNotification.create({
      id: uuidv4(),
      waiter_id: waiter.id,
      restaurant_id: order.restaurant_id,
      order_id: order.id,
      notification_type: 'new_order',
      title: 'New Order Received',
      message: `New order #${order.order_number} from table ${order.table_number}`,
      priority: 'high',
      action_required: true,
    });
    console.log('✓ Created waiter notification');
  }
};

// ============================================
// 26. SEED DAILY SALES SUMMARY
// ============================================
const seedDailySalesSummary = async (restaurant) => {
  console.log('Seeding daily sales summary...');
  
  if (!restaurant) {return;}

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await DailySalesSummary.findOne({
    where: { restaurant_id: restaurant.id, date: today },
  });

  if (!existing) {
    await DailySalesSummary.create({
      id: uuidv4(),
      restaurant_id: restaurant.id,
      date: today,
      total_orders: 25,
      total_revenue: 1250.50,
      total_tax: 98.75,
      average_order_value: 50.02,
      dine_in_orders: 18,
      dine_in_revenue: 900.00,
      takeaway_orders: 5,
      takeaway_revenue: 250.00,
      delivery_orders: 2,
      delivery_revenue: 100.50,
    });
    console.log('✓ Created daily sales summary');
  }
};

// ============================================
// MAIN SEED FUNCTION
// ============================================
const seedDatabase = async () => {
  try {
    console.log('\n========================================');
    console.log('Starting database seeding...');
    console.log('========================================\n');

    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Run all seed functions in order
    const users = await seedUsers();
    await seedUserSessions(users);
    
    const restaurant = await seedRestaurant(users);
    await seedRestaurantSettings(restaurant);
    
    const staff = await seedRestaurantStaff(restaurant, users);
    const waiters = await seedWaiters(restaurant, staff, users);
    
    await seedWaiterShifts(waiters);
    await seedWaiterPerformance(waiters);
    await seedWaiterRealtimeStatus(waiters);
    
    const categories = await seedMenuCategories(restaurant);
    await seedMenuItems(restaurant, categories);
    await seedMenuItemOptionsAndModifiers(restaurant);
    
    const tables = await seedTables(restaurant);
    await seedTableAssignments(restaurant, tables, waiters);
    await seedTableReservations(restaurant, tables);
    
    await seedQRCodes(restaurant, tables);
    await seedSampleOrder(restaurant, waiters, tables);
    await seedOrderStatusHistory();
    await seedOrderRejectionReasons();
    
    await seedCoupons(restaurant);
    await seedInventory(restaurant);
    await seedReviews(restaurant, users);
    
    await seedSubscriptionPlans();
    await seedSubscription(restaurant);
    
    const order = await Order.findOne();
    await seedWaiterNotifications(waiters, order);
    await seedDailySalesSummary(restaurant);

    console.log('\n========================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();

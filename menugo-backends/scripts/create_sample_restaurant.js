const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Models
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const RestaurantStaff = require('../src/models/RestaurantStaff');
const Waiter = require('../src/models/Waiter');
const Table = require('../src/models/Table');
const MenuCategory = require('../src/models/MenuCategory');
const MenuItem = require('../src/models/MenuItem');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');
const OrderStatusHistory = require('../src/models/OrderStatusHistory');

const { sequelize } = require('../src/config/database');

const createSample = async () => {
  try {
    // Ensure restaurants.whatsapp_number exists (some DB schemas may be missing this column)
    const [cols] = await sequelize.query("SHOW COLUMNS FROM restaurants LIKE 'whatsapp_number'");
    if (!cols || cols.length === 0) {
      console.log('Adding missing column restaurants.whatsapp_number');
      await sequelize.query("ALTER TABLE restaurants ADD COLUMN whatsapp_number VARCHAR(50) NULL AFTER phone;");
    }
    // Find platform admin user
    const ownerEmail = 'admin@menugo.com';
    const owner = await User.findOne({ where: { email: ownerEmail } });
    if (!owner) {
      console.error('Owner user not found:', ownerEmail);
      process.exit(1);
    }

    // Create restaurant
    let restaurant = await Restaurant.findOne({ where: { name: 'Demo Restaurant' } });
    if (!restaurant) {
      restaurant = await Restaurant.create({
        id: uuidv4(),
        owner_id: owner.id,
        name: 'Demo Restaurant',
        description: 'Demo restaurant for waiter UI testing',
        address: '123 Demo St',
        city: 'Demo City',
        country: 'Demo Country',
        phone: '+10000000000',
        email: 'demo@menugo.local',
        qr_code_identifier: 'demo-restaurant-001',
        is_active: true,
        is_verified: true,
      });
      console.log('✓ Created restaurant:', restaurant.name);
    } else {
      console.log('⚠ Restaurant already exists:', restaurant.name);
    }

    // Create waiter user
    const waiterEmail = 'waiter@menugo.local';
    let waiterUser = await User.findOne({ where: { email: waiterEmail } });
    if (!waiterUser) {
      const pwd = 'Waiter@123';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(pwd, salt);
      waiterUser = await User.create({ id: uuidv4(), email: waiterEmail, full_name: 'Demo Waiter', password_hash: hash, role: 'waiter', is_active: true, is_verified: true });
      console.log('✓ Created waiter user:', waiterEmail, 'password:', pwd);
    } else {
      console.log('⚠ Waiter user exists:', waiterEmail);
    }

    // Create restaurant staff record for waiter
    let staff = await RestaurantStaff.findOne({ where: { restaurant_id: restaurant.id, user_id: waiterUser.id } });
    if (!staff) {
      staff = await RestaurantStaff.create({ id: uuidv4(), restaurant_id: restaurant.id, user_id: waiterUser.id, role: 'waiter', is_active: true });
      console.log('✓ Created restaurant staff for waiter');
    }

    // Create waiter profile
    let waiter = await Waiter.findOne({ where: { user_id: waiterUser.id } });
    if (!waiter) {
      waiter = await Waiter.create({ id: uuidv4(), staff_id: staff.id, user_id: waiterUser.id, restaurant_id: restaurant.id, employee_id: `W-${Math.floor(Math.random()*9000)+1000}`, is_active: true });
      console.log('✓ Created waiter profile');
    }

    // Create tables
    const tableCount = 8;
    for (let i = 1; i <= tableCount; i++) {
      const tableNumber = i;
      const existing = await Table.findOne({ where: { restaurant_id: restaurant.id, table_number: tableNumber } });
      if (!existing) {
        await Table.create({ id: uuidv4(), restaurant_id: restaurant.id, table_number: tableNumber, capacity: 4, status: 'available' });
      }
    }
    console.log('✓ Ensured tables 1..8');

    // Create a menu category & item
    let cat = await MenuCategory.findOne({ where: { restaurant_id: restaurant.id, name: 'Mains' } });
    if (!cat) {
      cat = await MenuCategory.create({ id: uuidv4(), restaurant_id: restaurant.id, name: 'Mains', slug: 'mains' });
      console.log('✓ Created menu category Mains');
    }
    let item = await MenuItem.findOne({ where: { restaurant_id: restaurant.id, name: 'Demo Burger' } });
    if (!item) {
      item = await MenuItem.create({ id: uuidv4(), restaurant_id: restaurant.id, category_id: cat.id, name: 'Demo Burger', price: 9.99, description: 'A demo burger for testing' });
      console.log('✓ Created menu item Demo Burger');
    }

    // Create a sample pending order for table 1
    const tableNumber = 1;
    const order = await Order.create({ id: uuidv4(), restaurant_id: restaurant.id, table_number: tableNumber, customer_name: 'Guest', subtotal: 9.99, tax_amount: 0.99, service_charge: 0.5, discount_amount: 0, total_amount: 11.48, status: 'pending', order_type: 'dine_in', waiter_id: waiter.id });
    await OrderItem.create({ id: uuidv4(), order_id: order.id, menu_item_id: item.id, item_name: item.name, quantity: 1, unit_price: item.price, subtotal: item.price });
    await OrderStatusHistory.create({ id: uuidv4(), order_id: order.id, status: 'pending', notes: 'Sample order created for waiter UI' });
    console.log('✓ Created sample pending order for table 1');

    console.log('\nSample restaurant and waiter created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating sample data:', err);
    process.exit(1);
  }
};

createSample();

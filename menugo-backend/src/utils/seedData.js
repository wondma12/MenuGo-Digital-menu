const bcrypt = require('bcryptjs');
const { USER_ROLES, SUBSCRIPTION_TIERS } = require('./constants');

// Seed users
const seedUsers = async (models) => {
  const { User } = models;
  
  const users = [
    {
      email: 'admin@menugo.com',
      password: 'Admin@123',
      full_name: 'Platform Admin',
      role: USER_ROLES.PLATFORM_ADMIN,
      is_verified: true,
      email_verified: true,
    },
    {
      email: 'restaurant@menugo.com',
      password: 'Restaurant@123',
      full_name: 'Restaurant Owner',
      role: USER_ROLES.RESTAURANT_ADMIN,
      is_verified: true,
      email_verified: true,
    },
    {
      email: 'waiter@menugo.com',
      password: 'Waiter@123',
      full_name: 'John Waiter',
      role: USER_ROLES.WAITER,
      is_verified: true,
      email_verified: true,
    },
    {
      email: 'customer@menugo.com',
      password: 'Customer@123',
      full_name: 'Sarah Customer',
      role: USER_ROLES.CUSTOMER,
      is_verified: true,
      email_verified: true,
    },
  ];
  
  for (const user of users) {
    const existing = await User.findOne({ where: { email: user.email } });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(user.password, salt);
      await User.create({ ...user, password_hash });
      console.log(`Created user: ${user.email}`);
    }
  }
};

// Seed restaurant
const seedRestaurant = async (models) => {
  const { Restaurant, User } = models;
  
  const owner = await User.findOne({ where: { email: 'restaurant@menugo.com' } });
  if (!owner) return;
  
  const existing = await Restaurant.findOne({ where: { owner_id: owner.id } });
  if (!existing) {
    await Restaurant.create({
      owner_id: owner.id,
      name: 'Gourmet Bistro',
      description: 'Fine dining experience with international cuisine',
      address: '123 Main Street',
      city: 'New York',
      country: 'USA',
      phone: '+1234567890',
      email: 'contact@gourmetbistro.com',
      cuisine_type: 'Fusion',
      qr_code_identifier: 'gourmet-bistro-nyc',
      subscription_tier: SUBSCRIPTION_TIERS.PREMIUM,
      is_active: true,
      is_verified: true,
      latitude: 40.7128,
      longitude: -74.0060,
    });
    console.log('Created restaurant: Gourmet Bistro');
  }
};

// Seed menu categories
const seedMenuCategories = async (models) => {
  const { MenuCategory, Restaurant } = models;
  
  const restaurant = await Restaurant.findOne({ where: { name: 'Gourmet Bistro' } });
  if (!restaurant) return;
  
  const categories = [
    { name: 'Appetizers', description: 'Start your meal', display_order: 1 },
    { name: 'Main Courses', description: 'Our signature dishes', display_order: 2 },
    { name: 'Desserts', description: 'Sweet treats', display_order: 3 },
    { name: 'Beverages', description: 'Refreshing drinks', display_order: 4 },
  ];
  
  for (const category of categories) {
    const existing = await MenuCategory.findOne({
      where: { restaurant_id: restaurant.id, name: category.name },
    });
    if (!existing) {
      await MenuCategory.create({
        restaurant_id: restaurant.id,
        ...category,
        is_active: true,
      });
      console.log(`Created category: ${category.name}`);
    }
  }
};

// Seed menu items
const seedMenuItems = async (models) => {
  const { MenuItem, MenuCategory, Restaurant } = models;
  
  const restaurant = await Restaurant.findOne({ where: { name: 'Gourmet Bistro' } });
  if (!restaurant) return;
  
  const categories = await MenuCategory.findAll({ where: { restaurant_id: restaurant.id } });
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.name] = c.id; });
  
  const items = [
    {
      name: 'Bruschetta',
      description: 'Grilled bread with tomatoes and basil',
      price: 12.99,
      category: 'Appetizers',
      is_available: true,
      is_recommended: true,
      is_vegetarian: true,
    },
    {
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce',
      price: 28.99,
      category: 'Main Courses',
      is_available: true,
      is_recommended: true,
      is_popular: true,
    },
    {
      name: 'Ribeye Steak',
      description: '12oz prime ribeye with garlic mashed potatoes',
      price: 42.99,
      category: 'Main Courses',
      is_available: true,
      is_recommended: true,
    },
    {
      name: 'Tiramisu',
      description: 'Classic Italian dessert',
      price: 9.99,
      category: 'Desserts',
      is_available: true,
      is_recommended: true,
      is_vegetarian: true,
    },
    {
      name: 'Fresh Lemonade',
      description: 'House-made lemonade with mint',
      price: 5.99,
      category: 'Beverages',
      is_available: true,
      is_vegetarian: true,
      is_vegan: true,
    },
  ];
  
  for (const item of items) {
    const existing = await MenuItem.findOne({
      where: { restaurant_id: restaurant.id, name: item.name },
    });
    if (!existing) {
      await MenuItem.create({
        restaurant_id: restaurant.id,
        category_id: categoryMap[item.category],
        name: item.name,
        description: item.description,
        price: item.price,
        is_available: item.is_available,
        is_recommended: item.is_recommended,
        is_popular: item.is_popular || false,
        is_vegetarian: item.is_vegetarian || false,
        is_vegan: item.is_vegan || false,
        is_gluten_free: item.is_gluten_free || false,
      });
      console.log(`Created menu item: ${item.name}`);
    }
  }
};

// Seed tables
const seedTables = async (models) => {
  const { Table, Restaurant } = models;
  
  const restaurant = await Restaurant.findOne({ where: { name: 'Gourmet Bistro' } });
  if (!restaurant) return;
  
  const tables = [
    { table_number: '1', table_name: 'Window Table 1', capacity: 4, section: 'Window' },
    { table_number: '2', table_name: 'Window Table 2', capacity: 4, section: 'Window' },
    { table_number: '3', table_name: 'Center Table', capacity: 6, section: 'Main Hall' },
    { table_number: '4', table_name: 'Private Booth', capacity: 2, section: 'Booth' },
    { table_number: '5', table_name: 'Garden Table', capacity: 4, section: 'Patio' },
  ];
  
  for (const table of tables) {
    const existing = await Table.findOne({
      where: { restaurant_id: restaurant.id, table_number: table.table_number },
    });
    if (!existing) {
      await Table.create({
        restaurant_id: restaurant.id,
        ...table,
        status: 'available',
      });
      console.log(`Created table: ${table.table_number}`);
    }
  }
};

// Run all seeders
const seedDatabase = async (models) => {
  try {
    console.log('Starting database seeding...');
    
    await seedUsers(models);
    await seedRestaurant(models);
    await seedMenuCategories(models);
    await seedMenuItems(models);
    await seedTables(models);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding error:', error);
  }
};

module.exports = {
  seedDatabase,
  seedUsers,
  seedRestaurant,
  seedMenuCategories,
  seedMenuItems,
  seedTables,
};
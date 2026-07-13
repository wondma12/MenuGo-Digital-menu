// Script to check if restaurants exist in the database
require('dotenv').config();
const { sequelize, Restaurant } = require('../src/models');

async function checkRestaurants() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Get all restaurants count
    const totalCount = await Restaurant.count({ where: { deleted_at: null } });
    console.log(`\nTotal restaurants (not deleted): ${totalCount}`);

    // Get active and verified restaurants
    const activeCount = await Restaurant.count({
      where: { is_active: true, is_verified: true, deleted_at: null },
    });
    console.log(`Active & verified restaurants: ${activeCount}`);

    // Get pending verification restaurants
    const pendingCount = await Restaurant.count({
      where: { is_verified: false, is_active: true, deleted_at: null },
    });
    console.log(`Pending verification restaurants: ${pendingCount}`);

    // Get suspended restaurants
    const suspendedCount = await Restaurant.count({
      where: { is_active: false, is_verified: true, deleted_at: null },
    });
    console.log(`Suspended restaurants: ${suspendedCount}`);

    // List first 5 restaurants
    if (totalCount > 0) {
      console.log('\nFirst 5 restaurants:');
      const restaurants = await Restaurant.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'is_active', 'is_verified', 'subscription_tier', 'created_at'],
      });

      restaurants.forEach((r) => {
        console.log(
          `  - ${r.name} (status: ${r.is_verified ? 'verified' : 'pending'}, active: ${r.is_active}, tier: ${r.subscription_tier})`
        );
      });
    } else {
      console.log('\n⚠ NO restaurants found in database!');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkRestaurants();

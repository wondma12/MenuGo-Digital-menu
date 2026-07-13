// Check if restaurant was created for the user
require('dotenv').config();
const { sequelize, User, Restaurant } = require('../src/models');

async function checkRegistration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Find the user by email
    const email = 'haymanotwondmagegn2@gmail.com';
    console.log(`Searching for user with email: ${email}`);
    
    const user = await User.findOne({
      where: { email: email },
      attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'is_verified'],
    });

    if (!user) {
      console.log('❌ User NOT found in database!');
      await sequelize.close();
      process.exit(1);
    }

    console.log('✓ User found:');
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Name: ${user.full_name}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Active: ${user.is_active}`);
    console.log(`  - Verified: ${user.is_verified}\n`);

    // Now check if restaurant exists for this user
    console.log('Searching for restaurant owned by this user...');
    const restaurant = await Restaurant.findOne({
      where: { owner_id: user.id },
      attributes: [
        'id',
        'name',
        'email',
        'owner_id',
        'is_active',
        'is_verified',
        'subscription_tier',
        'subscription_status',
        'subscription_start_date',
        'subscription_end_date',
        'created_at',
      ],
    });

    if (!restaurant) {
      console.log('❌ Restaurant NOT found for this user!');
      console.log('\n⚠ The registration may have failed at the restaurant creation step.');
      await sequelize.close();
      process.exit(1);
    }

    console.log('✓ Restaurant found:');
    console.log(`  - ID: ${restaurant.id}`);
    console.log(`  - Name: ${restaurant.name}`);
    console.log(`  - Email: ${restaurant.email}`);
    console.log(`  - Active: ${restaurant.is_active}`);
    console.log(`  - Verified: ${restaurant.is_verified}`);
    console.log(`  - Subscription Tier: ${restaurant.subscription_tier}`);
    console.log(`  - Subscription Status: ${restaurant.subscription_status}`);
    console.log(`  - Subscription End: ${restaurant.subscription_end_date}`);
    console.log(`  - Created: ${restaurant.created_at}\n`);

    console.log('✓ Restaurant registration was SUCCESSFUL!');
    console.log('\n📌 Note: Restaurant admins can only see their own dashboard.');
    console.log('Platform admins at http://localhost:5173/platform/restaurants will see all restaurants.');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkRegistration();

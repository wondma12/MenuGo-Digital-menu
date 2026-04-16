const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

// Import User model
const User = require('../src/models/User');

const USER_ROLES = {
  CUSTOMER: 'customer',
  WAITER: 'waiter',
  RESTAURANT_ADMIN: 'restaurant_admin',
  PLATFORM_ADMIN: 'platform_admin',
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    const users = [
      {
        email: 'admin@menugo.com',
        full_name: 'Platform Admin',
        phone: '+1234567890',
        role: USER_ROLES.PLATFORM_ADMIN,
        password: 'Admin@123',
      },
      {
        email: 'restaurant.owner@menugo.com',
        full_name: 'John Owner',
        phone: '+1234567891',
        role: USER_ROLES.RESTAURANT_ADMIN,
        password: 'Owner@123',
      },
      {
        email: 'waiter1@menugo.com',
        full_name: 'Mike Waiter',
        phone: '+1234567892',
        role: USER_ROLES.WAITER,
        password: 'Waiter@123',
      },
      {
        email: 'customer@example.com',
        full_name: 'Sarah Customer',
        phone: '+1234567893',
        role: USER_ROLES.CUSTOMER,
        password: 'Customer@123',
      },
    ];

    for (const userData of users) {
      const existing = await User.findOne({ where: { email: userData.email } });
      
      const password_hash = await hashPassword(userData.password);
      
      if (!existing) {
        await User.create({
          id: uuidv4(),
          email: userData.email,
          password_hash: password_hash,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          is_active: true,
          is_verified: true,
          email_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } else {
        // Update existing user with correct password hash
        await existing.update({
          password_hash: password_hash,
          is_active: true,
          is_verified: true,
          email_verified: true,
        });
        console.log(`🔄 Updated user: ${userData.email}`);
      }
    }
    
    // Verify users were created
    const allUsers = await User.findAll();
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
    console.log('\n✅ User seeding completed!');
    console.log('\n🔐 Test credentials:');
    console.log('   Admin: admin@menugo.com / Admin@123');
    console.log('   Owner: restaurant.owner@menugo.com / Owner@123');
    console.log('   Waiter: waiter1@menugo.com / Waiter@123');
    console.log('   Customer: customer@example.com / Customer@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
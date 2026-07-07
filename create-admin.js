const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./menugo-backends/src/models');

async function createPlatformAdmin() {
  try {
    console.log('Creating platform admin account...\n');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      full_name: 'Platform Admin',
      email: 'admin@menugo.local',
      phone: '+251900000000',
      password: hashedPassword,
      role: 'platform_admin',
      is_email_verified: true,
      is_phone_verified: true,
    });

    console.log('✓ Platform Admin Created Successfully!');
    console.log('=====================================');
    console.log('Email:', admin.email);
    console.log('Password:', 'admin123');
    console.log('Role:', admin.role);
    console.log('ID:', admin.id);
    console.log('\nYou can now log in with these credentials at http://localhost:5174/login');
    
    process.exit(0);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('✓ Admin account already exists');
      console.log('Email: admin@menugo.local');
      console.log('Password: admin123');
    } else {
      console.error('Error creating admin:', error.message);
    }
    process.exit(1);
  }
}

createPlatformAdmin();

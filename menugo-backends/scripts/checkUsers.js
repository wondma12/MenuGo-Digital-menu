
const { sequelize } = require('../src/config/database');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Check if users table exists
    const [tables] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'menugo_db' 
      AND table_name = 'users'
    `);
    
    if (tables[0].count === 0) {
      console.log('❌ Users table does not exist!');
      console.log('Please run: node scripts/syncDatabase.js');
      process.exit(1);
    }
    
    // Get all users
    const [users] = await sequelize.query(`
      SELECT id, email, full_name, role, is_active, is_verified 
      FROM users 
      LIMIT 10
    `);
    
    console.log(`📊 Found ${users.length} users:\n`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Active: ${user.is_active}`);
    });
    
    if (users.length === 0) {
      console.log('\n⚠️ No users found! Please seed the database.');
      console.log('Run: node scripts/seedDatabaseSimple.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
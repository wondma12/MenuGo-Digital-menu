const { sequelize } = require('../src/config/database');
const db = require('../src/models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database tables...');
    
    // Sync all models (force: false means don't drop existing tables)
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database tables created/updated successfully!');
    
    // List all tables
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('\n📋 Tables in database:');
    results.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    process.exit(1);
  }
}

syncDatabase();
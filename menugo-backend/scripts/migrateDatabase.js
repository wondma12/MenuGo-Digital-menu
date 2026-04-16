const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

const databaseName = process.env.DB_NAME || 'menugo_db';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Execute SQL file
const executeSQLFile = async (connection, filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split SQL into statements (handle DELIMITER)
  const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
  
  const currentStatement = '';
  let inDelimiter = false;
  
  for (const statement of statements) {
    if (statement.trim().toUpperCase().startsWith('DELIMITER')) {
      inDelimiter = true;
      continue;
    }
    
    if (inDelimiter && statement.trim().toUpperCase() === 'DELIMITER') {
      inDelimiter = false;
      continue;
    }
    
    try {
      await connection.query(statement);
      process.stdout.write('.');
    } catch (error) {
      // Ignore "database exists" errors
      if (!error.message.includes('database exists') && 
          !error.message.includes('already exists') &&
          !error.message.includes('Duplicate key')) {
        console.error('\nError executing statement:', error.message);
        throw error;
      }
    }
  }
};

// Main migration function
const migrateDatabase = async () => {
  try {
    console.log('\n========================================');
    console.log('Starting database migration...');
    console.log('========================================\n');

    // Connect without database
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to MySQL server\n');

    // Check if database exists
    const [databases] = await connection.query(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [databaseName],
    );

    if (databases.length === 0) {
      console.log(`Database '${databaseName}' does not exist.`);
      const answer = await question(`Create database '${databaseName}'? (y/n): `);
      
      if (answer.toLowerCase() === 'y') {
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✓ Database '${databaseName}' created`);
      } else {
        console.log('Migration cancelled.');
        await connection.end();
        rl.close();
        process.exit(0);
      }
    } else {
      console.log(`✓ Database '${databaseName}' exists`);
      
      const answer = await question('Do you want to drop and recreate the database? This will delete all data! (y/n): ');
      
      if (answer.toLowerCase() === 'y') {
        await connection.query(`DROP DATABASE IF EXISTS ${databaseName}`);
        await connection.query(`CREATE DATABASE ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✓ Database '${databaseName}' recreated`);
      }
    }

    // Connect to the database
    await connection.changeUser({ database: databaseName });
    console.log(`✓ Connected to database '${databaseName}'\n`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../database.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`Schema file not found: ${schemaPath}`);
      process.exit(1);
    }

    console.log('Executing database schema...');
    await executeSQLFile(connection, schemaPath);
    console.log('\n✓ Database schema executed successfully');

    // Verify tables were created
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
      [databaseName],
    );
    
    console.log(`\n✓ Created ${tables.length} tables`);
    
    // List created tables
    if (tables.length > 0) {
      console.log('\nCreated tables:');
      tables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }

    await connection.end();
    rl.close();

    console.log('\n========================================');
    console.log('Database migration completed successfully!');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error migrating database:', error);
    rl.close();
    process.exit(1);
  }
};

// Run migration
migrateDatabase();

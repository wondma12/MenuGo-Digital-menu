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

// Execute SQL file (handles DELIMITER blocks and stored procedures)
const executeSQLFile = async (connection, filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');

  // Normalize line endings and iterate lines so we can respect DELIMITER blocks
  const lines = sql.split(/\r?\n/);
  const statements = [];
  let buffer = '';
  let currentDelimiter = ';';

  const pushStatement = (stmt) => {
    const s = stmt.trim();
    if (s.length === 0) {
      return;
    }
    statements.push(s);
  };

  for (const rawLine of lines) {
    const line = rawLine;

    // Handle delimiter switch lines like: DELIMITER //
    const m = line.match(/^\s*DELIMITER\s+(\S+)\s*$/i);
    if (m) {
      currentDelimiter = m[1];
      continue;
    }

    buffer += `${line  }\n`;

    if (currentDelimiter === ';') {
      // Split buffer by semicolons when using default delimiter
      const parts = buffer.split(';');
      // All but last are complete statements
      for (let i = 0; i < parts.length - 1; i++) {
        pushStatement(parts[i]);
      }
      buffer = parts[parts.length - 1];
    } else {
      // Using a custom delimiter: wait until buffer ends with that token
      if (buffer.trim().endsWith(currentDelimiter)) {
        const stmt = buffer.trim();
        const withoutDelim = stmt.slice(0, stmt.length - currentDelimiter.length).trim();
        pushStatement(withoutDelim);
        buffer = '';
      }
    }
  }

  // Push any remaining buffer
  if (buffer.trim()) {
    if (currentDelimiter === ';') {
      // final leftover
      pushStatement(buffer);
    } else {
      const t = buffer.trim();
      if (t.endsWith(currentDelimiter)) {
        pushStatement(t.slice(0, t.length - currentDelimiter.length));
      } else {
        pushStatement(t);
      }
    }
  }

  // Execute statements sequentially
  for (const statement of statements) {
    try {
      await connection.query(statement);
      process.stdout.write('.');
    } catch (error) {
      // Ignore "database exists" errors
      if (!error.message.includes('database exists') &&
          !error.message.includes('already exists') &&
          !error.message.includes('Duplicate key')) {
        console.error('\nError executing statement:', error.message);
        console.error('SQL snippet:', statement.slice(0, 300));
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

    // Non-interactive flags
    const AUTO_CREATE_DB = process.env.AUTO_CREATE_DB && process.env.AUTO_CREATE_DB.toString().toLowerCase() === 'true';
    const FORCE_RECREATE_DB = process.env.FORCE_RECREATE_DB && process.env.FORCE_RECREATE_DB.toString().toLowerCase() === 'true';

    if (databases.length === 0) {
      console.log(`Database '${databaseName}' does not exist.`);

      if (AUTO_CREATE_DB) {
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✓ Database '${databaseName}' created (auto)`);
      } else {
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
      }
    } else {
      console.log(`✓ Database '${databaseName}' exists`);

      if (FORCE_RECREATE_DB) {
        await connection.query(`DROP DATABASE IF EXISTS ${databaseName}`);
        await connection.query(`CREATE DATABASE ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✓ Database '${databaseName}' recreated (force)`);
      } else {
        const answer = await question('Do you want to drop and recreate the database? This will delete all data! (y/n): ');
        if (answer.toLowerCase() === 'y') {
          await connection.query(`DROP DATABASE IF EXISTS ${databaseName}`);
          await connection.query(`CREATE DATABASE ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
          console.log(`✓ Database '${databaseName}' recreated`);
        }
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

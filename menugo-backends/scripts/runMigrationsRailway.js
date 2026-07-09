const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Railway Database Credentials
const RAILWAY_CONFIG = {
  host: 'hayabusa.proxy.rlwy.net',
  port: 45537,
  user: 'root',
  password: 'KbEWdlIgUugfGZeQgDxDDfyfkyHEPJpD',
  database: 'menugo_db',
};

// Main migration runner
async function runMigrations() {
  let connection;

  try {
    console.log('🔧 Connecting to Railway database...');
    console.log(`   Host: ${RAILWAY_CONFIG.host}:${RAILWAY_CONFIG.port}`);
    console.log(`   Database: ${RAILWAY_CONFIG.database}\n`);

    connection = await mysql.createConnection({
      host: RAILWAY_CONFIG.host,
      port: RAILWAY_CONFIG.port,
      user: RAILWAY_CONFIG.user,
      password: RAILWAY_CONFIG.password,
      database: RAILWAY_CONFIG.database,
    });

    console.log('✅ Connected to Railway successfully!\n');

    // Create migrations table if it doesn't exist
    console.log('📋 Creating migrations tracking table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'success'
      )
    `);
    console.log('✅ Migrations table ready\n');

    // Read migration files from db-migrations folder
    console.log('📂 Scanning migration files...\n');
    const migrationsDir = path.join(__dirname, '..', 'db-migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.warn(`⚠️  Migration directory not found at: ${migrationsDir}`);
      console.log('   Creating directory...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✅ Migration directory created\n');
    }

    // Get all SQL files in migrations folder
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found in db-migrations folder');
      console.log('   Attempting to use database.sql as main schema...\n');

      const dbSqlPath = path.join(__dirname, '..', 'database.sql');
      if (fs.existsSync(dbSqlPath)) {
        console.log('📄 Found database.sql - creating all tables...\n');
        await executeDatabaseSchema(connection, dbSqlPath);
      } else {
        console.error('❌ No database.sql or migration files found');
        return;
      }
    } else {
      console.log(`🚀 Found ${files.length} migration files\n`);
      
      // Execute each migration
      let completedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(migrationsDir, file);

        try {
          // Check if migration already executed
          const [existing] = await connection.query(
            'SELECT * FROM migrations WHERE migration_name = ?',
            [file]
          );

          if (existing.length > 0) {
            console.log(`[${i + 1}/${files.length}] ⏭️  ${file} (already executed)`);
            skippedCount++;
            continue;
          }

          // Read and execute migration
          const sql = fs.readFileSync(filePath, 'utf8');
          console.log(`[${i + 1}/${files.length}] 🔄 Executing: ${file}...`);

          // Parse and execute statements
          await executeMigrationFile(connection, sql, file);

          completedCount++;
          console.log(`         ✅ Success`);
        } catch (error) {
          console.error(`[${i + 1}/${files.length}] ❌ Error in ${file}:`);
          console.error(`    ${error.message}\n`);
        }
      }

      console.log('\n' + '='.repeat(50));
      console.log('📊 Migration Summary:');
      console.log(`   ✅ Completed: ${completedCount}`);
      console.log(`   ⏭️  Skipped: ${skippedCount}`);
      console.log(`   📋 Total: ${files.length}`);
      console.log('='.repeat(50) + '\n');
    }

    // Verify tables created
    console.log('📋 Verifying tables...\n');
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [RAILWAY_CONFIG.database]
    );

    if (tables.length > 0) {
      console.log(`✅ Total tables in database: ${tables.length}`);
      console.log('\n📚 Tables created:');
      tables.forEach((t, idx) => {
        console.log(`   ${idx + 1}. ${t.TABLE_NAME}`);
      });
    }

    console.log('\n🎉 All migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during migration:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute a migration file with proper statement parsing
async function executeMigrationFile(connection, sql, fileName) {
  // Parse SQL statements, handling DELIMITER changes
  const statements = [];
  let currentDelimiter = ';';
  let currentStatement = '';

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Handle DELIMITER changes
    if (trimmedLine.startsWith('DELIMITER')) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim() + currentDelimiter);
        currentStatement = '';
      }
      currentDelimiter = trimmedLine.replace('DELIMITER', '').trim();
      continue;
    }

    // Skip comments
    if (trimmedLine.startsWith('--') || trimmedLine.startsWith('/*')) {
      continue;
    }

    currentStatement += line + '\n';

    // Check if statement ends with current delimiter
    if (trimmedLine.endsWith(currentDelimiter)) {
      if (currentStatement.trim() && !currentStatement.includes('DELIMITER')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim() + currentDelimiter);
  }

  // Filter empty and comment-only statements
  const filteredStatements = statements
    .filter(stmt => {
      const cleaned = stmt.replace(/DELIMITER\s+[^;]+;?/gi, '').trim();
      return cleaned && !cleaned.startsWith('--') && cleaned.length > 0;
    });

  // Execute statements
  for (const statement of filteredStatements) {
    let finalStatement = statement.trim();

    // Clean up DELIMITER statements if any remain
    finalStatement = finalStatement.replace(/DELIMITER\s+[^;]+;?/gi, '').trim();

    if (!finalStatement) continue;

    // Replace // delimiter with ; for compatibility
    finalStatement = finalStatement.replace(/\/\/ *$/, ';').replace(/;+$/, ';');

    try {
      await connection.query(finalStatement);
    } catch (error) {
      // Skip expected errors like "table already exists"
      if (
        !error.message.includes('already exists') &&
        !error.message.includes('Duplicate') &&
        !error.message.includes('Unknown table') &&
        error.code !== 'ER_TABLE_EXISTS_ERROR'
      ) {
        throw error;
      }
    }
  }

  // Record migration as completed
  await connection.query(
    'INSERT INTO migrations (migration_name, status) VALUES (?, ?)',
    [fileName, 'success']
  );
}

// Execute database.sql schema
async function executeDatabaseSchema(connection, dbSqlPath) {
  const sqlContent = fs.readFileSync(dbSqlPath, 'utf8');

  // Parse SQL statements, handling DELIMITER changes
  const statements = [];
  let currentDelimiter = ';';
  let currentStatement = '';

  const lines = sqlContent.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Handle DELIMITER changes
    if (trimmedLine.startsWith('DELIMITER')) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim() + currentDelimiter);
        currentStatement = '';
      }
      currentDelimiter = trimmedLine.replace('DELIMITER', '').trim();
      continue;
    }

    // Skip comments
    if (trimmedLine.startsWith('--') || trimmedLine.startsWith('/*')) {
      continue;
    }

    currentStatement += line + '\n';

    // Check if statement ends with current delimiter
    if (trimmedLine.endsWith(currentDelimiter)) {
      if (currentStatement.trim() && !currentStatement.includes('DELIMITER')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim() + currentDelimiter);
  }

  // Filter empty and comment-only statements
  const filteredStatements = statements
    .filter(stmt => {
      const cleaned = stmt.replace(/DELIMITER\s+[^;]+;?/gi, '').trim();
      return cleaned && !cleaned.startsWith('--') && cleaned.length > 0;
    });

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < filteredStatements.length; i++) {
    let statement = filteredStatements[i].trim();

    // Clean up DELIMITER statements if any remain
    statement = statement.replace(/DELIMITER\s+[^;]+;?/gi, '').trim();

    if (!statement) continue;

    try {
      // Show progress for main operations
      if (statement.includes('DROP') || statement.includes('CREATE')) {
        const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
        console.log(`[${i + 1}/${filteredStatements.length}] 🔄 Executing: ${preview}...`);
      }

      // Replace // delimiter with ; for compatibility
      const finalStatement = statement.replace(/\/\/ *$/, ';').replace(/;+$/, ';');

      await connection.query(finalStatement);
      successCount++;
    } catch (error) {
      // Skip expected errors
      if (
        error.message.includes('already exists') ||
        error.message.includes('Unknown database') ||
        error.message.includes('DROP DATABASE') ||
        error.message.includes("database exists") ||
        error.code === 'ER_DB_CREATE_EXISTS'
      ) {
        skipCount++;
      } else {
        throw error;
      }
    }
  }

  console.log(`\n✅ Schema execution completed!`);
  console.log(`   ✓ Successful statements: ${successCount}`);
  console.log(`   ⚠️  Skipped statements: ${skipCount}`);
  console.log(`   📊 Total statements: ${filteredStatements.length}\n`);
}

// Run migrations
runMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Railway Database Setup Script (Environment Variable Version)
 * This version reads database credentials from environment variables
 * Usage: node setupRailwayDatabaseEnv.js
 * 
 * Set these environment variables first:
 * - DB_HOST: hayabusa.proxy.rlwy.net
 * - DB_PORT: 45537
 * - DB_USER: root
 * - DB_PASSWORD: your_password
 * - DB_NAME: menugo_db
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Get credentials from environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST || 'hayabusa.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '45537'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'menugo_db',
};

// Validate required env vars
if (!DB_CONFIG.password) {
  console.error('❌ Error: DB_PASSWORD environment variable is not set!');
  console.error('\nPlease set the environment variables:');
  console.error('  export DB_HOST=hayabusa.proxy.rlwy.net');
  console.error('  export DB_PORT=45537');
  console.error('  export DB_USER=root');
  console.error('  export DB_PASSWORD=your_password_here');
  console.error('  export DB_NAME=menugo_db');
  process.exit(1);
}

async function setupDatabase() {
  let connection = null;
  
  try {
    console.log('🔧 Connecting to Railway database...');
    console.log(`   Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    console.log(`   User: ${DB_CONFIG.user}`);
    
    // Create connection (without database first to allow CREATE DATABASE)
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
    });
    
    console.log('✅ Connected to Railway successfully!\n');
    
    // Read database.sql
    console.log('📄 Reading database schema...');
    const dbSqlPath = path.join(__dirname, '..', 'database.sql');
    
    if (!fs.existsSync(dbSqlPath)) {
      throw new Error(`database.sql not found at: ${dbSqlPath}`);
    }
    
    const sqlContent = fs.readFileSync(dbSqlPath, 'utf8');
    console.log('✅ Schema file loaded\n');
    
    // Execute SQL statements
    console.log('🚀 Creating database and tables...\n');
    
    // Parse SQL statements, handling DELIMITER changes for procedures/triggers
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
    const errors = [];
    let dbCreated = false;
    
    for (let i = 0; i < filteredStatements.length; i++) {
      let statement = filteredStatements[i].trim();
      
      // Clean up DELIMITER statements if any remain
      statement = statement.replace(/DELIMITER\s+[^;]+;?/gi, '').trim();
      
      if (!statement) continue;
      
      try {
        // Show progress for main operations
        if (statement.includes('DROP') || statement.includes('CREATE')) {
          const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
          console.log(`[${i + 1}/${filteredStatements.length}] Executing: ${preview}...`);
        }
        
        // Replace // delimiter with ; for Railway compatibility
        const finalStatement = statement.replace(/\/\/ *$/, ';').replace(/;+$/, ';');
        
        // Use query() instead of execute() for DDL statements
        await connection.query(finalStatement);
        successCount++;
        
        // If we just created the database, mark it
        if (statement.includes('CREATE DATABASE') && !dbCreated) {
          dbCreated = true;
        }
      } catch (error) {
        // Skip certain expected errors
        if (
          error.message.includes('already exists') ||
          error.message.includes('Unknown database') ||
          error.message.includes('DROP DATABASE') ||
          error.message.includes("database exists") ||
          error.code === 'ER_DB_CREATE_EXISTS'
        ) {
          skipCount++;
          if (error.message.includes('already exists') || error.code === 'ER_DB_CREATE_EXISTS') {
            console.log(`  ⚠️  Skipped (already exists)`);
          }
          if (error.code === 'ER_DB_CREATE_EXISTS') {
            dbCreated = true;
          }
        } else {
          errors.push({ statement: statement.substring(0, 50), error: error.message });
          console.log(`  ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Database setup completed!`);
    console.log(`   ✓ Successful statements: ${successCount}`);
    console.log(`   ⚠️  Skipped statements: ${skipCount}`);
    if (errors.length > 0) {
      console.log(`   ❌ Failed statements: ${errors.length}`);
    }
    console.log(`   📊 Total statements: ${statements.length}`);
    
    // Verify tables were created
    console.log('\n📋 Verifying tables created...');
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
      [DB_CONFIG.database]
    );
    
    console.log(`\n✅ Successfully created ${tables.length} tables:`);
    tables.forEach((table, idx) => {
      console.log(`   ${idx + 1}. ${table.TABLE_NAME}`);
    });
    
    console.log('\n🎉 Railway database is ready to use!');
    
  } catch (error) {
    console.error('\n❌ Error during setup:');
    console.error(`   ${error.message}`);
    
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupDatabase();

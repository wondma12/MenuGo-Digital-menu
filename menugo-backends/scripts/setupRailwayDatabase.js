#!/usr/bin/env node

/**
 * Railway Database Setup Script
 * This script connects to your Railway MySQL database and creates all tables
 * Usage: node setupRailwayDatabase.js
 */

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
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  multipleStatements: true,
};

async function setupDatabase() {
  let connection = null;
  
  try {
    console.log('🔧 Connecting to Railway database...');
    console.log(`   Host: ${RAILWAY_CONFIG.host}:${RAILWAY_CONFIG.port}`);
    console.log(`   Database: ${RAILWAY_CONFIG.database}`);
    
    // Create connection (without database first to allow CREATE DATABASE)
    connection = await mysql.createConnection({
      host: RAILWAY_CONFIG.host,
      port: RAILWAY_CONFIG.port,
      user: RAILWAY_CONFIG.user,
      password: RAILWAY_CONFIG.password,
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
          throw error;
        }
      }
    }
    
    console.log(`\n✅ Database setup completed!`);
    console.log(`   ✓ Successful statements: ${successCount}`);
    console.log(`   ⚠️  Skipped statements: ${skipCount}`);
    console.log(`   📊 Total statements: ${statements.length}`);
    
    // Verify tables were created
    console.log('\n📋 Verifying tables created...');
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
      [RAILWAY_CONFIG.database]
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

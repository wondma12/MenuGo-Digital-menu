const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const zlib = require('zlib');
const { promisify } = require('util');

const execPromise = util.promisify(exec);
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menugo_db',
};

const backupDir = path.join(__dirname, '../backups');

// Ensure backup directory exists
const ensureBackupDir = () => {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('✓ Created backup directory');
  }
};

// Generate backup filename
const getBackupFilename = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `backup_${timestamp}.sql`;
};

// Create database backup using mysqldump
const createBackup = async () => {
  const filename = getBackupFilename();
  const backupPath = path.join(backupDir, filename);
  const compressedPath = `${backupPath}.gz`;
  
  // Build mysqldump command
  const mysqldumpCmd = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} --no-tablespaces --single-transaction --routines --triggers --events`;
  
  console.log('Creating database backup...');
  
  try {
    // Execute mysqldump
    const { stdout, stderr } = await execPromise(mysqldumpCmd);
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('mysqldump error:', stderr);
      throw new Error(stderr);
    }
    
    // Write to file
    fs.writeFileSync(backupPath, stdout);
    console.log(`✓ Backup created: ${filename}`);
    
    // Compress backup
    console.log('Compressing backup...');
    const compressed = await gzip(stdout);
    fs.writeFileSync(compressedPath, compressed);
    fs.unlinkSync(backupPath);
    
    const stats = fs.statSync(compressedPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✓ Backup compressed: ${filename}.gz (${fileSizeMB} MB)`);
    
    // Create metadata
    const metadata = {
      backup_file: `${filename}.gz`,
      created_at: new Date().toISOString(),
      size_mb: parseFloat(fileSizeMB),
      database: dbConfig.database,
      host: dbConfig.host,
    };
    
    const metadataPath = `${compressedPath}.meta.json`;
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('✓ Backup metadata saved');
    
    return compressedPath;
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw error;
  }
};

// Clean up old backups (keep last 30 days)
const cleanupOldBackups = () => {
  console.log('\nCleaning up old backups...');
  
  const files = fs.readdirSync(backupDir);
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let deletedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtimeMs < thirtyDaysAgo) {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`✓ Deleted old backup: ${file}`);
    }
  }
  
  console.log(`✓ Cleaned up ${deletedCount} old backup files`);
};

// List available backups
const listBackups = () => {
  console.log('\n========================================');
  console.log('Available Backups');
  console.log('========================================\n');
  
  const files = fs.readdirSync(backupDir);
  const backups = files
    .filter(file => file.endsWith('.sql.gz'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const metadataPath = `${filePath}.meta.json`;
      let metadata = null;
      
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }
      
      return {
        file: file,
        size_mb: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.mtime,
        metadata: metadata,
      };
    })
    .sort((a, b) => b.created - a.created);
  
  if (backups.length === 0) {
    console.log('No backups found');
  } else {
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.file}`);
      console.log(`   Size: ${backup.size_mb} MB`);
      console.log(`   Date: ${backup.created.toLocaleString()}`);
      if (backup.metadata) {
        console.log(`   Database: ${backup.metadata.database}`);
      }
      console.log('');
    });
  }
  
  return backups;
};

// Restore database from backup
const restoreBackup = async (backupFile) => {
  const backupPath = path.join(backupDir, backupFile);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`);
    process.exit(1);
  }
  
  console.log(`\nRestoring database from: ${backupFile}`);
  
  // Read compressed backup
  const compressed = fs.readFileSync(backupPath);
  console.log('Decompressing backup...');
  const sql = await gunzip(compressed);
  
  // Connect to MySQL (without database)
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
  });
  
  try {
    // Drop and recreate database
    console.log(`Dropping database ${dbConfig.database}...`);
    await connection.query(`DROP DATABASE IF EXISTS ${dbConfig.database}`);
    
    console.log(`Creating database ${dbConfig.database}...`);
    await connection.query(`CREATE DATABASE ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    await connection.changeUser({ database: dbConfig.database });
    
    console.log('Restoring data...');
    const statements = sql.toString().split(';');
    
    for (const statement of statements) {
      if (statement.trim().length > 0) {
        try {
          await connection.query(statement);
        } catch (error) {
          // Ignore "database exists" errors during restore
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    }
    
    console.log('✓ Database restored successfully');
    await connection.end();
    
  } catch (error) {
    console.error('Restore failed:', error);
    await connection.end();
    throw error;
  }
};

// Main function
const main = async () => {
  const command = process.argv[2];
  const backupFile = process.argv[3];
  
  ensureBackupDir();
  
  try {
    if (command === 'restore') {
      if (!backupFile) {
        console.error('Please provide a backup file to restore');
        console.log('Usage: node scripts/backupDatabase.js restore <backup_file>');
        process.exit(1);
      }
      await restoreBackup(backupFile);
    } else if (command === 'list') {
      listBackups();
    } else {
      await createBackup();
      cleanupOldBackups();
      
      console.log('\n========================================');
      console.log('Database backup completed successfully!');
      console.log(`Backup location: ${backupDir}`);
      console.log('========================================\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

// Run main function
main();

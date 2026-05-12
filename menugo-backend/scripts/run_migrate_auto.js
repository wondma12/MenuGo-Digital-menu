// Auto migration runner: sets env flags and requires migrateDatabase
process.env.AUTO_CREATE_DB = process.env.AUTO_CREATE_DB || 'true';
process.env.FORCE_RECREATE_DB = process.env.FORCE_RECREATE_DB || 'false';

// Load dotenv so migrate script picks up .env variables
require('dotenv').config();

// Require and run the migration script
require('./migrateDatabase.js');

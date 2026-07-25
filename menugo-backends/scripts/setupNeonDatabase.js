#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { URL } = require('url');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL. Pass it as the first argument or set it in .env.');
  console.error('Example: node scripts/setupNeonDatabase.js "postgresql://user:pass@host:5432/db?sslmode=require"');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'database-postgres.sql');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'db-migrations');
if (!fs.existsSync(schemaPath)) {
  console.error(`❌ Schema file not found: ${schemaPath}`);
  process.exit(1);
}

function parseSqlStatements(rawSql) {
  const lines = rawSql.split(/\r?\n/);
  const statements = [];
  let current = '';
  let delimiter = ';';
  let skippingRoutine = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    const delimiterMatch = trimmed.match(/^DELIMITER\s+(.+)$/i);
    if (delimiterMatch) {
      delimiter = delimiterMatch[1];
      continue;
    }

    if (skippingRoutine) {
      if (/^END\s*;?$/i.test(trimmed)) {
        skippingRoutine = false;
      }
      continue;
    }

    current += `${line}\n`;

    if (trimmed.endsWith(delimiter)) {
      const statement = current.trim();
      current = '';
      if (/^DROP DATABASE IF EXISTS/i.test(statement) || /^CREATE DATABASE/i.test(statement)) {
        continue;
      }
      if (/^DELIMITER/i.test(statement)) {
        continue;
      }
      if (/^(DROP|CREATE)\s+(PROCEDURE|FUNCTION|TRIGGER|EVENT)/i.test(statement)) {
        skippingRoutine = !/^DROP\s+(FUNCTION|PROCEDURE)/i.test(statement);
        console.warn('Skipping unsupported routine statement:', statement.split(/\n/)[0]);
        continue;
      }
      statements.push(statement.replace(new RegExp(`${delimiter.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`), '').trim());
    }
  }

  return statements.filter(Boolean);
}

function getDatabaseNameFromUrl(urlString) {
  const url = new URL(urlString);
  return url.pathname.replace(/^\//, '') || null;
}

function buildAdminConnectionString(urlString) {
  const url = new URL(urlString);
  url.pathname = '/postgres';
  return url.toString();
}

function normalizeSqlForPostgres(sql) {
  let normalized = sql.replace(/`/g, '');
  const tableMatch = normalized.match(/^\s*CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?([^`"\s(]+)[`"]?/i);
  const tableName = tableMatch ? tableMatch[1] : null;
  const inlineIndexes = [];

  normalized = normalized.replace(/,\s*(UNIQUE\s+KEY|KEY|INDEX)\s+[`"]?([^`"(\s]+)[`"]?\s*\(([^)]+)\)/gi, (match, kind, name, cols) => {
    if (!tableName) {
      return '';
    }
    const indexName = name.replace(/[`"]/g, '').trim();
    const columns = cols.replace(/[`"]/g, '').trim();
    const unique = /^UNIQUE/i.test(kind);
    inlineIndexes.push(
      `${unique ? 'CREATE UNIQUE INDEX IF NOT EXISTS' : 'CREATE INDEX IF NOT EXISTS'} ${indexName} ON ${tableName} (${columns});`
    );
    return '';
  });

  normalized = normalized.replace(/\bINT\s+PRIMARY\s+KEY\s+AUTO_INCREMENT\b/gi, 'SERIAL PRIMARY KEY');
  normalized = normalized.replace(/\bINT\s+AUTO_INCREMENT\b/gi, 'SERIAL');
  normalized = normalized.replace(/\bAUTO_INCREMENT\b/gi, '');
  normalized = normalized.replace(/\bDATETIME\b/gi, 'TIMESTAMP');
  normalized = normalized.replace(/\bUNSIGNED\b/gi, '');
  normalized = normalized.replace(/\bENGINE\s*=\s*[^\s;]+/gi, '');
  normalized = normalized.replace(/\bDEFAULT\s+CHARSET\s*=\s*[^\s;]+/gi, '');
  normalized = normalized.replace(/\bCHARACTER SET\s+[^\s;]+/gi, '');
  normalized = normalized.replace(/\bCOLLATE(?:\s*=\s*|\s+)[^\s;]+/gi, '');
  normalized = normalized.replace(/\bON UPDATE CURRENT_TIMESTAMP\b/gi, '');
  normalized = normalized.replace(/\bAFTER\s+[^,;\n]+/gi, '');
  normalized = normalized.replace(/\bDEFAULT\s*\(\s*UUID\(\)\s*\)/gi, 'DEFAULT gen_random_uuid()');
  normalized = normalized.replace(/\bCHAR_LENGTH\s*\(\s*([^)]+?)\s*\)/gi, 'length(CAST($1 AS text))');
  normalized = normalized.replace(/\bJSON\b/gi, 'JSONB');
  normalized = normalized.replace(/\bCHAR\(36\)\s+PRIMARY\s+KEY\s+DEFAULT\s*gen_random_uuid\(\)/gi, 'UUID PRIMARY KEY DEFAULT gen_random_uuid()');
  normalized = normalized.replace(/\bCHAR\(36\)\s+NOT\s+NULL\s+DEFAULT\s*gen_random_uuid\(\)/gi, 'UUID NOT NULL DEFAULT gen_random_uuid()');
  normalized = normalized.replace(/\bCHAR\(36\)\b/gi, 'UUID');
  normalized = normalized.replace(/\bMODIFY\s+COLUMN\b/gi, 'ALTER COLUMN');
  normalized = normalized.replace(/\bALTER\s+COLUMN\s+([`"]?\w+[`"]?)\s+CHAR\(36\)(?:\s+CHARACTER SET\s+\S+)?(?:\s+COLLATE\s+\S+)?(?:\s+(?:NOT\s+NULL|NULL))?/gi, 'ALTER COLUMN $1 TYPE UUID USING $1::uuid');
  normalized = normalized.replace(/(\b[\w]+\b)\s+ENUM\s*\(([^)]+)\)/gi, (_, column, values) => {
    return `${column} VARCHAR(255) CHECK (${column} IN (${values}))`;
  });
  normalized = normalized.replace(/\s+;$/, ';');
  normalized = normalized.trim();

  if (inlineIndexes.length > 0) {
    return [normalized, ...inlineIndexes];
  }
  return normalized;
}

async function createDatabaseIfMissing(targetDb) {
  const adminConnectionString = buildAdminConnectionString(DATABASE_URL);
  const adminPool = new Pool({ connectionString: adminConnectionString, ssl: { rejectUnauthorized: false } });
  const adminClient = await adminPool.connect();

  try {
    const exists = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    if (exists.rowCount === 0) {
      console.log(`📁 Database '${targetDb}' does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE "${targetDb}" ENCODING 'UTF8' TEMPLATE template0`);
      console.log(`✅ Created database '${targetDb}'.`);
    } else {
      console.log(`✅ Database '${targetDb}' already exists.`);
    }
  } finally {
    adminClient.release();
    await adminPool.end();
  }
}

function isIgnorablePgError(error) {
  if (!error || !error.code) return false;
  return [
    '42P07', // duplicate_table
    '42710', // duplicate_object
    '42701', // duplicate_column
    '42P16', // invalid_table_definition (sometimes due to duplicate constraint)
    '42723', // duplicate_function
    '23505', // unique_violation (duplicate key value)
    '42712', // duplicate_alias
    '42701', // duplicate_column
  ].includes(error.code);
}

async function loadSchema() {
  const rawSql = fs.readFileSync(schemaPath, 'utf8');
  return parseSqlStatements(rawSql);
}

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

async function applyMigrationFiles(client) {
  const migrationFiles = getMigrationFiles();
  if (migrationFiles.length === 0) {
    console.log('📂 No .sql migration files found in db-migrations folder. Skipping migrations.');
    return;
  }

  console.log(`📂 Applying ${migrationFiles.length} db-migrations file(s)...`);
  for (const fileName of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, fileName);
    const rawSql = fs.readFileSync(filePath, 'utf8');
    const statements = parseSqlStatements(rawSql);
    console.log(`
📄 ${fileName} (${statements.length} statements)`);

    for (let index = 0; index < statements.length; index += 1) {
      const statement = statements[index].trim();
      if (!statement) continue;
      const normalized = normalizeSqlForPostgres(statement);
      if (!normalized) continue;
      const normalizedStatements = Array.isArray(normalized) ? normalized : [normalized];

      for (const stmt of normalizedStatements) {
        try {
          await client.query(stmt);
        } catch (error) {
          const text = (error.message || '').toString();
          const isDropNonexistent = /DROP\s+(CONSTRAINT|INDEX|TABLE|VIEW|FUNCTION)/i.test(stmt) && /does not exist/i.test(text);
          if (
            isIgnorablePgError(error) ||
            /already exists|duplicate key value|duplicate column|duplicate relation/i.test(text) ||
            isDropNonexistent
          ) {
            console.warn(`⚠️ Skipped existing object for ${fileName} statement ${index + 1}: ${stmt.split(/\n/)[0]}`);
            continue;
          }

          console.error(`❌ Failed ${fileName} statement ${index + 1}: ${stmt.slice(0, 120).replace(/\s+/g, ' ')}...`);
          throw error;
        }
      }
    }
  }

  console.log('\n✅ db-migrations SQL files applied successfully.');
}

async function run() {
  const targetDb = getDatabaseNameFromUrl(DATABASE_URL);
  if (!targetDb) {
    console.error('❌ DATABASE_URL must include a target database name.');
    process.exit(1);
  }

  await createDatabaseIfMissing(targetDb);

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
    console.log('🔧 Connecting to Neon Postgres database...');
    await client.query('SELECT 1');

    const statements = await loadSchema();
    console.log(`📄 Loaded schema from ${schemaPath} (${statements.length} statements)`);
    console.log('🚀 Applying schema...');

    for (let i = 0; i < statements.length; i += 1) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
      } catch (error) {
        if (isIgnorablePgError(error)) {
          console.warn(`⚠️ Skipped existing object for statement ${i + 1}: ${stmt.split(/\n/)[0]}`);
          continue;
        }
        console.error(`❌ Failed statement ${i + 1}: ${stmt.slice(0, 120).replace(/\s+/g, ' ')}...`);
        throw error;
      }
    }

    console.log('✅ PostgreSQL schema applied successfully.');
    await applyMigrationFiles(client);
  } catch (error) {
    console.error('❌ Failed to initialize database:');
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();

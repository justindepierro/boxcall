#!/usr/bin/env node

/**
 * BoxCall Migration Executor
 * Runs migrations using Node.js postgres client
 * 
 * Usage: node migrate.js database/migrations/008_add_coverage_tracking.sql
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const log = (msg, color = 'reset') => console.log(`${c[color]}${msg}${c.reset}`);

async function executeMigration(migrationPath) {
  try {
    log('\n🚀 BoxCall Migration Executor', 'cyan');
    log('═══════════════════════════════════════\n', 'cyan');

    // Check if file exists
    const fullPath = join(__dirname, migrationPath);
    if (!existsSync(fullPath)) {
      log(`❌ Migration file not found: ${migrationPath}`, 'red');
      process.exit(1);
    }

    // Read migration file
    log(`📄 Reading: ${migrationPath}`, 'blue');
    const sql = readFileSync(fullPath, 'utf-8').trim();

    if (!sql) {
      log('❌ Migration file is empty', 'red');
      process.exit(1);
    }

    const lines = sql.split('\n').length;
    log(`✓ Loaded ${lines} lines of SQL\n`, 'green');

    // Show preview
    log('📋 SQL Preview:', 'cyan');
    log('─'.repeat(50), 'dim');
    const preview = sql.split('\n').slice(0, 15).join('\n');
    console.log(preview);
    if (lines > 15) log('... (truncated)', 'dim');
    log('─'.repeat(50) + '\n', 'dim');

    // Get database URL
    const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
    
    if (!dbUrl) {
      log('⚠️  DATABASE_URL not found in .env', 'yellow');
      log('\nAdd your database connection string to .env:', 'yellow');
      log('DATABASE_URL=postgresql://...\n', 'cyan');
      log('Get it from: https://supabase.com/dashboard/project/_/settings/database', 'dim');
      log('Look for "Connection string" > "URI" tab', 'dim');
      log('\nOr use the SQL Editor:', 'yellow');
      log('   npm run db:sql\n', 'cyan');
      process.exit(1);
    }

    // Execute migration using Node.js postgres client
    log('🔌 Connecting to database...', 'blue');
    
    const { Client } = pg;
    const client = new Client({ 
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
      await client.connect();
      log('✓ Connected successfully', 'green');
      
      log('\n📤 Executing migration...', 'yellow');
      log('─'.repeat(50) + '\n', 'dim');
      
      await client.query(sql);
      
      log('─'.repeat(50), 'dim');
      log('\n✅ Migration executed successfully!', 'green');
      log('═══════════════════════════════════════\n', 'cyan');
      
    } catch (error) {
      log('\n─'.repeat(50), 'dim');
      log('\n❌ Migration failed', 'red');
      log(`Error: ${error.message}\n`, 'red');
      
      if (error.message.includes('password')) {
        log('💡 Check your database password in DATABASE_URL', 'yellow');
        log('   Get it from: https://supabase.com/dashboard/project/_/settings/database\n', 'dim');
      } else if (error.message.includes('connect') || error.message.includes('ENOTFOUND')) {
        log('💡 Check your database connection string format', 'yellow');
        log('   Expected: postgresql://postgres.[project]:[password]@[host]:[port]/postgres\n', 'dim');
      } else if (error.message.includes('syntax')) {
        log('💡 SQL syntax error in migration file', 'yellow');
        log(`   Line: ${error.message}\n`, 'dim');
      }
      
      log('═══════════════════════════════════════\n', 'cyan');
      process.exit(1);
    } finally {
      await client.end();
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Main
const migrationPath = process.argv[2];

if (!migrationPath) {
  log('❌ Usage: node migrate.js <migration-file>', 'red');
  log('Example: node migrate.js database/migrations/008_add_coverage_tracking.sql\n', 'yellow');
  process.exit(1);
}

executeMigration(migrationPath);

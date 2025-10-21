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

    // Check for Supabase CLI
    log('� Checking for Supabase CLI...', 'blue');
    const hasSupabaseCLI = await checkSupabaseCLI();

    if (!hasSupabaseCLI) {
      log('❌ Supabase CLI not found', 'red');
      log('\n💡 Install it with:', 'yellow');
      log('   brew install supabase/tap/supabase', 'cyan');
      log('\nOr use the SQL Editor:', 'yellow');
      log('   npm run db:sql\n', 'cyan');
      process.exit(1);
    }

    log('✓ Supabase CLI found\n', 'green');

    // Get database URL
    const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
    
    if (!dbUrl) {
      log('⚠️  DATABASE_URL not found in .env', 'yellow');
      log('\nYou can get it from:', 'yellow');
      log('https://supabase.com/dashboard/project/_/settings/database', 'cyan');
      log('\nOr use the SQL Editor instead:', 'yellow');
      log('   npm run db:sql\n', 'cyan');
      process.exit(1);
    }

    // Execute migration using Supabase CLI
    log('📤 Executing migration with Supabase CLI...', 'yellow');
    log('─'.repeat(50) + '\n', 'dim');

    const migrate = spawn('psql', [dbUrl, '-f', fullPath], {
      stdio: 'inherit'
    });

    migrate.on('close', (code) => {
      if (code === 0) {
        log('\n─'.repeat(50), 'dim');
        log('\n✅ Migration executed successfully!', 'green');
        log('═══════════════════════════════════════\n', 'cyan');
      } else {
        log('\n─'.repeat(50), 'dim');
        log('\n❌ Migration failed', 'red');
        log('═══════════════════════════════════════\n', 'cyan');
        process.exit(1);
      }
    });

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

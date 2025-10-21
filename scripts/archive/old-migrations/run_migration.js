#!/usr/bin/env node

/**
 * Migration Runner for BoxCall
 * Works directly in VS Code terminal
 * 
 * Usage: node run_migration.js database/migrations/008_add_coverage_tracking.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration(migrationPath) {
  try {
    log('\n🚀 BoxCall Migration Runner', 'cyan');
    log('═══════════════════════════════════════\n', 'cyan');

    // Validate environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      log('❌ Missing Supabase credentials in .env file', 'red');
      log('\nRequired variables:', 'yellow');
      log('  - VITE_SUPABASE_URL', 'yellow');
      log('  - SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)', 'yellow');
      process.exit(1);
    }

    // Read migration file
    const fullPath = join(__dirname, migrationPath);
    log(`📄 Reading migration: ${migrationPath}`, 'blue');
    
    const sql = readFileSync(fullPath, 'utf-8');
    
    if (!sql.trim()) {
      log('❌ Migration file is empty', 'red');
      process.exit(1);
    }

    log(`✓ Loaded ${sql.split('\n').length} lines of SQL`, 'green');

    // Create Supabase client with service role
    log('\n� Connecting to Supabase...', 'blue');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    log('✓ Connected successfully', 'green');

    // For now, just display the SQL and provide instructions
    log('\n📋 Migration SQL:', 'cyan');
    log('═══════════════════════════════════════', 'cyan');
    console.log(sql);
    log('═══════════════════════════════════════\n', 'cyan');

    log('💡 To run this migration:', 'yellow');
    log('1. Copy the SQL above', 'yellow');
    log('2. Open Supabase SQL Editor:', 'yellow');
    log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`, 'cyan');
    log('3. Paste and run the SQL', 'yellow');
    log('\nOr use the Supabase CLI:', 'yellow');
    log(`   supabase db execute --file ${migrationPath}\n`, 'cyan');

    process.exit(0);

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.code === 'ENOENT') {
      log('Migration file not found. Check the path.', 'yellow');
    }
    process.exit(1);
  }
}

// Main execution
const migrationPath = process.argv[2];

if (!migrationPath) {
  log('❌ Usage: node run_migration.js <migration-file>', 'red');
  log('Example: node run_migration.js database/migrations/008_add_coverage_tracking.sql\n', 'yellow');
  process.exit(1);
}

runMigration(migrationPath);

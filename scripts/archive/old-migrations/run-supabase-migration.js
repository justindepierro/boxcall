#!/usr/bin/env node

/**
 * Run migration using Supabase CLI
 * Works with linked Supabase project
 */

import { readFileSync, copyFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const log = (msg, color = 'reset') => console.log(`${c[color]}${msg}${c.reset}`);

async function runWithSupabaseCLI(migrationPath) {
  try {
    log('\n🚀 Running Migration with Supabase CLI', 'cyan');
    log('═══════════════════════════════════════\n', 'cyan');

    const fullPath = join(__dirname, migrationPath);
    if (!existsSync(fullPath)) {
      log(`❌ Migration file not found: ${migrationPath}`, 'red');
      process.exit(1);
    }

    // Read and show preview
    const sql = readFileSync(fullPath, 'utf-8');
    const lines = sql.split('\n').length;
    log(`📄 Migration: ${basename(migrationPath)}`, 'blue');
    log(`✓ ${lines} lines of SQL\n`, 'green');

    // Show preview
    log('📋 Preview:', 'cyan');
    log('─'.repeat(50), 'dim');
    const preview = sql.split('\n').slice(0, 10).join('\n');
    console.log(preview);
    if (lines > 10) log('... (truncated)', 'dim');
    log('─'.repeat(50) + '\n', 'dim');

    // Create temporary migration in supabase/migrations
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0].replace(/-/g, '') + 
                     now.toISOString().split('T')[1].slice(0, 6).replace(/:/g, '');
    const tempMigrationName = `${timestamp}_temp_migration.sql`;
    const supabaseMigrationsDir = join(__dirname, 'supabase', 'migrations');
    
    // Ensure directory exists
    if (!existsSync(supabaseMigrationsDir)) {
      mkdirSync(supabaseMigrationsDir, { recursive: true });
    }
    
    const tempMigrationPath = join(supabaseMigrationsDir, tempMigrationName);
    
    log('📤 Pushing to Supabase...', 'yellow');
    copyFileSync(fullPath, tempMigrationPath);

    const push = spawn('supabase', ['db', 'push', '--password', process.env.DATABASE_PASSWORD || 'N3v3rsayd1e1715', '--include-all'], {
      stdio: 'inherit',
      cwd: __dirname
    });

    push.on('close', (code) => {
      // Clean up temp file
      if (existsSync(tempMigrationPath)) {
        unlinkSync(tempMigrationPath);
      }

      if (code === 0) {
        log('\n✅ Migration executed successfully!', 'green');
        log('═══════════════════════════════════════\n', 'cyan');
      } else {
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

const migrationPath = process.argv[2];

if (!migrationPath) {
  log('❌ Usage: node run-supabase-migration.js <migration-file>', 'red');
  log('Example: node run-supabase-migration.js database/migrations/008_add_coverage_tracking.sql\n', 'yellow');
  process.exit(1);
}

runWithSupabaseCLI(migrationPath);

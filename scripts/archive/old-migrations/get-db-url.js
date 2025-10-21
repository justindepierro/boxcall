#!/usr/bin/env node

/**
 * Get your Supabase database connection string
 * This will help you set up DATABASE_URL in .env
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

const log = (msg, color = 'reset') => console.log(`${c[color]}${msg}${c.reset}`);

async function getConnectionInfo() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    log('❌ VITE_SUPABASE_URL not found in .env', 'red');
    process.exit(1);
  }

  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    log('❌ Invalid VITE_SUPABASE_URL format', 'red');
    process.exit(1);
  }
  
  const projectRef = match[1];

  log('\n📋 Supabase Database Connection Setup', 'cyan');
  log('═'.repeat(50) + '\n', 'cyan');

  log('Your project reference: ' + projectRef, 'green');
  log('\n📍 To get your database password:', 'yellow');
  log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/settings/database', 'cyan');
  log('2. Scroll down to "Database Settings"', 'cyan');
  log('3. Find "Database password" and click "Reset Database Password" if needed', 'cyan');
  log('4. Copy the password\n', 'cyan');

  log('📝 Once you have the password, add this to your .env file:\n', 'yellow');
  
  log('DATABASE_URL=postgresql://postgres.XXXXXXXXXXXXXXXXXXXX:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres', 'bright');
  
  log('\n💡 Or use this direct connection format:', 'yellow');
  log(`DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`, 'bright');
  
  log('\n✅ After adding DATABASE_URL, you can run:', 'green');
  log('   npm run db:migrate:run database/migrations/008_add_coverage_tracking.sql\n', 'cyan');
}

getConnectionInfo();

#!/usr/bin/env node

/**
 * Test database connection and find the correct format
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${c[color]}${msg}${c.reset}`);

async function testConnection(url, label) {
  return new Promise((resolve) => {
    log(`\n🔍 Testing: ${label}`, 'cyan');
    log(`   ${url.replace(/:[^:@]+@/, ':****@')}`, 'yellow');
    
    const psql = spawn('psql', [url, '-c', 'SELECT version();'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    psql.stdout.on('data', (data) => {
      output += data.toString();
    });

    psql.stderr.on('data', (data) => {
      output += data.toString();
    });

    psql.on('close', (code) => {
      if (code === 0) {
        log('✅ SUCCESS!', 'green');
        resolve(true);
      } else {
        log(`❌ Failed: ${output.split('\n')[0]}`, 'red');
        resolve(false);
      }
    });
  });
}

async function findWorkingConnection() {
  log('\n🔌 Testing Database Connections', 'cyan');
  log('═'.repeat(50) + '\n', 'cyan');

  const projectRef = 'lvmuiqwihlpnwppdqqfl';
  const password = 'N3v3rsayd1e1715';

  // Test different connection formats
  const formats = [
    {
      label: 'Direct connection (IPv6)',
      url: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`
    },
    {
      label: 'Direct connection (IPv4)',
      url: `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:5432/${projectRef}`
    },
    {
      label: 'Pooler connection (Transaction)',
      url: `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    },
    {
      label: 'Pooler connection (Session)',
      url: `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
    },
    {
      label: 'Direct with project in username',
      url: `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`
    }
  ];

  for (const format of formats) {
    const success = await testConnection(format.url, format.label);
    if (success) {
      log('\n🎉 Found working connection!', 'green');
      log('\nAdd this to your .env:', 'yellow');
      log(`DATABASE_URL=${format.url}\n`, 'cyan');
      return format.url;
    }
  }

  log('\n❌ None of the connection formats worked', 'red');
  log('\n💡 Please get the connection string from:', 'yellow');
  log('https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl/settings/database', 'cyan');
  log('Look for "Connection string" and choose "URI" format\n', 'yellow');
}

findWorkingConnection();
